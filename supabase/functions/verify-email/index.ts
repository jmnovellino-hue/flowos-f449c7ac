import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      throw new Error("Verification token is required");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find profile with this token
    const { data: profile, error: findError } = await supabase
      .from("profiles")
      .select("user_id, email, email_verification_sent_at")
      .eq("email_verification_token", token)
      .single();

    if (findError || !profile) {
      throw new Error("Invalid or expired verification token");
    }

    // Check if token is older than 24 hours
    const sentAt = new Date(profile.email_verification_sent_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - sentAt.getTime()) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      throw new Error("Verification link has expired. Please request a new one.");
    }

    // Mark email as verified
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        email_verified: true,
        email_verification_token: null,
      })
      .eq("user_id", profile.user_id);

    if (updateError) {
      throw new Error(`Failed to verify email: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email verified successfully",
        email: profile.email 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in verify-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
