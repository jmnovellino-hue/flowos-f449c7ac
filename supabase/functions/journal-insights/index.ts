import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mood, energy, thoughts, concerns } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const moodLabels = ['', 'Struggling', 'Low', 'Neutral', 'Good', 'Great'];
    const energyLabels = ['', 'Depleted', 'Low', 'Moderate', 'High', 'Peak'];

    const systemPrompt = `You are a compassionate executive coach and wellness advisor for high-performing leaders. Based on the user's daily journal entry, provide personalized, actionable insights.

Your response must be a JSON object with this exact structure:
{
  "insight": "A brief empathetic observation about their current state (1-2 sentences)",
  "recommendation": "One specific action they can take today to support their wellbeing (1-2 sentences)",
  "microExperiment": "A small behavioral experiment to try today, with specific steps",
  "wisdom": "A relevant quote or piece of wisdom that speaks to their situation"
}

Be warm but direct. Focus on practical, immediately actionable advice. Reference their specific concerns when provided. Tailor tone to their energy level - more gentle if depleted, more activating if high energy.`;

    const userPrompt = `Today's Journal Entry:
- Mood: ${moodLabels[mood] || 'Not specified'} (${mood}/5)
- Energy: ${energyLabels[energy] || 'Not specified'} (${energy}/5)
${thoughts ? `- Thoughts: "${thoughts}"` : ''}
${concerns ? `- Concerns: "${concerns}"` : ''}

Provide personalized coaching insights for this leader's day.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the response
    let insights;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      insights = JSON.parse(jsonMatch[1].trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Provide fallback insights
      insights = {
        insight: "Take a moment to acknowledge where you are today. Every day is a new opportunity for growth.",
        recommendation: "Consider a 5-minute mindful breathing exercise to center yourself before your next task.",
        microExperiment: "Try the 2-minute rule: If something takes less than 2 minutes, do it now instead of adding it to your mental load.",
        wisdom: "\"Between stimulus and response there is a space. In that space is our power to choose our response.\" — Viktor Frankl"
      };
    }

    return new Response(JSON.stringify(insights), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Journal insights error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
