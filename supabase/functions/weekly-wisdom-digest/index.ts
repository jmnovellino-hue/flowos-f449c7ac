import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DigestRequest {
  userId?: string; // Optional: send to specific user, otherwise send to all eligible
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    let targetUserId: string | null = null;
    
    // Check if this is a targeted request or scheduled job
    if (req.method === "POST") {
      try {
        const body = await req.json();
        targetUserId = body.userId || null;
      } catch {
        // No body, that's fine for scheduled jobs
      }
    }

    // Get users who should receive digest
    let query = supabase
      .from("profiles")
      .select("user_id, display_name, email, archetype, weekly_digest_enabled, last_digest_sent_at")
      .eq("weekly_digest_enabled", true)
      .not("email", "is", null);

    if (targetUserId) {
      query = query.eq("user_id", targetUserId);
    }

    const { data: profiles, error: profilesError } = await query;

    if (profilesError) {
      throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ message: "No eligible users for digest" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const results = [];

    for (const profile of profiles) {
      try {
        // Fetch user's insights from the past week
        const { data: insights } = await supabase
          .from("architect_insights")
          .select("content, source_layer, tags, created_at, is_favorite")
          .eq("user_id", profile.user_id)
          .gte("created_at", oneWeekAgo.toISOString())
          .order("created_at", { ascending: false })
          .limit(10);

        // Fetch user's conversations from the past week
        const { data: conversations } = await supabase
          .from("architect_conversations")
          .select("title, summary, topics, created_at")
          .eq("user_id", profile.user_id)
          .gte("created_at", oneWeekAgo.toISOString())
          .order("created_at", { ascending: false })
          .limit(5);

        // Fetch user's commitments progress
        const { data: commitments } = await supabase
          .from("commitments")
          .select("commitment, days_practiced, deadline, status")
          .eq("user_id", profile.user_id)
          .eq("status", "active")
          .limit(5);

        // Generate the email HTML
        const emailHtml = generateDigestEmail({
          displayName: profile.display_name || "Leader",
          archetype: profile.archetype,
          insights: insights || [],
          conversations: conversations || [],
          commitments: commitments || [],
        });

        // Send the email using Resend API directly
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "The Architect <digest@resend.dev>",
            to: [profile.email],
            subject: `🏛️ Your Weekly Wisdom Digest | ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`,
            html: emailHtml,
          }),
        });

        const emailData = await emailResponse.json();

        // Update last_digest_sent_at
        await supabase
          .from("profiles")
          .update({ last_digest_sent_at: new Date().toISOString() })
          .eq("user_id", profile.user_id);

        results.push({
          userId: profile.user_id,
          email: profile.email,
          status: emailResponse.ok ? "sent" : "failed",
          emailId: emailData.id,
        });

      } catch (userError: any) {
        console.error(`Failed to send digest to user ${profile.user_id}:`, userError);
        results.push({
          userId: profile.user_id,
          email: profile.email,
          status: "failed",
          error: userError.message,
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: "Digest processing complete",
        results,
        processedCount: results.length,
        successCount: results.filter(r => r.status === "sent").length,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in weekly-wisdom-digest:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

interface DigestData {
  displayName: string;
  archetype: string | null;
  insights: Array<{
    content: string;
    source_layer: string | null;
    tags: string[] | null;
    created_at: string;
    is_favorite: boolean | null;
  }>;
  conversations: Array<{
    title: string;
    summary: string | null;
    topics: string[] | null;
    created_at: string;
  }>;
  commitments: Array<{
    commitment: string;
    days_practiced: number | null;
    deadline: string;
    status: string | null;
  }>;
}

function generateDigestEmail(data: DigestData): string {
  const { displayName, archetype, insights, conversations, commitments } = data;

  const layerColors: Record<string, string> = {
    bedrock: "#8B7355",
    mirror: "#6B5B95",
    bridge: "#88B04B",
    engine: "#F7CAC9",
    weapon: "#92A8D1",
  };

  const layerEmojis: Record<string, string> = {
    bedrock: "🏛️",
    mirror: "🪞",
    bridge: "🌉",
    engine: "⚡",
    weapon: "⚔️",
  };

  const insightsHtml = insights.length > 0
    ? insights.map(insight => {
        const layer = insight.source_layer?.toLowerCase() || "bedrock";
        const color = layerColors[layer] || "#666";
        const emoji = layerEmojis[layer] || "💡";
        return `
          <div style="background: linear-gradient(135deg, ${color}15 0%, ${color}05 100%); border-left: 4px solid ${color}; padding: 16px; margin: 12px 0; border-radius: 0 8px 8px 0;">
            <div style="font-size: 12px; color: ${color}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
              ${emoji} ${insight.source_layer || "Wisdom"} ${insight.is_favorite ? "⭐" : ""}
            </div>
            <p style="margin: 0; color: #333; line-height: 1.6;">"${insight.content}"</p>
            ${insight.tags && insight.tags.length > 0 ? `
              <div style="margin-top: 8px;">
                ${insight.tags.map(tag => `<span style="background: ${color}20; color: ${color}; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-right: 4px;">${tag}</span>`).join('')}
              </div>
            ` : ''}
          </div>
        `;
      }).join('')
    : '<p style="color: #888; font-style: italic;">No insights saved this week. Start highlighting wisdom from your Architect conversations!</p>';

  const conversationsHtml = conversations.length > 0
    ? conversations.map(conv => `
        <div style="background: #f8f9fa; padding: 16px; margin: 12px 0; border-radius: 8px; border: 1px solid #e9ecef;">
          <h4 style="margin: 0 0 8px 0; color: #1a1a2e; font-size: 16px;">📜 ${conv.title}</h4>
          ${conv.summary ? `<p style="margin: 0 0 8px 0; color: #555; font-size: 14px; line-height: 1.5;">${conv.summary}</p>` : ''}
          ${conv.topics && conv.topics.length > 0 ? `
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
              ${conv.topics.map(topic => `<span style="background: #e8e0f0; color: #6B5B95; padding: 2px 8px; border-radius: 12px; font-size: 11px;">${topic}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      `).join('')
    : '<p style="color: #888; font-style: italic;">No conversations this week. The Architect awaits your questions.</p>';

  const commitmentsHtml = commitments.length > 0
    ? commitments.map(commitment => {
        const daysLeft = Math.ceil((new Date(commitment.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const progress = Math.min((commitment.days_practiced || 0) / 21 * 100, 100);
        return `
          <div style="background: #f0f7f0; padding: 16px; margin: 12px 0; border-radius: 8px; border: 1px solid #c8e6c9;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-weight: 600; color: #2e7d32;">🎯 ${commitment.commitment}</span>
              <span style="font-size: 12px; color: #666;">${daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}</span>
            </div>
            <div style="background: #e0e0e0; height: 8px; border-radius: 4px; overflow: hidden;">
              <div style="background: linear-gradient(90deg, #66bb6a, #43a047); height: 100%; width: ${progress}%; transition: width 0.3s;"></div>
            </div>
            <div style="margin-top: 8px; font-size: 12px; color: #555;">
              ${commitment.days_practiced || 0} days practiced • ${Math.round(progress)}% to habit formation
            </div>
          </div>
        `;
      }).join('')
    : '<p style="color: #888; font-style: italic;">No active commitments. Ready to make a new commitment to growth?</p>';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding: 40px 32px; text-align: center;">
          <h1 style="margin: 0; color: #f0e6d3; font-size: 28px; font-weight: 300; letter-spacing: 2px;">THE ARCHITECT</h1>
          <p style="margin: 8px 0 0 0; color: #c9a959; font-size: 14px; letter-spacing: 1px;">WEEKLY WISDOM DIGEST</p>
        </div>

        <!-- Greeting -->
        <div style="padding: 32px; border-bottom: 1px solid #eee;">
          <h2 style="margin: 0 0 16px 0; color: #1a1a2e; font-size: 24px; font-weight: 500;">
            Greetings, ${displayName}${archetype ? ` — ${archetype}` : ''}
          </h2>
          <p style="margin: 0; color: #555; line-height: 1.6; font-size: 15px;">
            Here is your weekly synthesis of wisdom, progress, and insights from our conversations. 
            Take a moment to reflect on how far you've come.
          </p>
        </div>

        <!-- Saved Insights -->
        <div style="padding: 32px; border-bottom: 1px solid #eee;">
          <h3 style="margin: 0 0 20px 0; color: #1a1a2e; font-size: 20px; display: flex; align-items: center;">
            <span style="margin-right: 8px;">💎</span> Your Saved Wisdom
          </h3>
          ${insightsHtml}
        </div>

        <!-- Conversations -->
        <div style="padding: 32px; border-bottom: 1px solid #eee;">
          <h3 style="margin: 0 0 20px 0; color: #1a1a2e; font-size: 20px; display: flex; align-items: center;">
            <span style="margin-right: 8px;">🗣️</span> Conversations This Week
          </h3>
          ${conversationsHtml}
        </div>

        <!-- Commitments Progress -->
        <div style="padding: 32px; border-bottom: 1px solid #eee;">
          <h3 style="margin: 0 0 20px 0; color: #1a1a2e; font-size: 20px; display: flex; align-items: center;">
            <span style="margin-right: 8px;">🎯</span> Commitment Progress
          </h3>
          ${commitmentsHtml}
        </div>

        <!-- Weekly Reflection -->
        <div style="padding: 32px; background: linear-gradient(135deg, #f8f6f0 0%, #f0ebe0 100%);">
          <h3 style="margin: 0 0 16px 0; color: #1a1a2e; font-size: 18px;">📝 This Week's Reflection Prompt</h3>
          <p style="margin: 0; color: #555; line-height: 1.7; font-style: italic; font-size: 15px;">
            "${getWeeklyPrompt()}"
          </p>
          <p style="margin: 16px 0 0 0; color: #888; font-size: 13px;">
            — From the synthesis of Jung, Aurelius, and the Architect's collective wisdom
          </p>
        </div>

        <!-- Footer -->
        <div style="padding: 32px; background: #1a1a2e; text-align: center;">
          <p style="margin: 0 0 16px 0; color: #c9a959; font-size: 14px;">
            "I am here to help you build your life, not just live it."
          </p>
          <p style="margin: 0; color: #888; font-size: 12px;">
            The Architect • FlowOS<br>
            <a href="#" style="color: #888; text-decoration: underline;">Manage email preferences</a>
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
}

function getWeeklyPrompt(): string {
  const prompts = [
    "What mask did you wear this week that no longer serves you? What would happen if you let it fall?",
    "Where did you choose comfort over growth? The Stoics would ask: was it within your control to choose differently?",
    "Whom did you serve this week—your ego or your higher purpose? Be ruthlessly honest.",
    "What fear did you avoid facing? Name it, and you diminish its power over you.",
    "Where did you see your Shadow this week? In irritation at others, we often glimpse our own suppressed potential.",
    "What would your future self, ten years wiser, advise you to do differently next week?",
    "Where did you build trust this week? Where might you have eroded it unconsciously?",
    "What small victory did you fail to celebrate? Gratitude is the antidote to scarcity thinking.",
  ];
  
  return prompts[Math.floor(Math.random() * prompts.length)];
}
