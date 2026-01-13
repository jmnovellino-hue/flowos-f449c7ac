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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { event, type } = await req.json();

    // Get user profile for context
    const { data: profile } = await supabase
      .from("profiles")
      .select("archetype, values")
      .eq("user_id", user.id)
      .single();

    const systemPrompt = `You are a conscious leadership coach providing brief, actionable insights for calendar events.
    
User's archetype: ${profile?.archetype || 'Leader'}
User's values: ${profile?.values?.join(', ') || 'growth, authenticity, impact'}

Provide insights that are:
- Concise (2-3 sentences max)
- Actionable and specific
- Aligned with their archetype and values
- Focused on emotional preparation or reflection`;

    let userPrompt = '';
    if (type === 'pre') {
      userPrompt = `The user has an upcoming event: "${event.title}"
${event.description ? `Description: ${event.description}` : ''}
${event.impact_rating ? `They rated its anticipated impact as: ${event.impact_rating > 0 ? 'positive' : event.impact_rating < 0 ? 'challenging' : 'neutral'}` : ''}

Provide a brief pre-meeting insight to help them prepare emotionally and mentally. Include one micro-experiment or intention they could set.`;
    } else {
      userPrompt = `The user just completed an event: "${event.title}"
${event.description ? `Description: ${event.description}` : ''}
${event.impact_rating ? `They rated its impact as: ${event.impact_rating > 0 ? 'positive' : event.impact_rating < 0 ? 'challenging' : 'neutral'}` : ''}

Provide a brief post-meeting reflection prompt to help them integrate the experience and extract learnings.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const insight = data.choices?.[0]?.message?.content || "Take a moment to center yourself before this event.";

    // Store the insight
    if (type === 'pre') {
      await supabase
        .from("calendar_events")
        .upsert({
          user_id: user.id,
          google_event_id: event.google_event_id,
          title: event.title,
          description: event.description,
          start_time: event.start_time,
          end_time: event.end_time,
          pre_meeting_insight: insight,
        }, { onConflict: 'user_id,google_event_id' });
    }

    return new Response(JSON.stringify({ insight }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Calendar insights error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
