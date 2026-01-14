import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const { action } = await req.json().catch(() => ({ action: url.searchParams.get('action') }));
    
    const googleClientId = Deno.env.get("GOOGLE_CLIENT_ID");
    const googleClientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
    
    if (!googleClientId || !googleClientSecret) {
      return new Response(
        JSON.stringify({ 
          error: "Google OAuth not configured", 
          message: "Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your backend secrets."
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (action) {
      case "get_auth_url": {
        // Get the redirect URI from the request or use a default
        const body = await req.json().catch(() => ({}));
        const redirectUri = body.redirectUri || `${supabaseUrl}/functions/v1/google-calendar-auth/callback`;
        
        // Build Google OAuth URL with Calendar scope
        const scopes = [
          "https://www.googleapis.com/auth/calendar.readonly",
          "https://www.googleapis.com/auth/calendar.events.readonly",
        ].join(" ");
        
        const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
        authUrl.searchParams.set("client_id", googleClientId);
        authUrl.searchParams.set("redirect_uri", redirectUri);
        authUrl.searchParams.set("response_type", "code");
        authUrl.searchParams.set("scope", scopes);
        authUrl.searchParams.set("access_type", "offline");
        authUrl.searchParams.set("prompt", "consent");
        
        // Include state parameter for security (should include user ID in real implementation)
        const state = crypto.randomUUID();
        authUrl.searchParams.set("state", state);
        
        return new Response(
          JSON.stringify({ authUrl: authUrl.toString(), state }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "exchange_code": {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        
        if (userError || !user) {
          return new Response(JSON.stringify({ error: "Invalid token" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const body = await req.json();
        const { code, redirectUri } = body;
        
        if (!code) {
          return new Response(JSON.stringify({ error: "Authorization code required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Exchange code for tokens
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: googleClientId,
            client_secret: googleClientSecret,
            code,
            grant_type: "authorization_code",
            redirect_uri: redirectUri,
          }),
        });

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.text();
          console.error("Token exchange failed:", errorData);
          return new Response(
            JSON.stringify({ error: "Failed to exchange authorization code" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const tokens = await tokenResponse.json();
        
        // Calculate token expiry
        const tokenExpiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
        
        // Save tokens to database
        const { error: saveError } = await supabase
          .from("google_tokens")
          .upsert({
            user_id: user.id,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token || null,
            token_expiry: tokenExpiry,
          }, { onConflict: 'user_id' });

        if (saveError) {
          console.error("Failed to save tokens:", saveError);
          return new Response(
            JSON.stringify({ error: "Failed to save tokens" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, message: "Calendar connected successfully" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "refresh_token": {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        
        if (userError || !user) {
          return new Response(JSON.stringify({ error: "Invalid token" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get stored refresh token
        const { data: tokenData, error: tokenError } = await supabase
          .from("google_tokens")
          .select("refresh_token")
          .eq("user_id", user.id)
          .single();

        if (tokenError || !tokenData?.refresh_token) {
          return new Response(
            JSON.stringify({ error: "No refresh token available", needsAuth: true }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Refresh the token
        const refreshResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: googleClientId,
            client_secret: googleClientSecret,
            refresh_token: tokenData.refresh_token,
            grant_type: "refresh_token",
          }),
        });

        if (!refreshResponse.ok) {
          const errorData = await refreshResponse.text();
          console.error("Token refresh failed:", errorData);
          return new Response(
            JSON.stringify({ error: "Failed to refresh token", needsAuth: true }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const newTokens = await refreshResponse.json();
        const tokenExpiry = new Date(Date.now() + newTokens.expires_in * 1000).toISOString();
        
        // Update stored tokens
        const { error: updateError } = await supabase
          .from("google_tokens")
          .update({
            access_token: newTokens.access_token,
            token_expiry: tokenExpiry,
          })
          .eq("user_id", user.id);

        if (updateError) {
          console.error("Failed to update tokens:", updateError);
        }

        return new Response(
          JSON.stringify({ success: true, access_token: newTokens.access_token }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error: unknown) {
    console.error("Google Calendar Auth error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
