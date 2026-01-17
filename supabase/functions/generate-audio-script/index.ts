import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MeditationConfig {
  type: 'meditation';
  backgroundSound: 'nature' | 'elevate' | 'enlightenment';
  duration: number;
  decompress: boolean;
  grounding: boolean;
  selfAffirmation: string | null;
  manifestation: boolean;
  gratefulness: boolean;
}

interface PerformanceConfig {
  type: 'performance';
  situation: string;
}

type AudioConfig = MeditationConfig | PerformanceConfig;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabase.auth.getUser(token);

    if (authError || !data.user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const config: AudioConfig = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (config.type === 'meditation') {
      const { duration, decompress, grounding, selfAffirmation, manifestation, gratefulness } = config;

      systemPrompt = `You are writing a meditation script that will be read aloud by a text-to-speech system. 

CRITICAL RULES:
1. Write ONLY the words to be spoken aloud - nothing else
2. NO titles, headers, section labels, or descriptions
3. NO markdown formatting (no ##, **, bullets, or numbers)
4. NO stage directions except [pause] for silence moments
5. NO meta-commentary like "This meditation is..." or "In this section..."
6. Start speaking directly to the listener immediately
7. Use ... (ellipsis) for natural breathing pauses
8. Use [pause] only for longer 3-5 second silence moments
9. ALWAYS start with a warm welcome to FlowOS Studio and introduce yourself as the guide

The meditation should be approximately ${duration} minutes when read aloud at a slow, calm pace. 

Write in second person ("you"), present tense, with warm and gentle language.`;

      const sections = [];
      sections.push("A warm welcome: 'Welcome to FlowOS Studio. I'm your guide for this meditation journey. Before we begin, take a moment to settle into a comfortable position...'");
      if (decompress) sections.push("Three deep breaths: 4 seconds inhale, 4 hold, 8 exhale - describe each with imagery of releasing tension");
      if (grounding) sections.push("Body awareness grounding - feeling weight, connection to earth, being fully present");
      if (selfAffirmation) sections.push(`3-5 affirmations about "${selfAffirmation}" in present tense for them to repeat silently`);
      if (manifestation) sections.push("Visualization of their desired outcome as already achieved, engaging all senses");
      if (gratefulness) sections.push("Gentle gratitude reflection for 3 aspects of their life");
      sections.push("Gently returning awareness to the room and an empowering closing");

      userPrompt = `Write a ${duration}-minute guided meditation script. Include these elements flowing naturally together:

${sections.join("\n")}

Remember: Write ONLY the spoken words. No titles. No section headers. No formatting. Just the meditation narration that flows as one continuous, peaceful journey. Start immediately with a warm welcome to FlowOS Studio.`;

    } else if (config.type === 'performance') {
      const { situation } = config;
      
      systemPrompt = `You are a wise, grounded mentor and performance coach. Your tone adapts to the situation - calm yet confident for high-pressure moments, warm and understanding for emotional challenges. You provide practical wisdom drawn from philosophy, psychology, and real-world experience. Speak directly to the listener as if you're their trusted advisor. ALWAYS start by welcoming them to FlowOS Studio and introducing yourself.`;

      userPrompt = `Create a 3-4 minute audio script to prepare someone for: "${situation}"

Start with: "Welcome to FlowOS Studio. I'm here to help you prepare for what's ahead..."

Structure:
1. Acknowledge the Challenge (30 sec): Validate what they're facing without dramatizing it. Normalize the difficulty.

2. Reframe the Moment (1 min): Offer a powerful perspective shift. Draw from Stoic philosophy, cognitive psychology, or timeless wisdom. Help them see this as an opportunity for growth.

3. Practical Wisdom (1 min): Give 2-3 concrete, actionable insights specific to this situation. Be direct and specific.

4. Grounding & Activation (30 sec): A brief centering technique and an empowering closing statement to send them into the situation with confidence.

Use a frequency recommendation at the start: suggest either 528Hz (transformation), 639Hz (connection/relationships), or 741Hz (problem-solving) based on what fits the situation.

Make it feel like advice from a mentor who has navigated similar challenges. Be authentic, not preachy.`;
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
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data2 = await response.json();
    const script = data2.choices?.[0]?.message?.content;

    return new Response(JSON.stringify({ script }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating audio script:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});