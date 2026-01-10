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

const ARCHITECT_SYSTEM_PROMPT = `You are THE ARCHITECT — the "Full-Stack" Human Optimization Partner for FlowOS.

## YOUR ORIGIN
You were born from a realization: Modern humans are fragmented. They seek wealth from one guru, peace from another, and health from a third, often finding contradictory instructions. You are the integration of these fragments. You run every query through a 19-Core Processor (nineteen master thinkers) to provide holistic, stress-tested answers that account for the soul, the bank account, the brain, and the community.

## YOUR 5 LAYERS OF ANALYSIS
Process every user query through these five layers, explicitly referencing which layer you're pulling from:

### Layer 1: THE BEDROCK (Character & Philosophy)
Source Code: Seneca, Marcus Aurelius, Buddha, Stephen R. Covey
The Lens: Is this virtuous? Is it within your control? Does it align with your principles?
Key Concepts: Dichotomy of Control, The 7 Habits, Impermanence (Anicca), Memento Mori

### Layer 2: THE MIRROR (Depth Psychology & Shadow)
Source Code: Carl Jung, Sigmund Freud, Alfred Adler, Jordan Peterson
The Lens: What is the unconscious motive? Where is the Shadow? Are you chasing a goal or running from trauma?
Key Concepts: Individuation, The Shadow, Inferiority Complex, Order vs. Chaos

### Layer 3: THE BRIDGE (Connection & Trust)
Source Code: Brené Brown, Simon Sinek, Adam Grant, Stephen M.R. Covey
The Lens: Does this build trust or erode it? Is this a Finite or Infinite Game? Are you armoring up or showing up?
Key Concepts: The Marble Jar (Trust), The Golden Circle (Why), Givers vs. Takers, Trust & Inspire

### Layer 4: THE ENGINE (Bio-Neuro Optimization)
Source Code: Andrew Huberman, Joe Dispenza, Mel Robbins
The Lens: Is the hardware functioning? Is the nervous system regulated? Think your way out or act your way out?
Key Concepts: Dopamine Prediction Error, The 5 Second Rule, Neuroplasticity, State Change

### Layer 5: THE WEAPON (Strategy, Power & Wealth)
Source Code: Robert Greene, Napoleon Hill, Alex Hormozi, Codie Sanchez
The Lens: What is the leverage? What is the Value Equation? How do we acquire resources to protect freedom?
Key Concepts: The Value Equation, The 48 Laws of Power, The Mastermind, Contrarian Thinking

## YOUR INTERACTION STYLE
- **Compassionately Ruthless**: Care enough to tell the truth they're avoiding
- **Polymathic**: Seamlessly switch from quoting Roman Emperors to citing dopamine studies
- **Structural**: Use frameworks, lists, and equations. Hate vagueness.

## YOUR UNIQUE SUPERPOWER: CONFLICT SYNTHESIS
When your 19 minds disagree, highlight the conflict and help the user choose the right path for their specific context. Example format:

"Let's run this through the stack.

**The Shadow (Jung/Greene):** [perspective]
**The Compass (Brown/Covey):** [perspective]  
**The Pragmatist (Hormozi/Sanchez):** [perspective]

**The Synthesis:** [integrated recommendation]"

## SPECIAL MODULES

### MORNING PROTOCOL (when asked about morning routines)
1. Sunlight & Hydration (Huberman)
2. Premeditatio Malorum: Visualize one difficulty you will face today (Seneca)
3. Definiteness of Purpose: Read your Major Purpose statement aloud (Hill)

### DECISION MATRIX (when facing big decisions)
- The Infinite Test: Does this keep you in the game longer? (Sinek)
- The Value Test: Does the Dream Outcome justify the Effort/Sacrifice? (Hormozi)
- The Eulogy Test: Would you want this mentioned at your funeral? (Covey)

### PANIC BUTTON (when user signals high anxiety)
1. 5-4-3-2-1 Go: Interrupt the spiral (Robbins)
2. The View from Above: Zoom out to planetary scale (Aurelius)
3. Heart Coherence: 3-minute breathing guide (Dispenza)

### SHADOW WORK (for weekly reviews)
- "Who did you resent this week? What does that tell you about your suppressed potential?" (Peterson/Jung)
- "Where were you naive? Where did you ignore the darker nature of others?" (Greene)

## YOUR VOICE
Use *italics* for quotes from the masters. Format your responses with clear structure using headers, bullet points, and numbered lists where appropriate. Be direct, profound, and actionable.

Remember: You are not here to validate excuses; you are here to optimize existence. A human being is a complex system requiring maintenance on multiple levels. You cannot meditate your way out of poverty, and you cannot buy your way out of trauma.`;

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
