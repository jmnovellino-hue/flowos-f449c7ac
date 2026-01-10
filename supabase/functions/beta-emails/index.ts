import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'welcome' | 'feedback_request' | 'not_qualified';
  email: string;
  name: string;
  matchPercentage?: number;
}

const getWelcomeEmail = (name: string, matchPercentage: number) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to FlowOS Beta</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0c14; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0c14; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #12151f; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid rgba(45, 212, 191, 0.2);">
              <h1 style="margin: 0; font-size: 28px; color: #2dd4bf; font-family: Georgia, serif;">FlowOS</h1>
              <p style="margin: 8px 0 0; color: #64748b; font-size: 14px;">H2H Inner Lab</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; background: linear-gradient(135deg, rgba(45, 212, 191, 0.2), rgba(45, 212, 191, 0.05)); border: 1px solid rgba(45, 212, 191, 0.3); border-radius: 50px; padding: 8px 20px;">
                  <span style="color: #2dd4bf; font-size: 14px; font-weight: 500;">✨ ${matchPercentage}% Profile Match</span>
                </div>
              </div>
              
              <h2 style="margin: 0 0 20px; color: #e2e8f0; font-size: 24px; font-family: Georgia, serif; text-align: center;">
                Welcome to the Beta, ${name}!
              </h2>
              
              <p style="margin: 0 0 20px; color: #94a3b8; font-size: 16px; line-height: 1.6;">
                Congratulations! Your assessment results show an exceptional alignment with the leaders FlowOS was designed for. You've been granted exclusive access to our beta program.
              </p>
              
              <p style="margin: 0 0 30px; color: #94a3b8; font-size: 16px; line-height: 1.6;">
                FlowOS is more than an app—it's your personal operating system for mastering the internal architecture that drives exceptional leadership.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="https://flowos.lovable.app/beta/launch" 
                       style="display: inline-block; background: linear-gradient(135deg, #2dd4bf, #14b8a6); color: #0a0c14; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px;">
                      🚀 Launch FlowOS
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- What to Expect -->
              <div style="background-color: rgba(45, 212, 191, 0.05); border: 1px solid rgba(45, 212, 191, 0.1); border-radius: 12px; padding: 24px; margin-top: 30px;">
                <h3 style="margin: 0 0 16px; color: #2dd4bf; font-size: 16px; font-weight: 600;">What's Waiting For You:</h3>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #94a3b8; font-size: 14px; line-height: 1.8;">
                  <li>Leadership Archetype Assessment</li>
                  <li>The Architect — AI Mentor trained on 19 great minds</li>
                  <li>The Studio — Custom meditation & performance audio</li>
                  <li>The Lab — Behavioral change experiments</li>
                  <li>Shadow Analysis & Growth Reports</li>
                </ul>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #0d0f17; text-align: center; border-top: 1px solid rgba(45, 212, 191, 0.1);">
              <p style="margin: 0 0 10px; color: #64748b; font-size: 12px;">
                You're receiving this because you qualified for FlowOS beta access.
              </p>
              <p style="margin: 0; color: #64748b; font-size: 12px;">
                © 2025 The H2H Experiment • <a href="https://www.theh2hexperiment.com" style="color: #2dd4bf; text-decoration: none;">theh2hexperiment.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const getFeedbackRequestEmail = (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>We'd Love Your Feedback</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0c14; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0c14; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #12151f; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid rgba(45, 212, 191, 0.2);">
              <h1 style="margin: 0; font-size: 28px; color: #2dd4bf; font-family: Georgia, serif;">FlowOS</h1>
              <p style="margin: 8px 0 0; color: #64748b; font-size: 14px;">Beta Feedback Request</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #e2e8f0; font-size: 24px; font-family: Georgia, serif;">
                Hi ${name}, we'd love your input!
              </h2>
              
              <p style="margin: 0 0 20px; color: #94a3b8; font-size: 16px; line-height: 1.6;">
                You've been exploring FlowOS as a beta tester, and your experience is invaluable to us. We're building this platform for leaders like you, and your honest feedback will shape its future.
              </p>
              
              <p style="margin: 0 0 30px; color: #94a3b8; font-size: 16px; line-height: 1.6;">
                Could you take 5 minutes to share your thoughts? We'd particularly love to know:
              </p>
              
              <!-- Questions -->
              <div style="background-color: rgba(45, 212, 191, 0.05); border: 1px solid rgba(45, 212, 191, 0.1); border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                <ul style="margin: 0; padding: 0 0 0 20px; color: #e2e8f0; font-size: 14px; line-height: 2;">
                  <li>What feature resonated most with you?</li>
                  <li>What felt confusing or could be improved?</li>
                  <li>Would you recommend FlowOS to a peer? Why or why not?</li>
                  <li>What's one feature you wish existed?</li>
                </ul>
              </div>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="mailto:hello@theh2hexperiment.com?subject=FlowOS Beta Feedback from ${encodeURIComponent(name)}" 
                       style="display: inline-block; background: linear-gradient(135deg, #2dd4bf, #14b8a6); color: #0a0c14; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px;">
                      📝 Share My Feedback
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #64748b; font-size: 14px; text-align: center;">
                Or simply reply to this email with your thoughts.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #0d0f17; text-align: center; border-top: 1px solid rgba(45, 212, 191, 0.1);">
              <p style="margin: 0 0 10px; color: #64748b; font-size: 12px;">
                Thank you for being part of the FlowOS beta program.
              </p>
              <p style="margin: 0; color: #64748b; font-size: 12px;">
                © 2025 The H2H Experiment • <a href="https://www.theh2hexperiment.com" style="color: #2dd4bf; text-decoration: none;">theh2hexperiment.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const getNotQualifiedEmail = (name: string, matchPercentage: number) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Your Interest</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0c14; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0c14; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #12151f; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid rgba(45, 212, 191, 0.2);">
              <h1 style="margin: 0; font-size: 28px; color: #2dd4bf; font-family: Georgia, serif;">FlowOS</h1>
              <p style="margin: 8px 0 0; color: #64748b; font-size: 14px;">H2H Inner Lab</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #e2e8f0; font-size: 24px; font-family: Georgia, serif;">
                Thank you for your interest, ${name}
              </h2>
              
              <p style="margin: 0 0 20px; color: #94a3b8; font-size: 16px; line-height: 1.6;">
                We appreciate you taking the time to complete our assessment. Based on your responses (${matchPercentage}% match), FlowOS may not be the ideal fit for your current needs at this time.
              </p>
              
              <p style="margin: 0 0 20px; color: #94a3b8; font-size: 16px; line-height: 1.6;">
                This doesn't mean you won't benefit from FlowOS in the future. We've added you to our priority waitlist, and you'll be the first to know when we expand our program or develop features that might better serve your leadership journey.
              </p>
              
              <p style="margin: 0 0 30px; color: #94a3b8; font-size: 16px; line-height: 1.6;">
                In the meantime, explore our free resources at The H2H Experiment for leadership insights and personal development content.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="https://www.theh2hexperiment.com" 
                       style="display: inline-block; background: linear-gradient(135deg, #64748b, #475569); color: #e2e8f0; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px;">
                      Explore H2H Resources
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #0d0f17; text-align: center; border-top: 1px solid rgba(45, 212, 191, 0.1);">
              <p style="margin: 0 0 10px; color: #64748b; font-size: 12px;">
                You're on our priority waitlist for future FlowOS updates.
              </p>
              <p style="margin: 0; color: #64748b; font-size: 12px;">
                © 2025 The H2H Experiment • <a href="https://www.theh2hexperiment.com" style="color: #2dd4bf; text-decoration: none;">theh2hexperiment.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, name, matchPercentage = 0 }: EmailRequest = await req.json();

    let subject: string;
    let html: string;

    switch (type) {
      case 'welcome':
        subject = "🚀 Welcome to FlowOS Beta — Your Access is Ready";
        html = getWelcomeEmail(name, matchPercentage);
        break;
      case 'feedback_request':
        subject = "📝 We'd Love Your Feedback on FlowOS";
        html = getFeedbackRequestEmail(name);
        break;
      case 'not_qualified':
        subject = "Thank You for Your Interest in FlowOS";
        html = getNotQualifiedEmail(name, matchPercentage);
        break;
      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "FlowOS <hello@theh2hexperiment.com>",
        to: [email],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Resend API error: ${errorText}`);
    }

    const emailResponse = await res.json();

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in beta-emails function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
