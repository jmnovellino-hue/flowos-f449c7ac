import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!
    ).auth.getUser(token);

    if (userError || !user) {
      throw new Error("Invalid user token");
    }

    const { email } = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    // Generate verification token
    const verificationToken = crypto.randomUUID();

    // Update profile with token
    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({
        email,
        email_verification_token: verificationToken,
        email_verification_sent_at: new Date().toISOString(),
        email_verified: false,
      })
      .eq("user_id", user.id);

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    // Create verification link - use the project URL
    const projectUrl = Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", "") || "";
    const appUrl = `https://fjiwlffbtijxzhreqrst.lovableproject.com`;
    const verificationLink = `${appUrl}?verify_email=${verificationToken}`;

    // Send verification email
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "FlowOS <hello@theh2hexperiment.com>",
        to: [email],
        subject: "Verify your email for Weekly Wisdom Digest",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
              <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding: 40px 32px; text-align: center;">
                <h1 style="margin: 0; color: #f0e6d3; font-size: 28px; font-weight: 300; letter-spacing: 2px;">FLOWOS</h1>
                <p style="margin: 8px 0 0 0; color: #c9a959; font-size: 14px; letter-spacing: 1px;">EMAIL VERIFICATION</p>
              </div>
              
              <div style="padding: 32px;">
                <h2 style="margin: 0 0 16px 0; color: #1a1a2e; font-size: 24px;">Verify Your Email</h2>
                <p style="color: #555; line-height: 1.6;">
                  Click the button below to verify your email address and start receiving your Weekly Wisdom Digest.
                </p>
                
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${verificationLink}" style="display: inline-block; background: linear-gradient(135deg, #c9a959 0%, #b8942d 100%); color: #1a1a2e; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    Verify Email Address
                  </a>
                </div>
                
                <p style="color: #888; font-size: 14px; line-height: 1.6;">
                  If you didn't request this, you can safely ignore this email.
                </p>
                
                <p style="color: #888; font-size: 12px; margin-top: 24px;">
                  Or copy and paste this link: <br>
                  <a href="${verificationLink}" style="color: #6B5B95;">${verificationLink}</a>
                </p>
              </div>
              
              <div style="padding: 24px; background: #f8f8f8; text-align: center;">
                <p style="margin: 0; color: #888; font-size: 12px;">
                  FlowOS — Build your life, not just live it.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      throw new Error(`Failed to send email: ${JSON.stringify(emailData)}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Verification email sent" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-verification-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
