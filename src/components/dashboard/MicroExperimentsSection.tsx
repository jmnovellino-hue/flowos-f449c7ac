import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, FlaskConical, ChevronRight, X, Clock, Target, MessageSquare, Smile, Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MicroExperiment {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
  scienceExplanation: string;
  category: string;
}

interface ExperimentLog {
  what: string;
  when: string;
  why: string;
  outcome: string;
  feelingBefore: number;
  feelingAfter: number;
}

const microExperiments: MicroExperiment[] = [
  { 
    id: 1, 
    title: 'The 3-Second Pause', 
    description: 'Wait 3 seconds before answering any question today', 
    completed: false,
    active: false,
    scienceExplanation: 'Pausing activates the prefrontal cortex, shifting you from reactive (amygdala-driven) to reflective (PFC-driven) responses. Research shows a 3-second delay improves decision quality by 23% and reduces emotional reactivity.',
    category: 'Emotional Regulation'
  },
  { 
    id: 2, 
    title: 'Energy Audit', 
    description: 'Log your energy levels after each meeting today', 
    completed: true,
    active: false,
    scienceExplanation: 'Meta-awareness of energy fluctuations helps identify "energy vampires" in your schedule. Studies show leaders who track energy patterns make 31% better decisions about meeting scheduling and delegation.',
    category: 'Self-Awareness'
  },
  { 
    id: 3, 
    title: 'Delegation Win', 
    description: 'Delegate one task you would normally do yourself', 
    completed: false,
    active: true,
    scienceExplanation: 'The "Hero" archetype often struggles with over-responsibility. Deliberate delegation rewires neural pathways associated with control, reducing cortisol and building trust. Each delegation strengthens the anterior cingulate cortex.',
    category: 'Leadership Growth'
  },
  { 
    id: 4, 
    title: 'Gratitude Interrupt', 
    description: 'When stressed, pause and note 3 things going well', 
    completed: false,
    active: false,
    scienceExplanation: 'Gratitude activates the hypothalamus and dopamine pathways, directly counteracting the stress response. A 60-second gratitude practice reduces cortisol by 23% and improves subsequent decision-making clarity.',
    category: 'Stress Management'
  },
];

const feelingScale = [
  { value: 1, emoji: '😫', label: 'Stressed' },
  { value: 2, emoji: '😕', label: 'Uneasy' },
  { value: 3, emoji: '😐', label: 'Neutral' },
  { value: 4, emoji: '🙂', label: 'Calm' },
  { value: 5, emoji: '😌', label: 'Centered' },
];

