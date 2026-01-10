import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  userId?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message, userId }: ContactRequest = await req.json();

    // Validate inputs
    if (!name || name.trim().length === 0 || name.length > 100) {
      throw new Error("Name is required and must be less than 100 characters");
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
      throw new Error("Valid email is required");
    }
    if (!subject || subject.trim().length === 0 || subject.length > 200) {
      throw new Error("Subject is required and must be less than 200 characters");
    }
    if (!message || message.trim().length === 0 || message.length > 5000) {
      throw new Error("Message is required and must be less than 5000 characters");
    }

    // Send email to H2H team
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "FlowOS Contact <hello@theh2hexperiment.com>",
        to: ["hello@theh2hexperiment.com"],
        reply_to: email,
        subject: `[FlowOS Contact] ${subject}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
              <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding: 32px; text-align: center;">
                <h1 style="margin: 0; color: #f0e6d3; font-size: 24px; font-weight: 300; letter-spacing: 2px;">FLOWOS</h1>
                <p style="margin: 8px 0 0 0; color: #c9a959; font-size: 14px; letter-spacing: 1px;">NEW CONTACT MESSAGE</p>
              </div>
              
              <div style="padding: 32px;">
                <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                  <h3 style="margin: 0 0 16px 0; color: #1a1a2e;">Contact Details</h3>
                  <p style="margin: 8px 0; color: #555;"><strong>Name:</strong> ${name}</p>
                  <p style="margin: 8px 0; color: #555;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #6B5B95;">${email}</a></p>
                  ${userId ? `<p style="margin: 8px 0; color: #888; font-size: 12px;"><strong>User ID:</strong> ${userId}</p>` : '<p style="margin: 8px 0; color: #888; font-size: 12px;">(Not logged in)</p>'}
                </div>
                
                <div style="margin-bottom: 24px;">
                  <h3 style="margin: 0 0 12px 0; color: #1a1a2e;">Subject</h3>
                  <p style="margin: 0; color: #333; font-size: 16px;">${subject}</p>
                </div>
                
                <div>
                  <h3 style="margin: 0 0 12px 0; color: #1a1a2e;">Message</h3>
                  <div style="background: #fafafa; border-left: 4px solid #c9a959; padding: 16px; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0; color: #333; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                  </div>
                </div>
              </div>
              
              <div style="padding: 24px; background: #f8f8f8; text-align: center;">
                <p style="margin: 0; color: #888; font-size: 12px;">
                  This message was sent via FlowOS Contact Form
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
      console.error("Resend API error:", emailData);
      throw new Error(`Failed to send email: ${JSON.stringify(emailData)}`);
    }

    // Send confirmation to user
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "The H2H Experiment <hello@theh2hexperiment.com>",
        to: [email],
        subject: "We received your message!",
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
                <h1 style="margin: 0; color: #f0e6d3; font-size: 28px; font-weight: 300; letter-spacing: 2px;">THANK YOU</h1>
                <p style="margin: 8px 0 0 0; color: #c9a959; font-size: 14px; letter-spacing: 1px;">WE'VE RECEIVED YOUR MESSAGE</p>
              </div>
              
              <div style="padding: 32px;">
                <h2 style="margin: 0 0 16px 0; color: #1a1a2e; font-size: 24px;">Hi ${name},</h2>
                <p style="color: #555; line-height: 1.6;">
                  Thank you for reaching out to The H2H Experiment team. We've received your message and will get back to you as soon as possible.
                </p>
                
                <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 24px 0;">
                  <p style="margin: 0 0 8px 0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Your Message</p>
                  <p style="margin: 0; color: #333; font-style: italic;">"${subject}"</p>
                </div>
                
                <p style="color: #555; line-height: 1.6;">
                  In the meantime, continue your journey with FlowOS and The Architect.
                </p>
                
                <p style="color: #555; line-height: 1.6; margin-top: 24px;">
                  Warm regards,<br>
                  <strong>The H2H Experiment Team</strong>
                </p>
              </div>
              
              <div style="padding: 24px; background: #1a1a2e; text-align: center;">
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

    return new Response(
      JSON.stringify({ success: true, message: "Message sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in contact-us:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
