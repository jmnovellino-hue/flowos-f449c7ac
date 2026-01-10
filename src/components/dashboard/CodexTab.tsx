import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Lock, Search, Filter, Star, BookOpen, Brain, Target, Shield, Compass, Users, Flame, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const categories = ['All', 'Leadership', 'Psychology', 'Templates', 'Frameworks', 'Philosophy'];

interface Resource {
  id: number;
  title: string;
  category: string;
  type: string;
  locked: boolean;
  featured: boolean;
  description: string;
  tier: 'free' | 'flow' | 'architect' | 'oracle';
  content?: string;
  icon?: typeof Brain;
}

const resources: Resource[] = [
  // FREE TIER RESOURCES
  {
    id: 1,
    title: 'The H2H Leadership Compass',
    category: 'Frameworks',
    type: 'Framework',
    locked: false,
    featured: true,
    tier: 'free',
    icon: Compass,
    description: 'The foundational framework for Human-to-Human leadership—navigate complexity by leading from the inside out.',
    content: `# The H2H Leadership Compass

## Core Principle
Before you can lead others, you must architect yourself. The H2H Compass guides you through four cardinal directions of authentic leadership.

## The Four Directions

### NORTH: Vision (The Strategist)
- Where are we going?
- What legacy are we building?
- What does the future demand of us?

### EAST: Connection (The Bridge)
- Who needs to be seen?
- What relationships require investment?
- How do we build trust at scale?

### SOUTH: Grounding (The Mirror)
- What patterns are running unconsciously?
- Where is ego driving decisions?
- What shadows need integration?

### WEST: Execution (The Engine)
- What gets done today?
- What systems need building?
- How do we optimize without burning out?

## Daily Practice
Each morning, ask yourself:
1. Which direction needs attention today?
2. What am I avoiding?
3. Who needs my presence, not just my productivity?

## The Integration
True leadership lives at the intersection. The goal isn't balance—it's dynamic navigation. Some seasons demand more North (vision). Others require deep South work (shadow integration). Trust the compass, but trust your intuition more.

---
*"The best leaders don't have all the answers. They have the courage to ask better questions."*
— The H2H Experiment`
  },
  {
    id: 2,
    title: 'The 5-Minute Clarity Protocol',
    category: 'Templates',
    type: 'PDF',
    locked: false,
    featured: false,
    tier: 'free',
    icon: Flame,
    description: 'A rapid mental reset for high-pressure moments—used by executives before crucial decisions.',
    content: `# The 5-Minute Clarity Protocol

## When to Use
- Before important meetings
- When feeling overwhelmed
- After receiving difficult news
- Before making significant decisions

## The Protocol

### Minute 1: STOP (Pause the Pattern)
- Close your eyes
- Take 3 deep belly breaths (4 count in, 6 count out)
- Say internally: "I am here. I am present."

### Minute 2: SCAN (Body Intelligence)
- Where is tension living in your body?
- What emotion is present beneath the surface?
- Notice without judging

### Minute 3: SEPARATE (Untangle the Threads)
Ask yourself:
- What is FACT vs. what is STORY?
- What can I control vs. what is beyond my control?
- What is urgent vs. what is important?

### Minute 4: SOURCE (Return to Your Anchor)
- What do I stand for?
- What would the best version of me do?
- What does this situation need from me?

### Minute 5: STEP (Choose Your Response)
- Define ONE clear action
- Commit to it internally
- Open your eyes and execute

## The Key Insight
You don't need more time to make better decisions. You need more presence. This protocol trains you to access clarity on demand.

---
*"Between stimulus and response, there is a space. In that space is our power to choose our response."*
— Viktor Frankl`
  },
  {
    id: 3,
    title: 'Understanding Your Shadow',
    category: 'Psychology',
    type: 'Guide',
    locked: false,
    featured: false,
    tier: 'free',
    icon: Brain,
    description: 'An introduction to Jungian shadow work for leaders—what you resist persists.',
    content: `# Understanding Your Shadow: A Leader's Guide

## What is the Shadow?
The shadow is the unconscious part of your personality that your conscious ego doesn't identify with. It's not evil—it's unintegrated. It contains both your wounds AND your gold.

## Why It Matters for Leaders
- Your blind spots become your team's ceiling
- Unprocessed triggers hijack your decision-making
- What you project onto others reveals what you won't face in yourself
- Your greatest strengths, overdone, become your greatest weaknesses

## The Four Shadow Archetypes in Leadership

### The Hero's Shadow: The Martyr
- Strength: Takes responsibility, leads from the front
- Shadow: Can't delegate, burns out, needs to be needed
- Trigger: "No one can do it as well as me"

### The Judge's Shadow: The Tyrant
- Strength: High standards, pursuit of excellence
- Shadow: Perfectionism that paralyzes, criticism that destroys
- Trigger: "This isn't good enough"

### The Teacher's Shadow: The Know-It-All
- Strength: Wisdom, guidance, mentorship
- Shadow: Needs to be the expert, dismisses other perspectives
- Trigger: "Let me tell you how this works"

### The Servant's Shadow: The Doormat
- Strength: Empathy, service, consideration
- Shadow: People-pleasing, resentment, loss of self
- Trigger: "I don't want to cause conflict"

## The Integration Process
1. NOTICE: When do you get triggered disproportionately?
2. NAME: What part of you feels threatened?
3. DIALOGUE: What does this shadow part need?
4. INTEGRATE: How can you honor this energy consciously?

## The Gold in the Shadow
Your shadow also contains disowned gifts:
- The aggressive leader who can't access healthy anger
- The analytical executive who's cut off from intuition
- The "nice" manager who's lost touch with their power

---
*"One does not become enlightened by imagining figures of light, but by making the darkness conscious."*
— Carl Jung`
  },
  {
    id: 4,
    title: 'The Morning Architect Routine',
    category: 'Templates',
    type: 'Checklist',
    locked: false,
    featured: false,
    tier: 'free',
    icon: Target,
    description: 'The first-hour protocol used by H2H founders—win the morning, win the day.',
    content: `# The Morning Architect Routine

## The Philosophy
The first hour of your day is sacred architecture time. What you build in this hour shapes everything that follows. Most leaders give their mornings to email and reaction. Architects give it to intention.

## The Protocol (60 Minutes)

### Phase 1: BODY (15 min)
- Cold exposure (30-60 seconds cold shower)
- Movement (stretching, yoga, or light exercise)
- Hydration (500ml water with electrolytes)

*Why: You can't lead from a dysregulated nervous system.*

### Phase 2: MIND (20 min)
- Meditation or breathwork (10 min)
- Journaling: 3 Questions (10 min)
  1. What am I grateful for?
  2. What will make today a success?
  3. What might get in my way?

*Why: Clarity is a daily practice, not a destination.*

### Phase 3: VISION (15 min)
- Review your "North Star" (annual/quarterly goals)
- Identify your ONE priority for the day
- Visualize successful completion

*Why: Without vision, you're optimizing someone else's agenda.*

### Phase 4: PRIME (10 min)
- Review your calendar with intention
- Anticipate challenges
- Set your state for the first meeting

*Why: Prepared leaders don't react; they respond.*

## The Non-Negotiables
- NO phone for first 30 minutes
- NO email until after routine
- NO skipping on "busy" days (those are the days you need it most)

## Customization
This is a template, not a prison. Some days you'll need more body work. Other days, more reflection. The key is showing up consistently.

---
*"How you do anything is how you do everything."*
— Unknown`
  },

  // FLOW TIER RESOURCES
  {
    id: 5,
    title: 'The Difficult Conversation Blueprint',
    category: 'Templates',
    type: 'Template',
    locked: true,
    featured: true,
    tier: 'flow',
    icon: Users,
    description: 'Word-for-word scripts and frameworks for the conversations you\'ve been avoiding.',
    content: `# The Difficult Conversation Blueprint

## The H2H Approach
Most difficult conversations fail before they start—because we enter with the wrong frame. This isn't about "winning" or even "resolving." It's about creating understanding.

## Pre-Conversation Preparation

### The Mirror Check
Before any difficult conversation, ask yourself:
- What outcome am I attached to?
- What am I afraid of hearing?
- Where might I be wrong?
- What do I need to own?

### Setting the Container
- Choose neutral territory when possible
- Block enough time (don't rush)
- Arrive regulated (use the Clarity Protocol first)

## The TRUTH Framework

### T - Tell Your Intention
"I want to have a conversation with you about [topic]. My intention is [desired outcome], not [feared outcome]. Is now a good time?"

### R - Reveal Your Observation
State facts without interpretation:
"I've noticed that [specific observable behavior]. For example, [concrete instance]."

### U - Understand Their World
"Help me understand what's happening from your perspective. What am I missing?"
*Then LISTEN. Really listen. Don't plan your rebuttal.*

### T - Take Responsibility
"I realize I've contributed to this by [your part]. That wasn't my intention, and I want to do better."

### H - Harmonize Forward
"What would make this work for both of us? What do we each need to commit to?"

## Scripts for Common Scenarios

### Performance Conversation
"I've noticed a gap between what we agreed to and what's being delivered. I want to understand what's getting in the way. Can we talk about it?"

### Boundary Conversation
"When [behavior], I feel [emotion]. I need [request]. Can we find a way to make this work?"

### Feedback Upward
"I'd like to share some feedback that I hope will be useful. Is this a good time? My intention is to support our working relationship, not to criticize."

## After the Conversation
- Follow up in writing with agreed actions
- Check in on progress
- Acknowledge improvements publicly

---
*"The quality of our relationships determines the quality of our lives."*
— Esther Perel`
  },
  {
    id: 6,
    title: 'The Stoic Decision Matrix',
    category: 'Philosophy',
    type: 'Framework',
    locked: true,
    featured: false,
    tier: 'flow',
    icon: Shield,
    description: 'Apply ancient Stoic wisdom to modern leadership dilemmas—decide with clarity, not anxiety.',
    content: `# The Stoic Decision Matrix

## The Core Teaching
The Stoics understood something we've forgotten: most anxiety comes from trying to control the uncontrollable. This matrix helps you separate what's yours to decide from what you must accept.

## The Four Quadrants

### Quadrant 1: CONTROL (Your Domain)
Things fully within your power:
- Your thoughts and interpretations
- Your responses and reactions
- Your effort and preparation
- Your integrity and values
- Who you choose to become

**ACTION: Give maximum energy here**

### Quadrant 2: INFLUENCE (Your Leverage)
Things you can affect but not control:
- Other people's opinions
- Team performance
- Market conditions
- Organizational culture

**ACTION: Apply wisdom, then release attachment to outcomes**

### Quadrant 3: CONCERN (Your Awareness)
Things that affect you but you cannot change:
- Economic trends
- Political environment
- Competitor actions
- Weather, traffic, delays

**ACTION: Prepare, adapt, don't waste energy resisting**

### Quadrant 4: IRRELEVANT (Not Your Business)
Things that don't actually affect you:
- Others' opinions of you (mostly)
- Past decisions (can't change)
- Hypothetical worries (might never happen)
- Drama you're not part of

**ACTION: Ignore completely**

## The Decision Protocol

For any significant decision:

1. **CATEGORIZE**: Which quadrant does this belong to?
2. **CLARIFY**: What is actually within my control here?
3. **CONSIDER**: What would a wise advisor say?
4. **COMMIT**: Make the decision based on principles, not fear
5. **RELEASE**: Let go of the outcome once you've done your part

## Stoic Mantras for Leaders
- "This is not happening TO me; it's happening FOR me."
- "What stands in the way becomes the way."
- "I cannot control the wind, but I can adjust my sails."
- "The obstacle is the path."

---
*"It is not that we have a short time to live, but that we waste a lot of it."*
— Seneca`
  },
  {
    id: 7,
    title: 'The Energy Audit Framework',
    category: 'Frameworks',
    type: 'Assessment',
    locked: true,
    featured: false,
    tier: 'flow',
    icon: Flame,
    description: 'Map where your energy goes and reclaim hours of your week from energy vampires.',
    content: `# The Energy Audit Framework

## The Premise
Time management is an illusion. You don't manage time—you manage energy. This framework helps you identify what drains you and what fills you, then ruthlessly optimize.

## The Audit Process

### Step 1: Track for One Week
Rate every significant activity on two scales (1-10):
- ENERGY GIVEN: How much did this cost me?
- ENERGY RECEIVED: How much did this give me?

### Step 2: Calculate Your Energy ROI
- GREEN ZONE: Receive more than you give (Net positive)
- YELLOW ZONE: Break even (Neutral)
- RED ZONE: Give more than you receive (Net negative)

### Step 3: Categorize Activities

**ELIMINATE** (Red zone + Low value)
- Meetings that should be emails
- Decisions that should be delegated
- Relationships that only take
- Tasks that don't move needles

**AUTOMATE** (Red zone + Necessary)
- Repeatable processes
- Scheduling and logistics
- Routine communications
- Standard decisions

**DELEGATE** (Yellow zone + Delegable)
- Things others can do 80% as well
- Growth opportunities for your team
- Tasks that drain you specifically
- Operational details

**DOUBLE DOWN** (Green zone)
- High-leverage activities
- Strategic thinking time
- Relationships that energize
- Creative work that matters

## The Energy Protection Protocol

### Daily Non-Negotiables
- One 90-minute block of protected deep work
- No meetings in the first 2 hours
- Lunch away from screens
- Movement break every 2 hours

### Weekly Recovery
- One day with minimal obligations
- One activity purely for joy (not "productive")
- Sleep consistency (same time ± 30 min)

### Quarterly Renewal
- Multi-day disconnection
- Reflection on what's working/not
- Relationship investment
- Physical reset (retreat, intensive, etc.)

---
*"The difference between successful people and very successful people is that very successful people say 'no' to almost everything."*
— Warren Buffett`
  },

  // ARCHITECT TIER RESOURCES
  {
    id: 8,
    title: 'The Conflict Synthesis Framework',
    category: 'Leadership',
    type: 'Framework',
    locked: true,
    featured: true,
    tier: 'architect',
    icon: Brain,
    description: 'The advanced H2H methodology for navigating impossible trade-offs and paradoxical leadership tensions.',
    content: `# The Conflict Synthesis Framework

## The Problem
Leadership is full of false dichotomies:
- Results vs. Relationships
- Speed vs. Quality
- Innovation vs. Stability
- Authority vs. Empowerment

Most leaders pick a side. H2H leaders find the synthesis.

## The Dialectical Process

### Step 1: THESIS
What is the dominant position/priority?
- State it clearly without judgment
- Understand its value and logic
- Recognize what it protects

### Step 2: ANTITHESIS
What is the opposing position/priority?
- Give it equal weight and respect
- Understand its value and logic
- Recognize what it protects

### Step 3: TENSION
Where do they seem to conflict?
- Name the specific trade-off
- Identify what you'd lose with either choice
- Feel the discomfort of the paradox

### Step 4: SYNTHESIS
What emerges when you hold both as true?
- Look for the higher-order solution
- Ask: "What would make both unnecessary?"
- Find the creative third way

## Application Examples

### Results vs. Relationships
- THESIS: Hit the numbers at all costs
- ANTITHESIS: Preserve the team at all costs
- SYNTHESIS: "We hit our numbers THROUGH how we treat our people"

### Speed vs. Quality
- THESIS: Ship fast, iterate later
- ANTITHESIS: Only release when perfect
- SYNTHESIS: "Define 'good enough' clearly, then ship immediately"

### Control vs. Trust
- THESIS: Check everything, ensure quality
- ANTITHESIS: Trust the team completely
- SYNTHESIS: "Agree on outcomes and checkpoints, then stay out of the way"

## The Meta-Insight
The tension itself is the teacher. When you feel pulled in two directions, you're standing at a growth edge. The answer isn't choosing—it's transcending the choice.

---
*"The test of a first-rate intelligence is the ability to hold two opposed ideas in mind at the same time and still retain the ability to function."*
— F. Scott Fitzgerald`
  },
  {
    id: 9,
    title: 'The Shadow Integration Workbook',
    category: 'Psychology',
    type: 'Workbook',
    locked: true,
    featured: false,
    tier: 'architect',
    icon: Brain,
    description: 'Deep-dive exercises for integrating your shadow—transform your blind spots into superpowers.',
    content: `# The Shadow Integration Workbook

## Introduction
This workbook takes you through a structured process of shadow work. It's uncomfortable by design. Growth requires meeting the parts of yourself you've been avoiding.

## Module 1: Projection Mapping

### Exercise 1.1: The Trigger Inventory
List 5 people who trigger strong negative reactions in you:
1. _______________
2. _______________
3. _______________
4. _______________
5. _______________

For each person, answer:
- What specifically bothers me about them?
- What quality do I see in them that I reject?
- Where might this quality live in me (hidden or denied)?

### Exercise 1.2: The Inflation Inventory
List 5 people you admire or idealize:
1. _______________
2. _______________
3. _______________
4. _______________
5. _______________

For each person, answer:
- What specifically do I admire?
- What quality am I placing on a pedestal?
- Where might this quality already exist in me (unexpressed)?

## Module 2: Archetypal Dialogue

### Exercise 2.1: Meeting Your Shadow
Close your eyes and imagine your shadow as a character.
- What do they look like?
- What are they angry about?
- What do they want that you won't give them?
- What gift are they holding for you?

### Exercise 2.2: The Letter
Write a letter FROM your shadow TO your conscious self.
Let it speak its truth without censorship.

## Module 3: Integration Practices

### Daily: The 3% Rule
Each day, express 3% more of what you usually suppress.
- If you typically stay quiet, speak up slightly more.
- If you typically push, allow slightly more ease.
- Small doses, consistent practice.

### Weekly: Shadow Time
Designate 30 minutes weekly for "shadow activities":
- Things you judge others for doing
- Things you secretly want but won't admit
- Activities that feel "unlike you"

### Monthly: The Life Review
Look back at the past month:
- Where did your shadow hijack you?
- Where did integrated shadow serve you?
- What pattern is ready to be released?

---
*"I must also have a dark side if I am to be whole."*
— Carl Jung`
  },
  {
    id: 10,
    title: 'The Strategic Narrative Playbook',
    category: 'Leadership',
    type: 'Playbook',
    locked: true,
    featured: false,
    tier: 'architect',
    icon: Sparkles,
    description: 'Craft compelling narratives that move people—the art of strategic storytelling for leaders.',
    content: `# The Strategic Narrative Playbook

## The Power of Story
Facts inform. Stories transform. As a leader, your ability to craft and tell compelling narratives is your most underutilized superpower.

## The Three Narrative Types

### 1. The Origin Story
*"Why we exist"*
- What problem enraged the founder?
- What moment of truth created the mission?
- What would be lost if this company didn't exist?

### 2. The Transformation Story
*"Where we're going"*
- What is the before state we're leaving?
- What is the after state we're creating?
- What does the journey look like?

### 3. The Identity Story
*"Who we are"*
- What do we believe that others don't?
- What would we sacrifice to stay true?
- What makes us different, not just better?

## The Story Architecture

### The Hook (10 seconds)
Create tension or curiosity immediately.
"What if everything you believed about leadership was wrong?"

### The Context (30 seconds)
Establish stakes and relatability.
"I spent 10 years climbing the ladder, only to realize I was on the wrong wall."

### The Conflict (60 seconds)
Show the struggle, not just the outcome.
"Every 'win' felt emptier than the last. I was succeeding by every external measure and dying inside."

### The Insight (30 seconds)
Reveal the turning point.
"Then I realized: I wasn't leading—I was performing. And the performance was killing me."

### The Resolution (30 seconds)
Show transformation and possibility.
"Now I help leaders who feel the same way find their way back to authentic leadership."

### The Call (10 seconds)
Invite participation.
"What would change if you led from who you really are?"

## Advanced Techniques

### Vulnerability as Strategy
Share failures, not just wins. The admission of struggle creates connection.

### Specificity Beats Generality
"I was terrified" < "My hands were shaking so badly I couldn't hold my coffee."

### The Rule of Three
Three points. Three examples. Three beats. The brain loves patterns of three.

---
*"Stories are just data with a soul."*
— Brené Brown`
  },

  // ORACLE TIER RESOURCES  
  {
    id: 11,
    title: 'The 19-Core Processor Manual',
    category: 'Philosophy',
    type: 'Reference',
    locked: true,
    featured: false,
    tier: 'oracle',
    icon: Brain,
    description: 'Complete documentation of The Architect\'s 19 thinkers—their wisdom, conflicts, and synthesis for leadership.',
    content: `# The 19-Core Processor Manual

## Overview
The Architect synthesizes wisdom from 19 thinkers across 5 layers. This manual provides the complete reference for understanding how these perspectives integrate.

## Layer 1: The Bedrock (Philosophy)
*Timeless principles for human existence*

**Marcus Aurelius** - Stoic Emperor
- Core Teaching: Control what you can; accept what you cannot
- Leadership Application: Emotional regulation under pressure

**Epictetus** - Stoic Philosopher
- Core Teaching: It's not what happens, but how you respond
- Leadership Application: Reframing adversity as opportunity

**Lao Tzu** - Taoist Sage
- Core Teaching: Leadership through non-force; the way of water
- Leadership Application: Knowing when to act and when to allow

**The Kybalion** - Hermetic Principles
- Core Teaching: The universe operates on immutable laws
- Leadership Application: Aligning with natural patterns of change

## Layer 2: The Mirror (Psychology)
*Understanding the human operating system*

**Carl Jung** - Depth Psychology
- Core Teaching: Integration of shadow; individuation journey
- Leadership Application: Self-awareness as the foundation of influence

**Joseph Campbell** - Mythology & Journey
- Core Teaching: The Hero's Journey as universal transformation map
- Leadership Application: Framing challenge as heroic quest

**Viktor Frankl** - Meaning & Purpose
- Core Teaching: Meaning can be found in any circumstance
- Leadership Application: Purpose as fuel for perseverance

**Robert Greene** - Power Dynamics
- Core Teaching: Understanding human nature as it is, not as we wish
- Leadership Application: Strategic awareness without cynicism

## Layer 3: The Bridge (Connection)
*Building authentic human relationships*

**Brené Brown** - Vulnerability Research
- Core Teaching: Vulnerability is the birthplace of connection
- Leadership Application: Courage to be seen as foundation of trust

**Simon Sinek** - Purpose Leadership
- Core Teaching: Start with Why; infinite games
- Leadership Application: Inspiring through purpose, not just profit

**Esther Perel** - Relationship Dynamics
- Core Teaching: The quality of relationships = quality of life
- Leadership Application: Navigating intimacy and distance in teams

**Marshall Rosenberg** - Nonviolent Communication
- Core Teaching: Beneath every behavior is an unmet need
- Leadership Application: Connecting through empathy in conflict

## Layer 4: The Engine (Bio-Neuro)
*Optimizing the human machine*

**Andrew Huberman** - Neuroscience
- Core Teaching: Protocols for optimizing brain and body
- Leadership Application: Science-based performance enhancement

**James Clear** - Habit Systems
- Core Teaching: Atomic habits compound into massive change
- Leadership Application: Systems over goals

**Wim Hof** - Breath & Cold
- Core Teaching: The body's potential is far beyond our beliefs
- Leadership Application: Building stress resilience

## Layer 5: The Weapon (Strategy)
*Executing in the arena*

**Sun Tzu** - Strategic Wisdom
- Core Teaching: The supreme art is to subdue without fighting
- Leadership Application: Strategic positioning and leverage

**Alex Hormozi** - Business Execution
- Core Teaching: Value creation and offer design
- Leadership Application: Practical wealth-building frameworks

**Ryan Holiday** - Applied Stoicism
- Core Teaching: The obstacle is the way
- Leadership Application: Turning setbacks into advantages

**Naval Ravikant** - Wealth & Wisdom
- Core Teaching: Specific knowledge, leverage, and judgment
- Leadership Application: Building leverage for impact

---
*"The goal is not to adopt any single philosophy, but to synthesize all of them into your own."*
— The H2H Experiment`
  },
  {
    id: 12,
    title: 'The Quarterly Life Architecture Sprint',
    category: 'Frameworks',
    type: 'Program',
    locked: true,
    featured: false,
    tier: 'oracle',
    icon: Target,
    description: 'The complete 12-week transformation program for rebuilding your internal architecture as a leader.',
    content: `# The Quarterly Life Architecture Sprint

## Program Overview
This is a 12-week intensive for leaders ready to do deep work. Each week builds on the last, creating compound transformation. Not for the casual participant.

## Phase 1: Excavation (Weeks 1-4)
*Understanding what you're working with*

### Week 1: The Honest Audit
- Life Wheel assessment across all domains
- Energy audit (what drains, what fills)
- Relationship mapping (inner circle clarity)
- Health baseline metrics

### Week 2: Pattern Recognition
- Identify your top 5 recurring life themes
- Map your shadow patterns
- Recognize your defense mechanisms
- Name your core wounds

### Week 3: Values Clarification
- Distinguish adopted values from authentic values
- Create your non-negotiables list
- Define your "Hell Yes / Hell No" criteria
- Articulate your personal philosophy

### Week 4: Vision Crystallization
- 10-year vision casting
- Deathbed meditation (what matters?)
- Anti-vision (what you're running from)
- North Star statement creation

## Phase 2: Architecture (Weeks 5-8)
*Designing the new structure*

### Week 5: Identity Engineering
- Define who you need to become
- Create identity-based habits
- Design your environment for success
- Build accountability structures

### Week 6: Relationship Redesign
- Have the conversations you've been avoiding
- Set new boundaries
- Deepen key relationships
- Release relationships that no longer serve

### Week 7: Work Optimization
- Redesign your calendar around energy
- Create your ideal week template
- Establish decision-making protocols
- Build delegation frameworks

### Week 8: Body Architecture
- Design your sleep protocol
- Create your movement routine
- Optimize nutrition for performance
- Establish stress-release practices

## Phase 3: Construction (Weeks 9-12)
*Building the new reality*

### Week 9: Implementation Sprint
- Execute your new systems
- Track and adjust in real-time
- Build momentum through small wins
- Document what's working

### Week 10: Integration Challenges
- Deliberately stress-test your new systems
- Practice in high-pressure situations
- Refine based on real-world feedback
- Strengthen weak points

### Week 11: Support Structure
- Build your advisory board
- Create accountability partnerships
- Establish mentorship relationships
- Design your ongoing development path

### Week 12: Completion & Continuation
- Celebrate and acknowledge transformation
- Document lessons learned
- Create your 90-day maintenance plan
- Design your next evolution

---
*"You do not rise to the level of your goals. You fall to the level of your systems."*
— James Clear`
  },
];

