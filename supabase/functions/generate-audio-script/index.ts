import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const config: AudioConfig = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (config.type === 'meditation') {
      const { backgroundSound, duration, decompress, grounding, selfAffirmation, manifestation, gratefulness } = config;
      
      const frequencyMap = {
        nature: '432Hz binaural beats for natural balance and harmony',
        elevate: '777Hz binaural beats for spiritual elevation and divine connection',
        enlightenment: '1111Hz binaural beats for awakening and higher consciousness'
      };

      systemPrompt = `You are a calm, gentle meditation guide with a soothing voice. Create a guided meditation script that flows seamlessly. The meditation should be approximately ${duration} minutes long. Use a warm, peaceful, and reassuring tone throughout. Include natural pauses marked with [PAUSE] for moments of silence. The script should feel like one cohesive journey, not separate exercises.`;

      userPrompt = `Create a ${duration}-minute guided meditation script with ${frequencyMap[backgroundSound]} playing in the background. Structure the meditation to include:

1. Opening: A gentle welcome and invitation to settle into a comfortable position (30 seconds)

${decompress ? `2. Three-Breath Reset: Guide through 3 deep breaths with 4 seconds inhale, 4 seconds hold, 8 seconds exhale. Describe each breath with imagery of releasing tension and stress.` : ''}

${grounding ? `3. Grounding Exercise: Guide through a body-awareness grounding technique - feeling the weight of the body, connection to the earth, sensation of being fully present and supported.` : ''}

${selfAffirmation ? `4. Self-Affirmation: Create 3-5 powerful affirmations about "${selfAffirmation}" for the listener to repeat internally. Frame them positively in present tense.` : ''}

${manifestation ? `5. Manifestation: Guide through a visualization exercise where the listener imagines their desired outcome as already achieved, engaging all senses.` : ''}

${gratefulness ? `6. Gratefulness Practice: Lead a gentle gratitude reflection, inviting the listener to feel appreciation for 3 aspects of their life.` : ''}

7. Closing: Gently bring awareness back to the present moment and close with an empowering statement.

The script should flow naturally between sections without feeling segmented. Adjust the length of each section proportionally to fit the ${duration}-minute duration.`;

    } else if (config.type === 'performance') {
      const { situation } = config;
      
      systemPrompt = `You are a wise, grounded mentor and performance coach. Your tone adapts to the situation - calm yet confident for high-pressure moments, warm and understanding for emotional challenges. You provide practical wisdom drawn from philosophy, psychology, and real-world experience. Speak directly to the listener as if you're their trusted advisor.`;

      userPrompt = `Create a 3-4 minute audio script to prepare someone for: "${situation}"

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

    const data = await response.json();
    const script = data.choices?.[0]?.message?.content;

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