export const MicroExperimentsSection = () => {
  const [experiments, setExperiments] = useState(microExperiments);
  const [selectedExperiment, setSelectedExperiment] = useState<MicroExperiment | null>(null);
  const [showTracker, setShowTracker] = useState(false);
  const [log, setLog] = useState<ExperimentLog>({
    what: '',
    when: '',
    why: '',
    outcome: '',
    feelingBefore: 3,
    feelingAfter: 3,
  });

  const activeExperiment = experiments.find(e => e.active);

  const handleActivate = (exp: MicroExperiment) => {
    setExperiments(experiments.map(e => ({
      ...e,
      active: e.id === exp.id
    })));
    setSelectedExperiment(null);
  };

  const handleComplete = () => {
    if (activeExperiment) {
      setExperiments(experiments.map(e => 
        e.id === activeExperiment.id 
          ? { ...e, completed: true, active: false }
          : e
      ));
      setShowTracker(false);
      setLog({ what: '', when: '', why: '', outcome: '', feelingBefore: 3, feelingAfter: 3 });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-surface rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-5 h-5 text-primary" />
        <span className="font-medium text-foreground">Today's Micro-Experiments</span>
      </div>

      {/* Active Experiment Tracker */}
      {activeExperiment && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Active Experiment</span>
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-primary"
              onClick={() => setShowTracker(!showTracker)}
            >
              {showTracker ? 'Hide Tracker' : 'Log Progress'}
            </Button>
          </div>
          <h4 className="font-semibold text-foreground">{activeExperiment.title}</h4>
          <p className="text-sm text-muted-foreground">{activeExperiment.description}</p>

          {/* Experiment Tracker Form */}
          <AnimatePresence>
            {showTracker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-4"
              >
                <div>
                  <label className="text-xs font-medium text-foreground flex items-center gap-1 mb-2">
                    <Target className="w-3 h-3" /> What did you do?
                  </label>
                  <Textarea
                    value={log.what}
                    onChange={(e) => setLog({ ...log, what: e.target.value })}
                    placeholder="Describe the specific action you took..."
                    className="min-h-[60px] bg-background/50 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-foreground flex items-center gap-1 mb-2">
                      <Clock className="w-3 h-3" /> When?
                    </label>
                    <input
                      type="text"
                      value={log.when}
                      onChange={(e) => setLog({ ...log, when: e.target.value })}
                      placeholder="e.g., 10:30am in standup"
                      className="w-full px-3 py-2 text-sm rounded-lg bg-background/50 border border-muted focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground flex items-center gap-1 mb-2">
                      <MessageSquare className="w-3 h-3" /> Why this experiment?
                    </label>
                    <input
                      type="text"
                      value={log.why}
                      onChange={(e) => setLog({ ...log, why: e.target.value })}
                      placeholder="What prompted you?"
                      className="w-full px-3 py-2 text-sm rounded-lg bg-background/50 border border-muted focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground mb-2 block">
                    <Smile className="w-3 h-3 inline mr-1" /> How did you feel?
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground block mb-2">Before</span>
                      <div className="flex gap-1">
                        {feelingScale.map((f) => (
                          <button
                            key={f.value}
                            onClick={() => setLog({ ...log, feelingBefore: f.value })}
                            className={`flex-1 p-2 rounded text-center transition-all ${
                              log.feelingBefore === f.value
                                ? 'bg-secondary/20 border border-secondary'
                                : 'bg-muted/30 border border-transparent'
                            }`}
                          >
                            <span className="text-lg">{f.emoji}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block mb-2">After</span>
                      <div className="flex gap-1">
                        {feelingScale.map((f) => (
                          <button
                            key={f.value}
                            onClick={() => setLog({ ...log, feelingAfter: f.value })}
                            className={`flex-1 p-2 rounded text-center transition-all ${
                              log.feelingAfter === f.value
                                ? 'bg-primary/20 border border-primary'
                                : 'bg-muted/30 border border-transparent'
                            }`}
                          >
                            <span className="text-lg">{f.emoji}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground mb-2 block">
                    What was the outcome?
                  </label>
                  <Textarea
                    value={log.outcome}
                    onChange={(e) => setLog({ ...log, outcome: e.target.value })}
                    placeholder="What did you notice? Any insights?"
                    className="min-h-[60px] bg-background/50 text-sm"
                  />
                </div>

                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={handleComplete}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Complete Experiment
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Experiment List */}
      <div className="space-y-3">
        {experiments.map((exp) => (
          <div
            key={exp.id}
            onClick={() => !exp.active && !exp.completed && setSelectedExperiment(exp)}
            className={`flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer ${
              exp.completed 
                ? 'bg-primary/10' 
                : exp.active 
                  ? 'bg-primary/5 border border-primary/20' 
                  : 'bg-muted/50 hover:bg-muted'
            }`}
          >
            <button
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                exp.completed
                  ? 'bg-primary border-primary text-primary-foreground'
                  : exp.active
                    ? 'border-primary animate-pulse'
                    : 'border-muted-foreground hover:border-primary'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (exp.active) setShowTracker(true);
              }}
            >
              {exp.completed && <span className="text-xs">✓</span>}
              {exp.active && <span className="w-2 h-2 bg-primary rounded-full" />}
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className={`font-medium ${exp.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                  {exp.title}
                </h4>
                {exp.active && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">Active</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{exp.description}</p>
            </div>
            {!exp.completed && !exp.active && (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Experiment Detail Modal */}
      <AnimatePresence>
        {selectedExperiment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedExperiment(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-surface rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-primary uppercase tracking-wider">
                  {selectedExperiment.category}
                </span>
                <button onClick={() => setSelectedExperiment(null)}>
                  <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                </button>
              </div>

              <h3 className="text-xl font-semibold text-foreground mb-2">
                {selectedExperiment.title}
              </h3>
              <p className="text-muted-foreground mb-6">
                {selectedExperiment.description}
              </p>

              {/* Science Explanation */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">The Science</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {selectedExperiment.scienceExplanation}
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => handleActivate(selectedExperiment)}
              >
                <FlaskConical className="w-4 h-4 mr-2" />
                Activate This Experiment
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
