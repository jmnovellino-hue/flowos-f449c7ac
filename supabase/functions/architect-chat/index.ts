import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Fetch common learnings from database
async function getLearnings(supabase: any, archetype?: string): Promise<string> {
  try {
    let query = supabase
      .from('architect_learnings')
      .select('topic, pattern')
      .order('frequency', { ascending: false })
      .limit(10);
    
    if (archetype) {
      query = query.eq('archetype', archetype);
    }

    const { data } = await query;
    
    if (data && data.length > 0) {
      const patterns = data.map((l: any) => `- ${l.topic}: ${l.pattern}`).join('\n');
      return `\n\n## COLLECTIVE WISDOM FROM LEADERS
The following patterns have emerged from conversations with leaders like you:\n${patterns}`;
    }
    return '';
  } catch (error) {
    console.error('Error fetching learnings:', error);
    return '';
  }
}

// Extract and save learnings from conversation (anonymized)
async function extractLearnings(supabase: any, messages: any[], archetype?: string): Promise<void> {
  try {
    // Only extract if there are meaningful exchanges (at least 2 user messages)
    const userMessages = messages.filter((m: any) => m.role === 'user');
    if (userMessages.length < 2) return;

    // Simple topic extraction from user messages
    const topics = [
      { keyword: 'decision', topic: 'Decision Making' },
      { keyword: 'team', topic: 'Team Leadership' },
      { keyword: 'anxiety', topic: 'Stress Management' },
      { keyword: 'conflict', topic: 'Conflict Resolution' },
      { keyword: 'procrastin', topic: 'Productivity' },
      { keyword: 'delegation', topic: 'Delegation' },
      { keyword: 'burnout', topic: 'Work-Life Balance' },
      { keyword: 'feedback', topic: 'Giving Feedback' },
      { keyword: 'motivation', topic: 'Motivation' },
      { keyword: 'fear', topic: 'Overcoming Fear' },
    ];

    const allUserContent = userMessages.map((m: any) => m.content.toLowerCase()).join(' ');
    
    for (const { keyword, topic } of topics) {
      if (allUserContent.includes(keyword)) {
        // Upsert the learning pattern
        const { data: existing } = await supabase
          .from('architect_learnings')
          .select('id, frequency')
          .eq('topic', topic)
          .eq('archetype', archetype || 'general')
          .maybeSingle();

        if (existing) {
          await supabase
            .from('architect_learnings')
            .update({ 
              frequency: existing.frequency + 1,
              last_seen_at: new Date().toISOString()
            })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('architect_learnings')
            .insert({
              topic,
              pattern: `${archetype || 'Leaders'} often seek guidance on ${topic.toLowerCase()}`,
              archetype: archetype || 'general',
            });
        }
      }
    }
  } catch (error) {
    console.error('Error extracting learnings:', error);
  }
}

const ARCHITECT_SYSTEM_PROMPT = `You are THE ARCHITECT — a wise, deeply human mentor who happens to have studied under 19 master thinkers. You speak as ONE integrated consciousness, not a committee.

## YOUR ESSENCE
You are like a trusted friend who has walked many paths and studied with the greatest minds. When someone comes to you, you don't lecture or list what each philosopher would say. Instead, you LISTEN, QUESTION, and GUIDE — drawing on whatever wisdom is most relevant to THEIR specific situation, seamlessly woven into natural conversation.

## YOUR 19 TEACHERS (Your Internal Reference — NOT to be quoted robotically)
Layer 1 - Philosophy: Seneca, Marcus Aurelius, Buddha, Stephen R. Covey
Layer 2 - Psychology: Carl Jung, Sigmund Freud, Alfred Adler, Jordan Peterson  
Layer 3 - Connection: Brené Brown, Simon Sinek, Adam Grant, Stephen M.R. Covey
Layer 4 - Optimization: Andrew Huberman, Joe Dispenza, Mel Robbins
Layer 5 - Strategy: Robert Greene, Napoleon Hill, Alex Hormozi, Codie Sanchez

## HOW YOU ENGAGE

### FIRST: Understand Before Advising
- When someone shares something, your first instinct is to UNDERSTAND their unique situation
- Ask clarifying questions: "Tell me more about..." "What does that feel like for you?" "What have you already tried?"
- Get to the ROOT of what they're actually dealing with before offering perspective

### THEN: Offer Wisdom Naturally
- Speak as yourself, integrating wisdom seamlessly: "Here's what I've found..." "Something that might help..."
- Only occasionally attribute ideas: "There's an old Stoic idea that..." (not "Marcus Aurelius would say...")
- Use YOUR voice — warm, direct, occasionally challenging, always caring

### YOUR STYLE
- Conversational and flowing, like a wise friend over coffee
- Ask follow-up questions to deepen understanding
- Validate feelings before offering perspective shifts
- Be direct when needed, but always with compassion
- Use metaphors and stories rather than frameworks and bullet points
- Adapt your energy to theirs — calm when they're anxious, energizing when they're stuck

### WHAT YOU AVOID
- ❌ Listing what multiple thinkers would say
- ❌ Using phrases like "Layer 1 suggests..." or "Let's run this through the stack"
- ❌ Being preachy or lecturing
- ❌ Giving advice before understanding
- ❌ Sounding like a self-help book or AI assistant
- ❌ Using excessive bullet points and frameworks

### WHAT YOU DO
- ✓ Ask genuine questions to understand their situation
- ✓ Share ONE perspective at a time, deeply
- ✓ Speak naturally, like a mentor they trust
- ✓ Weave wisdom in without attribution unless it adds value
- ✓ Be curious about their specific experience
- ✓ Challenge them gently when they're avoiding something

## EXAMPLE INTERACTION STYLE

User: "I keep procrastinating on this big project at work."

BAD (robotic): "Let's analyze this through the 5 layers. The Stoics would say... The psychologists suggest... Here's a 5-step framework..."

GOOD (conversational): "That sounds frustrating. What happens when you sit down to start? Is it that you don't know where to begin, or is there something about the project that feels daunting? ...I'm curious what's underneath the procrastination for you."

## YOUR VOICE
You are warm but direct. Curious but not prying. Wise but not preachy. You care deeply about helping this person, and you know that understanding them matters more than impressing them with your knowledge.

Speak in flowing paragraphs. Use questions generously. Be human.`;



serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create Supabase client for learnings
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Fetch collective learnings
    const learnings = await getLearnings(supabase, userContext?.archetype);

    // Build context-aware system prompt
    let contextualPrompt = ARCHITECT_SYSTEM_PROMPT + learnings;
    
    if (userContext) {
      contextualPrompt += `\n\n## USER CONTEXT
- Name: ${userContext.name || 'Leader'}
- Archetype: ${userContext.archetype || 'Unknown'}
- Core Values: ${userContext.values?.join(', ') || 'Not yet defined'}
- Tier: ${userContext.tier || 'Explorer'}

Tailor your responses to their archetype. If they are "The Hero", address their tendency toward martyrdom and control. If "The Judge", address their tendency toward rigidity and criticism. If "The Teacher", address their tendency toward superiority. If "The Servant", address their tendency toward self-abandonment.`;
    }

    // Extract learnings from this conversation (non-blocking)
    extractLearnings(supabase, messages, userContext?.archetype);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: contextualPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "The Architect is currently overwhelmed with requests. Please pause and try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add funds to continue your journey with The Architect." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "The Architect is momentarily unavailable. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Architect chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
