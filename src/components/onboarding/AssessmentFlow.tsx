import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Sparkles, Bell, Calendar, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  requestNotificationPermission, 
  saveCommitment, 
  generateCommitmentId,
  type IcebergCommitment 
} from '@/lib/notifications';

interface AssessmentFlowProps {
  onComplete: (results: AssessmentResults) => void;
}

interface ArchetypeBreakdown {
  name: string;
  percentage: number;
  description: string;
  shadow: string;
  shadowDescription: string;
}

interface AssessmentResults {
  archetype: string;
  archetypeBreakdown: ArchetypeBreakdown[];
  values: string[];
  iceberg: {
    behavior: string;
    feeling: string;
    belief: string;
    commitment: string;
    deadline: string;
  };
}

// 30 Leadership Style Questions - mapped to Hero, Judge, Teacher, Servant archetypes
const archetypeQuestions = [
  // Hero archetype questions (ownership, results, control)
  { id: 1, statement: "When facing a crisis, I take immediate control regardless of others' input.", archetype: 'hero' },
  { id: 2, statement: "If I don't do it myself, it won't be done right.", archetype: 'hero' },
  { id: 3, statement: "I often feel personally responsible when projects fail.", archetype: 'hero' },
  { id: 4, statement: "I prefer to work alone on critical tasks rather than delegate.", archetype: 'hero' },
  { id: 5, statement: "I measure my worth by results achieved.", archetype: 'hero' },
  { id: 6, statement: "I struggle to take vacation because things fall apart without me.", archetype: 'hero' },
  { id: 7, statement: "I find it difficult to trust others with important decisions.", archetype: 'hero' },
  { id: 8, statement: "I often rescue projects at the last minute.", archetype: 'hero' },
  
  // Judge archetype questions (standards, logic, fairness)
  { id: 9, statement: "I believe rules should apply equally to everyone, no exceptions.", archetype: 'judge' },
  { id: 10, statement: "I need to understand the logic behind decisions before accepting them.", archetype: 'judge' },
  { id: 11, statement: "I often analyze situations thoroughly before acting.", archetype: 'judge' },
  { id: 12, statement: "Inconsistency in how rules are applied frustrates me deeply.", archetype: 'judge' },
  { id: 13, statement: "I believe emotions should not influence business decisions.", archetype: 'judge' },
  { id: 14, statement: "I can be perceived as cold or detached when making tough calls.", archetype: 'judge' },
  { id: 15, statement: "I value precedent and established processes.", archetype: 'judge' },
  { id: 16, statement: "I find it hard to proceed without all the necessary data.", archetype: 'judge' },
  
  // Teacher archetype questions (growth, potential, development)
  { id: 17, statement: "I prefer to invest time in developing my team's potential over immediate results.", archetype: 'teacher' },
  { id: 18, statement: "I see every failure as a learning opportunity for my team.", archetype: 'teacher' },
  { id: 19, statement: "I get more satisfaction from watching others succeed than from my own wins.", archetype: 'teacher' },
  { id: 20, statement: "I spend significant time coaching and mentoring.", archetype: 'teacher' },
  { id: 21, statement: "I believe everyone has untapped potential waiting to be unlocked.", archetype: 'teacher' },
  { id: 22, statement: "I sometimes tolerate underperformance too long because I believe people can improve.", archetype: 'teacher' },
  { id: 23, statement: "I focus on long-term growth even when short-term results suffer.", archetype: 'teacher' },
  { id: 24, statement: "I naturally explain the 'why' behind decisions.", archetype: 'teacher' },
  
  // Servant archetype questions (harmony, support, empathy)
  { id: 25, statement: "Team harmony matters more to me than being right.", archetype: 'servant' },
  { id: 26, statement: "I often put my team's needs before my own.", archetype: 'servant' },
  { id: 27, statement: "I avoid conflict to maintain peace in the team.", archetype: 'servant' },
  { id: 28, statement: "I feel drained after dealing with team members' personal problems.", archetype: 'servant' },
  { id: 29, statement: "I shield my team from organizational pressure.", archetype: 'servant' },
  { id: 30, statement: "I struggle to deliver critical feedback because I worry about hurting feelings.", archetype: 'servant' },
];

const answerOptions = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];

