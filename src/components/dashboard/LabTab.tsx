import { motion } from 'framer-motion';
import { Brain, Moon, Utensils, Activity, Lock, TrendingUp, Droplets, Wind, BookHeart, Timer, Trophy, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useState, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';

interface WellnessActivity {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  checklist: { id: string; label: string; points: number }[];
}

const wellnessActivities: WellnessActivity[] = [
  {
    id: 'sleep',
    label: 'Sleep',
    icon: Moon,
    color: 'primary',
    checklist: [
      { id: 'sleep_7h', label: '7+ hours of sleep', points: 20 },
      { id: 'sleep_no_screen', label: 'No screens 1h before bed', points: 10 },
      { id: 'sleep_routine', label: 'Consistent bedtime routine', points: 10 },
      { id: 'sleep_dark', label: 'Dark, cool room', points: 5 },
    ],
  },
  {
    id: 'nutrition',
    label: 'Nutrition',
    icon: Utensils,
    color: 'secondary',
    checklist: [
      { id: 'nutrition_breakfast', label: 'Nutritious breakfast', points: 15 },
      { id: 'nutrition_protein', label: 'Adequate protein intake', points: 15 },
      { id: 'nutrition_vegetables', label: '5+ servings of vegetables', points: 10 },
      { id: 'nutrition_no_junk', label: 'Avoided processed foods', points: 10 },
    ],
  },
  {
    id: 'exercise',
    label: 'Exercise',
    icon: Activity,
    color: 'accent',
    checklist: [
      { id: 'exercise_30min', label: '30+ minutes of movement', points: 20 },
      { id: 'exercise_strength', label: 'Strength training', points: 15 },
      { id: 'exercise_stretch', label: 'Stretching / flexibility', points: 10 },
      { id: 'exercise_walk', label: '10,000+ steps', points: 10 },
    ],
  },
  {
    id: 'meditation',
    label: 'Meditation',
    icon: Timer,
    color: 'primary',
    checklist: [
      { id: 'meditation_10min', label: '10+ minutes meditation', points: 20 },
      { id: 'meditation_morning', label: 'Morning mindfulness practice', points: 15 },
      { id: 'meditation_gratitude', label: 'Gratitude reflection', points: 10 },
    ],
  },
  {
    id: 'water',
    label: 'Water Intake',
    icon: Droplets,
    color: 'secondary',
    checklist: [
      { id: 'water_8cups', label: '8+ glasses of water', points: 20 },
      { id: 'water_morning', label: 'Glass of water upon waking', points: 10 },
      { id: 'water_no_soda', label: 'No sugary drinks', points: 10 },
    ],
  },
  {
    id: 'breathwork',
    label: 'Time to Breathe',
    icon: Wind,
    color: 'accent',
    checklist: [
      { id: 'breath_deep', label: 'Deep breathing exercises', points: 15 },
      { id: 'breath_breaks', label: 'Breathing breaks between tasks', points: 10 },
      { id: 'breath_box', label: 'Box breathing practice', points: 15 },
    ],
  },
  {
    id: 'reflection',
    label: 'Self-Reflection',
    icon: BookHeart,
    color: 'primary',
    checklist: [
      { id: 'reflection_journal', label: 'Journaling session', points: 20 },
      { id: 'reflection_goals', label: 'Reviewed daily goals', points: 10 },
      { id: 'reflection_learn', label: 'Identified one learning', points: 10 },
      { id: 'reflection_wins', label: 'Acknowledged today\'s wins', points: 10 },
    ],
  },
];

// Mock data for comparison
const mockUserStats = {
  personalBest: 87,
  percentile: 78,
  streak: 12,
};

export const LabTab = () => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [isPremium] = useState(true);

  const handleCheck = (itemId: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const calculateActivityScore = (activity: WellnessActivity) => {
    return activity.checklist.reduce((sum, item) => 
      sum + (checkedItems[item.id] ? item.points : 0), 0
    );
  };

  const calculateMaxActivityScore = (activity: WellnessActivity) => {
    return activity.checklist.reduce((sum, item) => sum + item.points, 0);
  };

  const totalScore = useMemo(() => {
    return wellnessActivities.reduce((sum, activity) => 
      sum + calculateActivityScore(activity), 0
    );
  }, [checkedItems]);

  const maxScore = useMemo(() => {
    return wellnessActivities.reduce((sum, activity) => 
      sum + calculateMaxActivityScore(activity), 0
    );
  }, []);

  const scorePercentage = Math.round((totalScore / maxScore) * 100);

  const isNewPersonalBest = scorePercentage > mockUserStats.personalBest;

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto pb-24 md:pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-2">
          The Lab
        </h1>
        <p className="text-lg text-muted-foreground">
          Log your daily wellness activities. Build habits, track progress, compete with yourself.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Wellness Activities */}
        <div className="lg:col-span-2 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 mb-2"
          >
            <Brain className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">Daily Wellness Activities</span>
            <span className="text-sm text-muted-foreground ml-auto">Log your progress each day</span>
          </motion.div>

          {wellnessActivities.map((activity, index) => {
            const activityScore = calculateActivityScore(activity);
            const maxActivityScore = calculateMaxActivityScore(activity);
            const isExpanded = expandedActivity === activity.id;
            const Icon = activity.icon;

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="glass-surface rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedActivity(isExpanded ? null : activity.id)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-muted/20 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-xl bg-${activity.color}/10 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${activity.color}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-medium text-foreground">{activity.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {activity.checklist.filter(item => checkedItems[item.id]).length} / {activity.checklist.length} completed
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-semibold text-${activity.color}`}>{activityScore}</span>
                    <span className="text-muted-foreground text-sm">/{maxActivityScore}</span>
                  </div>
                </button>

                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4"
                  >
                    <div className="space-y-3 pt-2 border-t border-muted">
                      {activity.checklist.map((item) => (
                        <label
                          key={item.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <Checkbox
                            checked={checkedItems[item.id] || false}
                            onCheckedChange={() => handleCheck(item.id)}
                          />
                          <span className={`flex-1 text-sm ${checkedItems[item.id] ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                            {item.label}
                          </span>
                          <span className={`text-xs font-medium ${checkedItems[item.id] ? 'text-primary' : 'text-muted-foreground'}`}>
                            +{item.points} pts
                          </span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Score & Gamification Sidebar */}
        <div className="space-y-6">
          {/* Daily Wellness Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-surface rounded-2xl p-6"
          >
            <div className="text-center">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Today's Wellness Score
              </p>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="8"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(scorePercentage / 100) * 352} 352`}
                    className="drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)] transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-display font-bold text-foreground">{totalScore}</span>
                  <span className="text-xs text-muted-foreground">/{maxScore}</span>
                </div>
              </div>

              {isNewPersonalBest && totalScore > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center justify-center gap-2 text-secondary mb-4"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">New Personal Best!</span>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Gamification Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-surface rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-secondary" />
              <span className="font-medium text-foreground">Your Progress</span>
            </div>

            <div className="space-y-4">
              {/* Personal Best */}
              <div className="p-3 rounded-xl bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Personal Best</span>
                  <span className="text-lg font-semibold text-primary">{mockUserStats.personalBest}%</span>
                </div>
                <Progress value={mockUserStats.personalBest} className="h-2" />
              </div>

              {/* Percentile Ranking */}
              <div className="p-3 rounded-xl bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Community Ranking</span>
                </div>
                <p className="text-lg font-semibold text-foreground">
                  Top <span className="text-secondary">{100 - mockUserStats.percentile}%</span> of leaders
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  You're outperforming {mockUserStats.percentile}% of H2H Inner Lab members
                </p>
              </div>

              {/* Streak */}
              <div className="p-3 rounded-xl bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-secondary" />
                    <span className="text-sm text-muted-foreground">Current Streak</span>
                  </div>
                  <span className="text-lg font-semibold text-secondary">{mockUserStats.streak} days</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Reminder to Log */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-surface rounded-2xl p-6 border-l-4 border-l-primary"
          >
            <h3 className="font-medium text-foreground mb-2">Daily Logging</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Consistent tracking builds awareness and drives improvement. Log your metrics every day to maintain your streak.
            </p>
            <Button className="w-full bg-primary hover:bg-primary/90 glow-turquoise">
              Save Today's Log
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