// Content viewer component
const ResourceViewer = ({ resource, onClose }: { resource: Resource; onClose: () => void }) => (
  <Dialog open={true} onOpenChange={onClose}>
    <DialogContent className="max-w-3xl max-h-[85vh]">
      <DialogHeader>
        <DialogTitle className="text-xl font-display">{resource.title}</DialogTitle>
      </DialogHeader>
      <ScrollArea className="h-[60vh] pr-4">
        <div className="prose prose-invert max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground leading-relaxed">
            {resource.content}
          </pre>
        </div>
      </ScrollArea>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onClose}>Close</Button>
        <Button onClick={() => {
          const blob = new Blob([resource.content || ''], { type: 'text/markdown' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${resource.title.toLowerCase().replace(/\s+/g, '-')}.md`;
          a.click();
          URL.revokeObjectURL(url);
        }}>
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

export const CodexTab = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const filteredResources = resources.filter(resource => {
    const matchesCategory = activeCategory === 'All' || resource.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredResource = filteredResources.find(r => r.featured && !r.locked) || resources.find(r => r.featured);

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'free': return 'Free';
      case 'flow': return 'Flow';
      case 'architect': return 'Architect';
      case 'oracle': return 'Oracle';
      default: return tier;
    }
  };

  const handleResourceClick = (resource: Resource) => {
    if (!resource.locked && resource.content) {
      setSelectedResource(resource);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto pb-24 md:pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-2">
          The Codex
        </h1>
        <p className="text-lg text-muted-foreground">
          Battle-tested tools from The H2H Experiment—not theory, but what actually works.
        </p>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 mb-8"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 bg-muted/50 border-border/50"
          />
        </div>
        <Button variant="outline" className="h-12 gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none"
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Featured Banner */}
      {featuredResource && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-surface rounded-2xl p-8 mb-8 relative overflow-hidden cursor-pointer"
          onClick={() => handleResourceClick(featuredResource)}
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary/20 to-secondary/10 rounded-full blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
              {featuredResource.icon ? (
                <featuredResource.icon className="w-8 h-8 text-primary-foreground" />
              ) : (
                <FileText className="w-8 h-8 text-primary-foreground" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-secondary fill-secondary" />
                <span className="text-xs font-medium text-secondary uppercase tracking-wider">Featured</span>
              </div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                {featuredResource.title}
              </h3>
              <p className="text-muted-foreground">
                {featuredResource.description}
              </p>
            </div>
            <Button 
              className="bg-primary hover:bg-primary/90 glow-turquoise flex-shrink-0"
              disabled={featuredResource.locked}
            >
              {featuredResource.locked ? (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Upgrade to Access
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Read Now
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Resource Grid */}
      {filteredResources.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-muted-foreground">No resources found matching your criteria.</p>
          <Button 
            variant="link" 
            onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
            className="mt-2"
          >
            Clear filters
          </Button>
        </motion.div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource, index) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + index * 0.05 }}
              className={`glass-surface rounded-xl p-6 relative group cursor-pointer hover:border-primary/30 transition-all ${
                resource.locked ? 'opacity-75' : ''
              }`}
              onClick={() => handleResourceClick(resource)}
            >
              {resource.locked && (
                <div className="absolute top-4 right-4">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              {resource.featured && !resource.locked && (
                <div className="absolute top-4 right-4">
                  <Star className="w-4 h-4 text-secondary fill-secondary" />
                </div>
              )}
              
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 rounded-md bg-muted text-xs font-medium text-muted-foreground">
                  {resource.type}
                </span>
                <span className="px-2 py-1 rounded-md bg-primary/10 text-xs font-medium text-primary">
                  {resource.category}
                </span>
                {resource.locked && (
                  <span className="px-2 py-1 rounded-md bg-secondary/10 text-xs font-medium text-secondary">
                    {getTierLabel(resource.tier)}
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {resource.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {resource.description}
              </p>
              
              <Button
                variant={resource.locked ? 'outline' : 'ghost'}
                size="sm"
                className={`w-full ${resource.locked ? 'border-muted-foreground/30' : ''}`}
                disabled={resource.locked}
              >
                {resource.locked ? (
                  <>
                    <Lock className="w-3 h-3 mr-2" />
                    Upgrade to Access
                  </>
                ) : (
                  <>
                    <BookOpen className="w-3 h-3 mr-2" />
                    Read Now
                  </>
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Resource Viewer Modal */}
      {selectedResource && (
        <ResourceViewer 
          resource={selectedResource} 
          onClose={() => setSelectedResource(null)} 
        />
      )}
    </div>
  );
};