// 10 Compass Scenarios - each maps to value categories
const compassScenarios = [
  {
    id: 1,
    scenario: "A loyal employee of 10 years commits a fireable offense during a personal crisis. You know they're going through a divorce.",
    options: [
      { text: 'Follow policy and terminate', values: ['justice', 'integrity'] },
      { text: 'Give them a final warning with conditions', values: ['mercy', 'compassion'] },
      { text: 'Create a performance plan with accountability', values: ['wisdom', 'growth'] },
      { text: 'Overlook it this time given their history', values: ['loyalty', 'trust'] },
    ],
  },
  {
    id: 2,
    scenario: "Your team discovers a major flaw in a product about to ship. Fixing it will delay launch by 2 months and cost significant revenue.",
    options: [
      { text: 'Delay and fix it properly', values: ['integrity', 'excellence'] },
      { text: 'Ship now, patch later with transparency', values: ['pragmatism', 'courage'] },
      { text: 'Consult with all stakeholders first', values: ['collaboration', 'wisdom'] },
      { text: 'Find an innovative workaround', values: ['innovation', 'creativity'] },
    ],
  },
  {
    id: 3,
    scenario: "A top performer on your team is toxic to colleagues. They hit every target but the team morale is suffering.",
    options: [
      { text: 'Remove them regardless of performance', values: ['harmony', 'respect'] },
      { text: 'Coach them intensively on behavior', values: ['growth', 'patience'] },
      { text: 'Isolate them from the team while keeping them', values: ['pragmatism', 'adaptability'] },
      { text: 'Set clear boundaries with consequences', values: ['justice', 'courage'] },
    ],
  },
  {
    id: 4,
    scenario: "You discover your boss is taking credit for your team's work in executive meetings.",
    options: [
      { text: 'Confront them directly and privately', values: ['courage', 'integrity'] },
      { text: 'Document and escalate to HR', values: ['justice', 'transparency'] },
      { text: 'Start cc-ing executives on important work', values: ['wisdom', 'pragmatism'] },
      { text: 'Let it go and focus on the work itself', values: ['humility', 'patience'] },
    ],
  },
  {
    id: 5,
    scenario: "A candidate lies on their resume but has clearly demonstrated they can do the job in interviews.",
    options: [
      { text: 'Reject them - integrity is non-negotiable', values: ['integrity', 'justice'] },
      { text: 'Hire them but document the concern', values: ['pragmatism', 'mercy'] },
      { text: 'Discuss the lie directly and assess their response', values: ['wisdom', 'growth'] },
      { text: 'Give them a trial period with close monitoring', values: ['trust', 'compassion'] },
    ],
  },
  {
    id: 6,
    scenario: "Your company asks you to lay off 20% of your team. You believe this will destroy the team's capability.",
    options: [
      { text: 'Push back hard with data and alternatives', values: ['courage', 'advocacy'] },
      { text: 'Execute the decision as directed', values: ['loyalty', 'duty'] },
      { text: 'Negotiate for voluntary exits first', values: ['compassion', 'wisdom'] },
      { text: 'Resign rather than execute this decision', values: ['integrity', 'conviction'] },
    ],
  },
  {
    id: 7,
    scenario: "A competitor offers to share confidential information about market strategy. It's legal but ethically gray.",
    options: [
      { text: 'Decline - this violates my principles', values: ['integrity', 'honor'] },
      { text: 'Listen but don\'t act on it directly', values: ['pragmatism', 'adaptability'] },
      { text: 'Report the offer to leadership', values: ['loyalty', 'transparency'] },
      { text: 'Accept - business is competitive', values: ['ambition', 'pragmatism'] },
    ],
  },
  {
    id: 8,
    scenario: "Your mentor asks you to support their controversial initiative that you don't fully agree with.",
    options: [
      { text: 'Support them - they\'ve earned my loyalty', values: ['loyalty', 'gratitude'] },
      { text: 'Express disagreement privately first', values: ['honesty', 'courage'] },
      { text: 'Remain neutral and let others decide', values: ['wisdom', 'patience'] },
      { text: 'Publicly oppose if I believe it\'s wrong', values: ['conviction', 'integrity'] },
    ],
  },
  {
    id: 9,
    scenario: "You have budget to either give small raises to your whole team or a significant bonus to your top 3 performers.",
    options: [
      { text: 'Distribute equally - team unity matters', values: ['equality', 'harmony'] },
      { text: 'Reward top performers significantly', values: ['excellence', 'meritocracy'] },
      { text: 'Weight toward struggling team members', values: ['compassion', 'support'] },
      { text: 'Let the team decide together', values: ['collaboration', 'transparency'] },
    ],
  },
  {
    id: 10,
    scenario: "You're offered a promotion that would require relocating your family. Your spouse has reservations.",
    options: [
      { text: 'Decline - family comes first', values: ['family', 'balance'] },
      { text: 'Take it - career opportunities are rare', values: ['ambition', 'growth'] },
      { text: 'Negotiate remote or delayed start', values: ['creativity', 'advocacy'] },
      { text: 'Have a deep discussion and decide together', values: ['partnership', 'respect'] },
    ],
  },
];

