import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface AssessmentFlowProps {
  onComplete: (results: AssessmentResults) => void;
}

interface AssessmentResults {
  archetype: string;
  values: string[];
  iceberg: {
    behavior: string;
    feeling: string;
    belief: string;
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
    placeholder: 'The specific action you want to change...',
    example: 'e.g., I constantly check emails during meetings',
  },
  {
    id: 'feeling',
    label: 'Waterline Feeling',
    placeholder: 'The immediate emotional trigger...',
    example: 'e.g., A spike of anxiety that I am missing critical info',
  },
  {
    id: 'belief',
    label: 'Deep Belief',
    placeholder: 'The root narrative driving this behavior...',
    example: 'e.g., My value as a leader depends on being the most responsive person',
  },
];

export const AssessmentFlow = ({ onComplete }: AssessmentFlowProps) => {
  const [phase, setPhase] = useState<'archetype' | 'compass' | 'values' | 'iceberg'>('archetype');
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

  const totalQuestions = archetypeQuestions.length + compassScenarios.length + 1 + 3; // +1 for value selection, +3 for iceberg
  const currentProgress = 
    phase === 'archetype' ? currentQuestion :
    phase === 'compass' ? archetypeQuestions.length + currentQuestion :
    phase === 'values' ? archetypeQuestions.length + compassScenarios.length :
    archetypeQuestions.length + compassScenarios.length + 1 + currentQuestion;

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

  const calculateArchetype = () => {
    const scores = { hero: 0, judge: 0, teacher: 0, servant: 0 };
    
    archetypeQuestions.forEach((q, index) => {
      const answer = archetypeAnswers[index] || 2; // Default to neutral
      scores[q.archetype as keyof typeof scores] += answer;
    });

    const maxScore = Math.max(...Object.values(scores));
    const archetype = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] || 'hero';
    
    const archetypeNames = {
      hero: 'The Hero',
      judge: 'The Judge',
      teacher: 'The Teacher',
      servant: 'The Servant',
    };
    
    return archetypeNames[archetype as keyof typeof archetypeNames];
  };

  const handleArchetypeAnswer = (value: number) => {
    setArchetypeAnswers({ ...archetypeAnswers, [currentQuestion]: value });
    
    if (currentQuestion < archetypeQuestions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      setTimeout(() => {
        setPhase('compass');
        setCurrentQuestion(0);
      }, 300);
    }
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
    setPhase('iceberg');
    setCurrentQuestion(0);
  };

  const handleIcebergNext = () => {
    if (currentQuestion < 2) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const results: AssessmentResults = {
        archetype: calculateArchetype(),
        values: selectedValues,
        iceberg: icebergAnswers,
      };
      onComplete(results);
    }
  };

  return (
    <div className="min-h-screen bg-background neural-grid flex flex-col">
      {/* Progress Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              {phase === 'archetype' && 'Phase 1: Leadership Style'}
              {phase === 'compass' && 'Phase 2: The Compass'}
              {phase === 'values' && 'Phase 3: Your Core Values'}
              {phase === 'iceberg' && 'Phase 4: The Iceberg'}
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

            {/* Iceberg Phase */}
            {phase === 'iceberg' && (
              <motion.div
                key={`iceberg-${currentQuestion}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="text-center mb-8">
                  <span className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-xs font-medium mb-4">
                    The Iceberg Commitment
                  </span>
                  <h2 className="text-2xl md:text-3xl font-display text-foreground mb-2">
                    {icebergPrompts[currentQuestion].label}
                  </h2>
                  <p className="text-muted-foreground">
                    {icebergPrompts[currentQuestion].example}
                  </p>
                </div>

                <div className="glass-surface rounded-2xl p-8">
                  <textarea
                    value={icebergAnswers[icebergPrompts[currentQuestion].id as keyof typeof icebergAnswers]}
                    onChange={(e) => setIcebergAnswers({
                      ...icebergAnswers,
                      [icebergPrompts[currentQuestion].id]: e.target.value,
                    })}
                    placeholder={icebergPrompts[currentQuestion].placeholder}
                    className="w-full h-32 bg-muted/50 border border-border/50 rounded-xl p-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>

                <div className="flex justify-between items-center">
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
                        Complete Assessment
                        <Check className="w-4 h-4 ml-2" />
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
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
