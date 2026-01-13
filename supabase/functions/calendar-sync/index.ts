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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, accessToken, refreshToken, expiresIn, eventId, impactRating, reflection } = await req.json();

    switch (action) {
      case "save_tokens": {
        // Save Google OAuth tokens
        const tokenExpiry = new Date(Date.now() + expiresIn * 1000).toISOString();
        
        const { error } = await supabase
          .from("google_tokens")
          .upsert({
            user_id: user.id,
            access_token: accessToken,
            refresh_token: refreshToken || null,
            token_expiry: tokenExpiry,
          }, { onConflict: 'user_id' });

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "fetch_events": {
        // Get stored tokens
        const { data: tokenData, error: tokenError } = await supabase
          .from("google_tokens")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (tokenError || !tokenData) {
          return new Response(JSON.stringify({ error: "No calendar connected", needsAuth: true }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Check if token is expired and refresh if needed
        let currentToken = tokenData.access_token;
        if (new Date(tokenData.token_expiry) < new Date()) {
          if (!tokenData.refresh_token) {
            return new Response(JSON.stringify({ error: "Token expired, please reconnect", needsAuth: true }), {
              status: 401,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          // Would need Google OAuth refresh here - for now return need auth
          return new Response(JSON.stringify({ error: "Token expired, please reconnect", needsAuth: true }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Fetch calendar events from Google
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const calendarResponse = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
          `timeMin=${now.toISOString()}&timeMax=${weekFromNow.toISOString()}&singleEvents=true&orderBy=startTime`,
          {
            headers: {
              Authorization: `Bearer ${currentToken}`,
            },
          }
        );

        if (!calendarResponse.ok) {
          const errorText = await calendarResponse.text();
          console.error("Google Calendar API error:", errorText);
          return new Response(JSON.stringify({ error: "Failed to fetch calendar events", needsAuth: true }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const calendarData = await calendarResponse.json();
        const events = calendarData.items || [];

        // Get existing event data from our DB
        const { data: existingEvents } = await supabase
          .from("calendar_events")
          .select("*")
          .eq("user_id", user.id);

        const existingMap = new Map(existingEvents?.map(e => [e.google_event_id, e]) || []);

        // Merge Google events with our stored data
        const mergedEvents = events.map((event: any) => {
          const existing = existingMap.get(event.id);
          return {
            google_event_id: event.id,
            title: event.summary || "Untitled Event",
            description: event.description || null,
            start_time: event.start?.dateTime || event.start?.date,
            end_time: event.end?.dateTime || event.end?.date,
            location: event.location || null,
            attendees: event.attendees || [],
            impact_rating: existing?.impact_rating || null,
            pre_meeting_insight: existing?.pre_meeting_insight || null,
            post_meeting_reflection: existing?.post_meeting_reflection || null,
          };
        });

        return new Response(JSON.stringify({ events: mergedEvents }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "rate_event": {
        // Update or insert event with rating
        const { data: existingEvent } = await supabase
          .from("calendar_events")
          .select("*")
          .eq("user_id", user.id)
          .eq("google_event_id", eventId)
          .single();

        if (existingEvent) {
          const { error } = await supabase
            .from("calendar_events")
            .update({ impact_rating: impactRating })
            .eq("id", existingEvent.id);
          if (error) throw error;
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "add_reflection": {
        const { data: existingEvent } = await supabase
          .from("calendar_events")
          .select("*")
          .eq("user_id", user.id)
          .eq("google_event_id", eventId)
          .single();

        if (existingEvent) {
          const { error } = await supabase
            .from("calendar_events")
            .update({ post_meeting_reflection: reflection })
            .eq("id", existingEvent.id);
          if (error) throw error;
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "disconnect": {
        await supabase
          .from("google_tokens")
          .delete()
          .eq("user_id", user.id);

        await supabase
          .from("calendar_events")
          .delete()
          .eq("user_id", user.id);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error: unknown) {
    console.error("Calendar sync error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