// Value categories with specific values
const valueCategories = [
  {
    name: 'Integrity & Truth',
    description: 'Living authentically and doing what\'s right',
    values: ['integrity', 'honesty', 'authenticity', 'transparency', 'honor'],
  },
  {
    name: 'Justice & Fairness',
    description: 'Equal treatment and principled decision-making',
    values: ['justice', 'equality', 'meritocracy', 'fairness', 'accountability'],
  },
  {
    name: 'Wisdom & Growth',
    description: 'Learning, perspective, and continuous improvement',
    values: ['wisdom', 'growth', 'learning', 'patience', 'perspective'],
  },
  {
    name: 'Courage & Conviction',
    description: 'Standing firm and taking bold action',
    values: ['courage', 'conviction', 'advocacy', 'boldness', 'resilience'],
  },
  {
    name: 'Compassion & Care',
    description: 'Empathy and supporting others\' wellbeing',
    values: ['compassion', 'mercy', 'empathy', 'kindness', 'support'],
  },
  {
    name: 'Loyalty & Trust',
    description: 'Commitment to relationships and reliability',
    values: ['loyalty', 'trust', 'reliability', 'commitment', 'gratitude'],
  },
  {
    name: 'Excellence & Achievement',
    description: 'High standards and pursuit of mastery',
    values: ['excellence', 'ambition', 'mastery', 'achievement', 'quality'],
  },
  {
    name: 'Harmony & Balance',
    description: 'Peace, collaboration, and life balance',
    values: ['harmony', 'balance', 'peace', 'collaboration', 'respect'],
  },
  {
    name: 'Innovation & Creativity',
    description: 'New ideas and adaptive thinking',
    values: ['innovation', 'creativity', 'adaptability', 'curiosity', 'originality'],
  },
  {
    name: 'Service & Duty',
    description: 'Contribution and responsibility to others',
    values: ['service', 'duty', 'contribution', 'responsibility', 'humility'],
  },
];

const icebergPrompts = [
  {
    id: 'behavior',
    label: 'Visible Behavior',
    subtitle: 'The Tip of the Iceberg',
    placeholder: 'Describe a specific action or habit you want to change...',
    example: 'e.g., I constantly check emails during meetings',
    explanation: 'Just like an iceberg, only 10% of our behavior is visible above the waterline. This is what others see — your actions, reactions, and habits. Identifying the specific behavior you want to change is the first step toward lasting transformation.',
    whyItMatters: 'By naming the behavior explicitly, you create awareness. Awareness is the catalyst for change. Without a clear target, transformation remains abstract.',
    howToComplete: 'Think of a recurring behavior that undermines your effectiveness or wellbeing. Be specific — instead of "I procrastinate," write "I delay starting important presentations until the last 48 hours."',
    tips: [
      'Focus on actions, not traits (what you do, not who you are)',
      'Choose something that happens regularly',
      'Be honest — this is for your growth',
    ],
  },
  {
    id: 'feeling',
    label: 'Waterline Feeling',
    subtitle: 'Just Below the Surface',
    placeholder: 'What emotion triggers or accompanies this behavior...',
    example: 'e.g., A spike of anxiety that I am missing critical info',
    explanation: 'Beneath every behavior lies an emotional trigger — the feeling that sparks the action. This operates at your "waterline," often just out of conscious awareness. These feelings are the bridge between what you do and why you do it.',
    whyItMatters: 'Emotions are data. When you understand the feeling driving your behavior, you gain the power to interrupt the pattern. Instead of reacting unconsciously, you can choose a different response.',
    howToComplete: 'When you engage in the behavior you identified, pause and ask: "What am I feeling right now?" Name the emotion — anxiety, fear, inadequacy, overwhelm, restlessness.',
    tips: [
      'Use feeling words: anxious, frustrated, inadequate, overwhelmed',
      'Notice physical sensations too: tight chest, racing thoughts',
      'There are no wrong answers — all feelings are valid data',
    ],
  },
  {
    id: 'belief',
    label: 'Deep Belief',
    subtitle: 'The Hidden Foundation',
    placeholder: 'The core belief or narrative driving everything...',
    example: 'e.g., My value as a leader depends on being the most responsive person',
    explanation: 'At the deepest level — the massive base of the iceberg hidden underwater — lies your core belief. This is the fundamental story you tell yourself about who you are, what you deserve, or how the world works. It\'s often formed early in life and operates unconsciously.',
    whyItMatters: 'Core beliefs are the root cause. Changing behaviors without addressing beliefs is like cutting weeds without pulling the roots — they always grow back. When you excavate and examine your deep beliefs, you can consciously choose which ones to keep and which to transform.',
    howToComplete: 'Ask yourself: "What must I believe about myself or the world for this feeling to make sense?" Complete this sentence: "Deep down, I believe that..."',
    tips: [
      'Look for "I am" or "I must" statements',
      'Consider: What would happen if you stopped this behavior?',
      'These beliefs often sound like rules: "Leaders must always..."',
    ],
  },
];

