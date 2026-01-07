import { motion } from 'framer-motion';
import { Flame, TrendingUp, Target, Quote, ChevronRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface HomeTabProps {
  userProfile: {
    name: string;
    archetype: string;
    streak: number;
    iceberg?: {
      behavior: string;
      feeling: string;
      belief: string;
    };
  };
}

const dailyWisdom = {
  quote: "Until you make the unconscious conscious, it will direct your life and you will call it fate.",
  author: "Carl Jung",
  category: "Shadow Work"
};

const microExperiments = [
  { id: 1, title: 'The 3-Second Pause', description: 'Wait 3 seconds before answering any question', completed: false },
  { id: 2, title: 'Energy Audit', description: 'Log your energy levels after each meeting', completed: true },
  { id: 3, title: 'Delegation Win', description: 'Delegate one task you would normally do yourself', completed: false },
];

export const HomeTab = ({ userProfile }: HomeTabProps) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', subtitle: 'Focus.' };
    if (hour < 17) return { text: 'Good Afternoon', subtitle: 'Execute.' };
    return { text: 'Good Evening', subtitle: 'Decompress.' };
  };

  const greeting = getGreeting();

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto pb-24 md:pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-2">
          {greeting.text}, <span className="text-gradient-primary">{userProfile.name}</span>
        </h1>
        <p className="text-lg text-muted-foreground">{greeting.subtitle}</p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Wisdom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-surface rounded-2xl p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-6">
                <Quote className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium text-primary uppercase tracking-wider">
                  Daily Wisdom
                </span>
                <span className="ml-auto text-xs text-muted-foreground">{dailyWisdom.category}</span>
              </div>
              <blockquote className="text-xl md:text-2xl font-display text-foreground leading-relaxed mb-4">
                "{dailyWisdom.quote}"
              </blockquote>
              <cite className="text-muted-foreground not-italic">
                — {dailyWisdom.author}
              </cite>
            </div>
          </motion.div>

          {/* Active Iceberg */}
          {userProfile.iceberg && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-surface rounded-2xl p-6 border-l-4 border-l-secondary"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-secondary" />
                  <span className="font-medium text-foreground">Active Iceberg Commitment</span>
                </div>
                <Button variant="ghost" size="sm" className="text-primary">
                  Update
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Behavior</span>
                  <p className="text-foreground">{userProfile.iceberg.behavior}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Feeling</span>
                  <p className="text-foreground">{userProfile.iceberg.feeling}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Deep Belief</span>
                  <p className="text-foreground">{userProfile.iceberg.belief}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Micro-Experiments */}
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
            <div className="space-y-3">
              {microExperiments.map((exp) => (
                <div
                  key={exp.id}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    exp.completed ? 'bg-primary/10' : 'bg-muted/50 hover:bg-muted'
                  }`}
                >
                  <button
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      exp.completed
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-muted-foreground hover:border-primary'
                    }`}
                  >
                    {exp.completed && <span className="text-xs">✓</span>}
                  </button>
                  <div className="flex-1">
                    <h4 className={`font-medium ${exp.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {exp.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">{exp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Side Column */}
        <div className="space-y-6">
          {/* The Pulse */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-surface rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Flame className="w-5 h-5 text-secondary" />
              <span className="font-medium text-foreground">The Pulse</span>
            </div>
            <div className="text-center mb-6">
              <div className="text-5xl font-display font-bold text-secondary mb-2">
                {userProfile.streak}
              </div>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Top 15% of leaders</span>
                <span className="text-primary font-medium">92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
          </motion.div>

          {/* Archetype Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-surface rounded-2xl p-6 relative overflow-hidden"
          >
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-primary/20 to-accent/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium text-primary uppercase tracking-wider">
                  Your Archetype
                </span>
              </div>
              <h3 className="text-2xl font-display font-semibold text-foreground mb-3">
                {userProfile.archetype}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Driven by ownership and results. Watch for Martyr Syndrome.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                View Full Analysis
              </Button>
            </div>
          </motion.div>

          {/* Quick Bio Entry */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-surface rounded-2xl p-6"
          >
            <h3 className="font-medium text-foreground mb-4">Quick Bio Check-in</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Sleep Quality</span>
                  <span className="text-foreground font-medium">7/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  defaultValue="7"
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Energy Level</span>
                  <span className="text-foreground font-medium">8/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  defaultValue="8"
                  className="w-full accent-secondary"
                />
              </div>
            </div>
            <Button className="w-full mt-4 bg-primary hover:bg-primary/90">
              Log Today
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
