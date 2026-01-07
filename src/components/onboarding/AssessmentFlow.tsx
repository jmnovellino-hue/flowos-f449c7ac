import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
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

const archetypeQuestions = [
  {
    id: 1,
    statement: "When facing a crisis, I take immediate control regardless of others' input.",
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
  },
  {
    id: 2,
    statement: "I believe rules should apply equally to everyone, no exceptions.",
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
  },
  {
    id: 3,
    statement: "I prefer to invest time in developing my team's potential over immediate results.",
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
  },
  {
    id: 4,
    statement: "Team harmony matters more to me than being right.",
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
  },
  {
    id: 5,
    statement: "If I don't do it myself, it won't be done right.",
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
  },
];

const compassScenarios = [
  {
    id: 1,
    scenario: "A loyal employee of 10 years commits a fireable offense during a personal crisis. You know they're going through a divorce.",
    options: [
      { text: 'Follow policy and terminate', value: 'justice' },
      { text: 'Give them a final warning', value: 'mercy' },
      { text: 'Create a performance plan', value: 'wisdom' },
      { text: 'Overlook it this time', value: 'loyalty' },
    ],
  },
  {
    id: 2,
    scenario: "Your team discovers a major flaw in a product about to ship. Fixing it will delay launch by 2 months.",
    options: [
      { text: 'Delay and fix it properly', value: 'integrity' },
      { text: 'Ship now, patch later', value: 'pragmatism' },
      { text: 'Consult with stakeholders', value: 'collaboration' },
      { text: 'Find a partial fix', value: 'innovation' },
    ],
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
  const [phase, setPhase] = useState<'archetype' | 'compass' | 'iceberg'>('archetype');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [archetypeAnswers, setArchetypeAnswers] = useState<Record<number, number>>({});
  const [compassAnswers, setCompassAnswers] = useState<Record<number, string>>({});
  const [icebergAnswers, setIcebergAnswers] = useState({
    behavior: '',
    feeling: '',
    belief: '',
  });

  const totalQuestions = archetypeQuestions.length + compassScenarios.length + 3;
  const currentProgress = 
    phase === 'archetype' ? currentQuestion :
    phase === 'compass' ? archetypeQuestions.length + currentQuestion :
    archetypeQuestions.length + compassScenarios.length + currentQuestion;

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

  const handleCompassAnswer = (value: string) => {
    setCompassAnswers({ ...compassAnswers, [currentQuestion]: value });
    
    if (currentQuestion < compassScenarios.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      setTimeout(() => {
        setPhase('iceberg');
        setCurrentQuestion(0);
      }, 300);
    }
  };

  const handleIcebergNext = () => {
    if (currentQuestion < 2) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate results
      const results: AssessmentResults = {
        archetype: 'The Hero', // Would be calculated from answers
        values: ['Integrity', 'Wisdom', 'Innovation'],
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
              {phase === 'iceberg' && 'Phase 3: The Iceberg'}
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
            {/* Archetype Phase */}
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
                  {archetypeQuestions[currentQuestion].options.map((option, index) => (
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
              </motion.div>
            )}

            {/* Compass Phase */}
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
                        key={option.value}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleCompassAnswer(option.value)}
                        className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                          compassAnswers[currentQuestion] === option.value
                            ? 'bg-secondary text-secondary-foreground glow-amber'
                            : 'bg-muted/50 hover:bg-muted border border-border/50 hover:border-secondary/30'
                        }`}
                      >
                        <span className="font-medium">{option.text}</span>
                      </motion.button>
                    ))}
                  </div>
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
                    onClick={() => currentQuestion > 0 && setCurrentQuestion(currentQuestion - 1)}
                    disabled={currentQuestion === 0}
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