export const AssessmentFlow = ({ onComplete }: AssessmentFlowProps) => {
  const [phase, setPhase] = useState<'archetype' | 'results' | 'compass' | 'values' | 'iceberg-intro' | 'iceberg' | 'iceberg-commitment'>('archetype');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [archetypeAnswers, setArchetypeAnswers] = useState<Record<number, number>>({});
  const [compassAnswers, setCompassAnswers] = useState<Record<number, string[]>>({});
  const [suggestedCategories, setSuggestedCategories] = useState<typeof valueCategories>([]);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [icebergAnswers, setIcebergAnswers] = useState({
    behavior: '',
    feeling: '',
    belief: '',
  });
  const [commitmentData, setCommitmentData] = useState({
    commitment: '',
    deadline: '',
    enableReminders: true,
  });

  const totalQuestions = archetypeQuestions.length + compassScenarios.length + 1 + 1 + 3 + 1; // +1 for value selection, +1 for iceberg intro, +3 for iceberg, +1 for commitment
  const currentProgress = 
    phase === 'archetype' ? currentQuestion :
    phase === 'compass' ? archetypeQuestions.length + currentQuestion :
    phase === 'values' ? archetypeQuestions.length + compassScenarios.length :
    phase === 'iceberg-intro' ? archetypeQuestions.length + compassScenarios.length + 1 :
    phase === 'iceberg' ? archetypeQuestions.length + compassScenarios.length + 2 + currentQuestion :
    archetypeQuestions.length + compassScenarios.length + 5;

  const calculateSuggestedCategories = () => {
    // Count value occurrences from compass answers
    const valueCounts: Record<string, number> = {};
    Object.values(compassAnswers).forEach(values => {
      values.forEach(value => {
        valueCounts[value] = (valueCounts[value] || 0) + 1;
      });
    });

    // Score each category based on matching values
    const categoryScores = valueCategories.map(category => {
      const score = category.values.reduce((sum, value) => sum + (valueCounts[value] || 0), 0);
      return { ...category, score };
    });

    // Sort by score and return top 5 categories
    return categoryScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  };

  const archetypeInfo = {
    hero: { 
      name: 'The Hero', 
      description: 'Driven by ownership and results. Takes charge in crisis.',
      shadow: 'Martyr Syndrome',
      shadowDescription: 'Prone to burnout and micromanagement. Believes "if I don\'t do it, it fails." Struggles to delegate and takes on too much personal responsibility.',
    },
    judge: { 
      name: 'The Judge', 
      description: 'Driven by standards, logic, and fairness.',
      shadow: 'Analysis Paralysis',
      shadowDescription: 'Prone to rigidity and lack of empathy. Values rules over people. Can become cold or detached when making decisions.',
    },
    teacher: { 
      name: 'The Teacher', 
      description: 'Driven by growth and developing potential.',
      shadow: 'Perpetual Patience',
      shadowDescription: 'Prone to slow execution and tolerating underperformance too long. Focuses on the future at the expense of present results.',
    },
    servant: { 
      name: 'The Servant', 
      description: 'Driven by harmony and supporting others.',
      shadow: 'Empathy Fatigue',
      shadowDescription: 'Prone to conflict avoidance and lack of decisiveness. Shields the team to their own detriment and struggles with critical feedback.',
    },
  };

  const calculateArchetypeBreakdown = (): { primary: string; breakdown: ArchetypeBreakdown[] } => {
    const scores = { hero: 0, judge: 0, teacher: 0, servant: 0 };
    
    archetypeQuestions.forEach((q, index) => {
      const answer = archetypeAnswers[index] ?? 2; // Default to neutral
      scores[q.archetype as keyof typeof scores] += answer;
    });

    const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0);
    
    const breakdown: ArchetypeBreakdown[] = Object.entries(scores)
      .map(([key, score]) => {
        const info = archetypeInfo[key as keyof typeof archetypeInfo];
        return {
          name: info.name,
          percentage: totalScore > 0 ? Math.round((score / totalScore) * 100) : 25,
          description: info.description,
          shadow: info.shadow,
          shadowDescription: info.shadowDescription,
        };
      })
      .sort((a, b) => b.percentage - a.percentage);

    return { primary: breakdown[0].name, breakdown };
  };

  const [archetypeBreakdown, setArchetypeBreakdown] = useState<ArchetypeBreakdown[]>([]);
  const [primaryArchetype, setPrimaryArchetype] = useState('');

  const handleArchetypeAnswer = (value: number) => {
    setArchetypeAnswers({ ...archetypeAnswers, [currentQuestion]: value });
    
    if (currentQuestion < archetypeQuestions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      setTimeout(() => {
        const { primary, breakdown } = calculateArchetypeBreakdown();
        setPrimaryArchetype(primary);
        setArchetypeBreakdown(breakdown);
        setPhase('results');
      }, 300);
    }
  };

  const handleResultsContinue = () => {
    setPhase('compass');
    setCurrentQuestion(0);
  };

  const handleCompassAnswer = (values: string[]) => {
    setCompassAnswers({ ...compassAnswers, [currentQuestion]: values });
    
    if (currentQuestion < compassScenarios.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      setTimeout(() => {
        const suggested = calculateSuggestedCategories();
        setSuggestedCategories(suggested);
        setPhase('values');
      }, 300);
    }
  };

  const handleValueToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter(v => v !== value));
    } else if (selectedValues.length < 5) {
      setSelectedValues([...selectedValues, value]);
    }
  };

  const handleValuesComplete = () => {
    setPhase('iceberg-intro');
  };

  const handleIcebergIntroComplete = () => {
    setPhase('iceberg');
    setCurrentQuestion(0);
  };

  const handleIcebergNext = () => {
    if (currentQuestion < 2) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Move to commitment phase after completing the 3 iceberg questions
      setPhase('iceberg-commitment');
    }
  };

  const handleCommitmentComplete = async () => {
    // Save commitment with notifications if enabled
    if (commitmentData.enableReminders && commitmentData.deadline) {
      const hasPermission = await requestNotificationPermission();
      
      if (hasPermission) {
        const commitment: IcebergCommitment = {
          id: generateCommitmentId(),
          behavior: icebergAnswers.behavior,
          feeling: icebergAnswers.feeling,
          belief: icebergAnswers.belief,
          commitment: commitmentData.commitment,
          deadline: commitmentData.deadline,
          createdAt: new Date().toISOString(),
          reminderEnabled: true,
        };
        saveCommitment(commitment);
      }
    }

    const results: AssessmentResults = {
      archetype: primaryArchetype,
      archetypeBreakdown,
      values: selectedValues,
      iceberg: {
        ...icebergAnswers,
        commitment: commitmentData.commitment,
        deadline: commitmentData.deadline,
      },
    };
    onComplete(results);
  };

  return (
    <div className="min-h-screen bg-background neural-grid flex flex-col">
      {/* Progress Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              {phase === 'archetype' && 'Phase 1: Leadership Style'}
              {phase === 'results' && 'Your Archetype Results'}
              {phase === 'compass' && 'Phase 2: The Compass'}
              {phase === 'values' && 'Phase 3: Your Core Values'}
              {phase === 'iceberg-intro' && 'Phase 4: The Iceberg'}
              {phase === 'iceberg' && 'Phase 4: The Iceberg'}
              {phase === 'iceberg-commitment' && 'Phase 5: Your Commitment'}
            </span>
            <span className="text-sm text-primary font-medium">
              {Math.round((currentProgress / totalQuestions) * 100)}%
            </span>
          </div>
          <Progress value={(currentProgress / totalQuestions) * 100} className="h-1.5" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 pt-24 pb-12">
        <div className="max-w-2xl w-full">
          <AnimatePresence mode="wait">
            {/* Archetype Phase - 30 Questions */}
            {phase === 'archetype' && (
              <motion.div
                key={`archetype-${currentQuestion}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
                    Question {currentQuestion + 1} of {archetypeQuestions.length}
                  </span>
                  <p className="text-xl md:text-2xl font-display text-foreground leading-relaxed">
                    "{archetypeQuestions[currentQuestion].statement}"
                  </p>
                </div>

                <div className="grid gap-3">
                  {answerOptions.map((option, index) => (
                    <motion.button
                      key={option}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleArchetypeAnswer(index)}
                      className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                        archetypeAnswers[currentQuestion] === index
                          ? 'bg-primary text-primary-foreground glow-emerald'
                          : 'glass-surface hover:bg-muted/80 hover:border-primary/30'
                      }`}
                    >
                      <span className="font-medium">{option}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Quick navigation for archetype questions */}
                <div className="flex justify-center gap-1 pt-4 flex-wrap">
                  {archetypeQuestions.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentQuestion(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === currentQuestion 
                          ? 'bg-primary w-4' 
                          : archetypeAnswers[i] !== undefined 
                            ? 'bg-primary/50' 
                            : 'bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Archetype Results Phase */}
            {phase === 'results' && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4"
                  >
                    <Sparkles className="w-8 h-8 text-primary" />
                  </motion.div>
                  <h2 className="text-2xl md:text-3xl font-display text-foreground mb-2">
                    Your Leadership Archetype
                  </h2>
                  <p className="text-muted-foreground">
                    Based on your responses, here's your leadership style breakdown
                  </p>
                </div>

                <div className="glass-surface rounded-2xl p-6 space-y-6">
                  {/* Primary Archetype */}
                  <div className="text-center pb-4 border-b border-border/50">
                    <span className="text-sm text-muted-foreground uppercase tracking-wider">Primary Archetype</span>
                    <h3 className="text-3xl font-display text-primary mt-1">{primaryArchetype}</h3>
                  </div>

                  {/* All Archetypes Breakdown */}
                  <div className="space-y-5">
                    {archetypeBreakdown.map((archetype, index) => (
                      <motion.div
                        key={archetype.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <span className={`font-medium ${index === 0 ? 'text-primary' : 'text-foreground'}`}>
                              {archetype.name}
                            </span>
                            <p className="text-xs text-muted-foreground">{archetype.description}</p>
                          </div>
                          <span className={`text-lg font-bold ${index === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                            {archetype.percentage}%
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${archetype.percentage}%` }}
                            transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                            className={`h-full rounded-full ${
                              index === 0 ? 'bg-primary glow-emerald' : 'bg-muted-foreground/50'
                            }`}
                          />
                        </div>
                        {/* Shadow Analysis */}
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                          className={`rounded-lg p-3 mt-2 ${
                            index === 0 
                              ? 'bg-destructive/10 border border-destructive/20' 
                              : 'bg-muted/30 border border-border/30'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className={`text-xs font-semibold uppercase tracking-wider ${
                              index === 0 ? 'text-destructive' : 'text-muted-foreground'
                            }`}>
                              Shadow: {archetype.shadow}
                            </span>
                          </div>
                          <p className={`text-xs mt-1 ${
                            index === 0 ? 'text-destructive/80' : 'text-muted-foreground/70'
                          }`}>
                            {archetype.shadowDescription}
                          </p>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleResultsContinue}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground glow-emerald"
                >
                  Continue to Value Discovery
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            )}

            {/* Compass Phase - 10 Scenarios */}
            {phase === 'compass' && (
              <motion.div
                key={`compass-${currentQuestion}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <span className="inline-block px-3 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-medium mb-4">
                    Scenario {currentQuestion + 1} of {compassScenarios.length}
                  </span>
                </div>

                <div className="glass-surface rounded-2xl p-8">
                  <p className="text-lg md:text-xl text-foreground leading-relaxed mb-8">
                    {compassScenarios[currentQuestion].scenario}
                  </p>

                  <div className="grid gap-3">
                    {compassScenarios[currentQuestion].options.map((option, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleCompassAnswer(option.values)}
                        className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                          compassAnswers[currentQuestion]?.join() === option.values.join()
                            ? 'bg-secondary text-secondary-foreground glow-amber'
                            : 'bg-muted/50 hover:bg-muted border border-border/50 hover:border-secondary/30'
                        }`}
                      >
                        <span className="font-medium">{option.text}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Scenario navigation dots */}
                <div className="flex justify-center gap-2">
                  {compassScenarios.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentQuestion(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === currentQuestion 
                          ? 'bg-secondary w-4' 
                          : compassAnswers[i] !== undefined 
                            ? 'bg-secondary/50' 
                            : 'bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Values Selection Phase */}
            {phase === 'values' && (
              <motion.div
                key="values"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 text-sm font-medium mb-4">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-foreground">Based on your choices</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-display text-foreground mb-2">
                    Select Your Core Values
                  </h2>
                  <p className="text-muted-foreground">
                    Choose up to 5 values that resonate most deeply with you
                  </p>
                  <p className="text-sm text-primary mt-2">
                    {selectedValues.length}/5 selected
                  </p>
                </div>

                <div className="space-y-4">
                  {suggestedCategories.map((category, catIndex) => (
                    <motion.div
                      key={category.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: catIndex * 0.1 }}
                      className="glass-surface rounded-2xl p-6"
                    >
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {category.values.map((value) => (
                          <button
                            key={value}
                            onClick={() => handleValueToggle(value)}
                            disabled={!selectedValues.includes(value) && selectedValues.length >= 5}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 capitalize ${
                              selectedValues.includes(value)
                                ? 'bg-primary text-primary-foreground glow-emerald'
                                : selectedValues.length >= 5
                                  ? 'bg-muted/30 text-muted-foreground cursor-not-allowed'
                                  : 'bg-muted/50 text-foreground hover:bg-muted border border-border/50 hover:border-primary/30'
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {selectedValues.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-surface rounded-2xl p-6 border-primary/30"
                  >
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Your Selected Values</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedValues.map((value) => (
                        <span
                          key={value}
                          className="px-3 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium capitalize"
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div className="flex justify-center pt-4">
                  <Button
                    onClick={handleValuesComplete}
                    disabled={selectedValues.length === 0}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground glow-emerald px-8"
                  >
                    Continue to The Iceberg
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Iceberg Intro Phase */}
            {phase === 'iceberg-intro' && (
              <motion.div
                key="iceberg-intro"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="text-center mb-6">
                  <span className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-xs font-medium mb-4">
                    The Iceberg Commitment
                  </span>
                  <h2 className="text-2xl md:text-3xl font-display text-foreground mb-4">
                    Understanding Your Hidden Depths
                  </h2>
                  <p className="text-muted-foreground max-w-xl mx-auto">
                    Like an iceberg, only a small fraction of who we are is visible to the world. 
                    Let's explore the three layers that shape your leadership.
                  </p>
                </div>

                {/* Visual Iceberg Diagram */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative max-w-md mx-auto"
                >
                  {/* Waterline indicator */}
                  <div className="absolute left-0 right-0 top-[88px] flex items-center z-10">
                    <div className="flex-1 h-px bg-blue-400/50" />
                    <span className="px-3 text-xs text-blue-400 font-medium whitespace-nowrap">~ Waterline ~</span>
                    <div className="flex-1 h-px bg-blue-400/50" />
                  </div>

                  {/* Iceberg SVG visualization */}
                  <div className="relative">
                    {/* Above water - Visible Behavior */}
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="relative h-24 flex items-center justify-center"
                    >
                      <div 
                        className="w-32 h-20 bg-gradient-to-b from-primary/40 to-primary/60 rounded-t-full flex items-center justify-center"
                        style={{ clipPath: 'polygon(20% 100%, 80% 100%, 100% 0, 0 0)' }}
                      >
                        <span className="text-xs font-medium text-primary-foreground/90 text-center px-2">
                          10% Visible
                        </span>
                      </div>
                    </motion.div>

                    {/* Water surface effect */}
                    <div className="h-2 bg-gradient-to-b from-blue-500/20 to-blue-600/40 rounded-sm" />

                    {/* Below water - Hidden layers */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="relative bg-gradient-to-b from-blue-600/30 via-blue-700/40 to-blue-900/50 rounded-b-3xl pt-4 pb-8"
                    >
                      <div className="flex flex-col items-center">
                        {/* Middle section - Feelings */}
                        <div 
                          className="w-48 h-24 bg-gradient-to-b from-primary/50 to-primary/70 flex items-center justify-center mb-2"
                          style={{ clipPath: 'polygon(10% 0, 90% 0, 100% 100%, 0 100%)' }}
                        >
                          <span className="text-xs font-medium text-primary-foreground/90 text-center px-4">
                            Feelings & Emotions
                          </span>
                        </div>

                        {/* Bottom section - Beliefs */}
                        <div 
                          className="w-64 h-28 bg-gradient-to-b from-primary/70 to-primary flex items-center justify-center"
                          style={{ clipPath: 'polygon(5% 0, 95% 0, 80% 100%, 20% 100%)', borderRadius: '0 0 50% 50%' }}
                        >
                          <span className="text-xs font-medium text-primary-foreground text-center px-4">
                            Deep Beliefs & Stories
                          </span>
                        </div>

                        <span className="text-xs text-blue-300/70 mt-4">90% Hidden</span>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Three Layer Explanations */}
                <div className="space-y-4 max-w-lg mx-auto">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-surface rounded-xl p-4 border-l-4 border-l-primary/60"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">Visible Behavior</h4>
                        <p className="text-sm text-muted-foreground">
                          The actions others can see — your habits, reactions, and patterns that play out in the world.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass-surface rounded-xl p-4 border-l-4 border-l-primary/70"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">Waterline Feelings</h4>
                        <p className="text-sm text-muted-foreground">
                          The emotional triggers just below the surface — anxiety, fear, frustration — that spark your behaviors.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    className="glass-surface rounded-xl p-4 border-l-4 border-l-primary"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/40 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary-foreground">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">Deep Beliefs</h4>
                        <p className="text-sm text-muted-foreground">
                          The foundational narratives about yourself and the world — often formed early in life — that drive everything above.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Purpose explanation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="glass-surface rounded-2xl p-6 text-center max-w-lg mx-auto"
                >
                  <Sparkles className="w-6 h-6 text-primary mx-auto mb-3" />
                  <h4 className="font-medium text-foreground mb-2">Why This Matters</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Lasting change happens from the bottom up. By uncovering the beliefs beneath your behaviors, 
                    you gain the power to transform patterns that no longer serve you. In the next steps, 
                    you'll identify one behavior you want to change and trace it to its root.
                  </p>
                </motion.div>

                <div className="flex justify-center pt-4">
                  <Button
                    onClick={handleIcebergIntroComplete}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground glow-emerald px-8"
                  >
                    Begin The Iceberg
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Iceberg Phase */}
            {phase === 'iceberg' && (
              <motion.div
                key={`iceberg-${currentQuestion}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Header with concept explanation */}
                <div className="text-center mb-6">
                  <span className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-xs font-medium mb-4">
                    The Iceberg Commitment — Step {currentQuestion + 1} of 3
                  </span>
                  <h2 className="text-2xl md:text-3xl font-display text-foreground mb-1">
                    {icebergPrompts[currentQuestion].label}
                  </h2>
                  <p className="text-sm text-primary font-medium">
                    {icebergPrompts[currentQuestion].subtitle}
                  </p>
                </div>

                {/* Main explanation card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-surface rounded-2xl p-6 border-l-4 border-l-primary"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">What is this?</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {icebergPrompts[currentQuestion].explanation}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Why it matters */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-surface rounded-2xl p-6"
                >
                  <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <span className="text-primary">✦</span> Why This Matters
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {icebergPrompts[currentQuestion].whyItMatters}
                  </p>
                </motion.div>

                {/* How to complete + Tips */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-surface rounded-2xl p-6"
                >
                  <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <span className="text-primary">✦</span> How to Complete This Step
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {icebergPrompts[currentQuestion].howToComplete}
                  </p>
                  
                  <div className="bg-muted/30 rounded-xl p-4">
                    <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Tips</h5>
                    <ul className="space-y-2">
                      {icebergPrompts[currentQuestion].tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-foreground/80">
                          <span className="text-primary mt-0.5">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>

                {/* Input area */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="glass-surface rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-foreground">Your Response</h4>
                    <span className="text-xs text-muted-foreground italic">
                      {icebergPrompts[currentQuestion].example}
                    </span>
                  </div>
                  <textarea
                    value={icebergAnswers[icebergPrompts[currentQuestion].id as keyof typeof icebergAnswers]}
                    onChange={(e) => setIcebergAnswers({
                      ...icebergAnswers,
                      [icebergPrompts[currentQuestion].id]: e.target.value,
                    })}
                    placeholder={icebergPrompts[currentQuestion].placeholder}
                    className="w-full h-32 bg-muted/50 border border-border/50 rounded-xl p-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </motion.div>

                {/* Iceberg visual indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-center gap-2 py-2"
                >
                  {icebergPrompts.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentQuestion
                          ? 'w-8 bg-primary'
                          : index < currentQuestion
                            ? 'w-2 bg-primary/60'
                            : 'w-2 bg-muted'
                      }`}
                    />
                  ))}
                </motion.div>

                <div className="flex justify-between items-center pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (currentQuestion > 0) {
                        setCurrentQuestion(currentQuestion - 1);
                      } else {
                        setPhase('values');
                      }
                    }}
                    className="text-muted-foreground"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleIcebergNext}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground glow-emerald"
                  >
                    {currentQuestion === 2 ? (
                      <>
                        Set Your Commitment
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Iceberg Commitment Phase */}
            {phase === 'iceberg-commitment' && (
              <motion.div
                key="iceberg-commitment"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium mb-4">
                    Final Step
                  </span>
                  <h2 className="text-2xl md:text-3xl font-display text-foreground mb-2">
                    Seal Your Commitment
                  </h2>
                  <p className="text-muted-foreground max-w-lg mx-auto">
                    Now that you've explored your iceberg, it's time to make a concrete commitment to change.
                  </p>
                </div>

                {/* Summary of iceberg exploration */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-surface rounded-2xl p-6"
                >
                  <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Your Iceberg Summary
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <span className="text-muted-foreground">Behavior:</span>
                      <p className="text-foreground mt-1">{icebergAnswers.behavior || 'Not specified'}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <span className="text-muted-foreground">Feeling:</span>
                      <p className="text-foreground mt-1">{icebergAnswers.feeling || 'Not specified'}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <span className="text-muted-foreground">Deep Belief:</span>
                      <p className="text-foreground mt-1">{icebergAnswers.belief || 'Not specified'}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Commitment input */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-surface rounded-2xl p-6"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Target className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">What will you do differently?</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Define a specific, actionable commitment. What new behavior will replace the old one?
                      </p>
                      <textarea
                        value={commitmentData.commitment}
                        onChange={(e) => setCommitmentData({ ...commitmentData, commitment: e.target.value })}
                        placeholder="e.g., When I feel the urge to check emails in meetings, I will take a deep breath and remind myself that I am present and valuable regardless of response time..."
                        className="w-full h-28 bg-muted/50 border border-border/50 rounded-xl p-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 resize-none text-sm"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Deadline input */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-surface rounded-2xl p-6"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">When is your deadline?</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Set a date by which you'll have fully integrated this new behavior. We recommend 21-30 days.
                      </p>
                      <input
                        type="date"
                        value={commitmentData.deadline}
                        onChange={(e) => setCommitmentData({ ...commitmentData, deadline: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-muted/50 border border-border/50 rounded-xl p-4 text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Reminder toggle */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="glass-surface rounded-2xl p-6"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Bell className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-foreground mb-1">Daily Reminders</h4>
                          <p className="text-sm text-muted-foreground">
                            Receive daily notifications about your commitment until your deadline.
                          </p>
                        </div>
                        <button
                          onClick={() => setCommitmentData({ ...commitmentData, enableReminders: !commitmentData.enableReminders })}
                          className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                            commitmentData.enableReminders ? 'bg-primary' : 'bg-muted'
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                              commitmentData.enableReminders ? 'translate-x-7' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      {commitmentData.enableReminders && (
                        <p className="text-xs text-primary mt-2">
                          ✓ You'll receive browser notifications to help you stay on track
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Why commitments work */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-muted/20 rounded-xl p-4 border border-border/30"
                >
                  <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Why This Works</h5>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Research shows that writing down commitments increases follow-through by 42%, and daily reminders 
                    help rewire neural pathways over 21+ days. You're not just making a promise — you're reprogramming your brain.
                  </p>
                </motion.div>

                <div className="flex justify-between items-center pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setPhase('iceberg');
                      setCurrentQuestion(2);
                    }}
                    className="text-muted-foreground"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleCommitmentComplete}
                    disabled={!commitmentData.commitment.trim() || !commitmentData.deadline}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground glow-emerald px-8"
                  >
                    Complete Assessment
                    <Check className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
