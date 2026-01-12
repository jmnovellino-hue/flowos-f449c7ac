import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Star,
  Zap,
  Target,
  Users,
  Crown,
  Shield,
  Flame,
  Award,
  TrendingUp,
  ChevronRight,
  Share2,
  X,
  Sparkles,
  Swords,
  Heart,
  Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface EvolutionHubProps {
  isOpen: boolean;
  onClose: () => void;
  currentStats: {
    streak: number;
    personalBest: number;
    percentile: number;
  };
}

// RPG Classes based on archetypes
const EVOLUTION_CLASSES = [
  { id: 'warrior', name: 'Warrior', icon: Swords, description: 'Master of discipline and action' },
  { id: 'sage', name: 'Sage', icon: Brain, description: 'Seeker of wisdom and insight' },
  { id: 'guardian', name: 'Guardian', icon: Shield, description: 'Protector of balance and values' },
  { id: 'healer', name: 'Healer', icon: Heart, description: 'Cultivator of wellbeing and growth' },
];

const LEVELS = [
  { level: 1, title: 'Initiate', xpRequired: 0, color: 'muted' },
  { level: 2, title: 'Apprentice', xpRequired: 100, color: 'muted' },
  { level: 3, title: 'Adept', xpRequired: 300, color: 'primary' },
  { level: 4, title: 'Practitioner', xpRequired: 600, color: 'primary' },
  { level: 5, title: 'Expert', xpRequired: 1000, color: 'secondary' },
  { level: 6, title: 'Master', xpRequired: 1500, color: 'secondary' },
  { level: 7, title: 'Grandmaster', xpRequired: 2500, color: 'accent' },
  { level: 8, title: 'Luminary', xpRequired: 4000, color: 'accent' },
  { level: 9, title: 'Transcendent', xpRequired: 6000, color: 'secondary' },
  { level: 10, title: 'Awakened', xpRequired: 10000, color: 'secondary' },
];

const ACHIEVEMENTS = [
  { id: 'first_journal', name: 'First Steps', description: 'Complete your first journal entry', icon: BookOpen, xp: 50, unlocked: true },
  { id: 'week_streak', name: 'Consistent', description: 'Maintain a 7-day streak', icon: Flame, xp: 100, unlocked: true },
  { id: 'month_streak', name: 'Dedicated', description: 'Maintain a 30-day streak', icon: Crown, xp: 500, unlocked: false },
  { id: 'focus_master', name: 'Deep Focus', description: 'Complete 10 Quantum Bubble sessions', icon: Zap, xp: 200, unlocked: false },
  { id: 'experimenter', name: 'Experimenter', description: 'Try 20 micro-experiments', icon: Target, xp: 150, unlocked: true },
  { id: 'top_10', name: 'Elite', description: 'Reach top 10% of community', icon: Trophy, xp: 300, unlocked: false },
];

const QUESTS = [
  { id: 'daily_check', name: 'Daily Check-in', description: 'Log your mood and energy', xp: 10, progress: 1, total: 1, type: 'daily' },
  { id: 'journal_entry', name: 'Reflect & Write', description: 'Complete a journal entry', xp: 15, progress: 0, total: 1, type: 'daily' },
  { id: 'focus_session', name: 'Enter the Bubble', description: 'Complete a focus session', xp: 20, progress: 0, total: 1, type: 'daily' },
  { id: 'week_perfect', name: 'Perfect Week', description: 'Complete all daily tasks for 7 days', xp: 200, progress: 3, total: 7, type: 'weekly' },
  { id: 'experiment_chain', name: 'Experiment Chain', description: 'Complete 5 experiments this week', xp: 100, progress: 2, total: 5, type: 'weekly' },
];

// Mock leaderboard data
const LEADERBOARD = [
  { rank: 1, name: 'Alexandra M.', xp: 8420, level: 9, avatar: '👑' },
  { rank: 2, name: 'Marcus T.', xp: 7890, level: 8, avatar: '⚔️' },
  { rank: 3, name: 'Sarah K.', xp: 6540, level: 8, avatar: '🌟' },
  { rank: 4, name: 'David L.', xp: 5210, level: 7, avatar: '🔥' },
  { rank: 5, name: 'Elena R.', xp: 4890, level: 7, avatar: '💫' },
];

import { BookOpen } from 'lucide-react';

export const EvolutionHub = ({ isOpen, onClose, currentStats }: EvolutionHubProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'quests' | 'achievements' | 'leaderboard'>('overview');
  const [selectedClass, setSelectedClass] = useState('sage');

  // Calculate XP and level based on stats
  const calculateXP = () => {
    const streakXP = currentStats.streak * 10;
    const performanceXP = currentStats.personalBest * 5;
    return streakXP + performanceXP + 450; // Base XP
  };

  const totalXP = calculateXP();
  
  const getCurrentLevel = () => {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (totalXP >= LEVELS[i].xpRequired) {
        return LEVELS[i];
      }
    }
    return LEVELS[0];
  };

  const getNextLevel = () => {
    const currentIdx = LEVELS.findIndex(l => l.level === getCurrentLevel().level);
    return LEVELS[currentIdx + 1] || LEVELS[LEVELS.length - 1];
  };

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const progressToNext = ((totalXP - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired)) * 100;

  const handleShareBadge = () => {
    // Generate share content
    const shareText = `🏆 I've reached Level ${currentLevel.level} "${currentLevel.title}" in FlowOS! 

📊 Stats:
• ${currentStats.streak} day streak 🔥
• Top ${100 - currentStats.percentile}% of leaders
• ${totalXP} XP earned

Join me on the journey of conscious leadership! #FlowOS #H2HInnerLab #Leadership`;

    if (navigator.share) {
      navigator.share({
        title: 'My FlowOS Evolution',
        text: shareText,
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareText);
        toast.success('Badge copied to clipboard!');
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Badge copied to clipboard!');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Star },
    { id: 'quests', label: 'Quests', icon: Target },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'leaderboard', label: 'Leaderboard', icon: Users },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-background/95 backdrop-blur-xl overflow-auto"
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -100, 0],
                  x: [0, Math.random() * 50 - 25, 0],
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 5 + Math.random() * 5,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                }}
                className="absolute w-2 h-2 rounded-full bg-primary/30"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${50 + Math.random() * 50}%`,
                }}
              />
            ))}
          </div>

          <div className="max-w-4xl mx-auto p-6 relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center"
                >
                  <Trophy className="w-6 h-6 text-primary-foreground" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-display font-bold text-foreground">Evolution Hub</h1>
                  <p className="text-sm text-muted-foreground">Your journey of conscious leadership</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Level Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="glass-surface rounded-2xl p-6 mb-6"
            >
              <div className="flex items-center gap-6">
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className={`w-24 h-24 rounded-2xl bg-gradient-to-br from-${currentLevel.color} to-primary flex items-center justify-center`}
                  >
                    <span className="text-4xl font-display font-bold text-primary-foreground">
                      {currentLevel.level}
                    </span>
                  </motion.div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute -inset-2 rounded-2xl border-2 border-dashed border-primary/30"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-display font-semibold text-foreground">
                      {currentLevel.title}
                    </h2>
                    <Sparkles className="w-4 h-4 text-secondary" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {totalXP} / {nextLevel.xpRequired} XP to Level {nextLevel.level}
                  </p>
                  <div className="relative">
                    <Progress value={progressToNext} className="h-3" />
                    <motion.div
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />
                  </div>
                </div>
                <Button onClick={handleShareBadge} className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Share Badge
                </Button>
              </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid gap-4 md:grid-cols-2"
                >
                  {/* Stats Grid */}
                  <div className="glass-surface rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <span className="font-medium">Your Stats</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <Flame className="w-6 h-6 text-secondary mx-auto mb-1" />
                        <p className="text-2xl font-bold text-foreground">{currentStats.streak}</p>
                        <p className="text-xs text-muted-foreground">Day Streak</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <Trophy className="w-6 h-6 text-primary mx-auto mb-1" />
                        <p className="text-2xl font-bold text-foreground">{currentStats.personalBest}%</p>
                        <p className="text-xs text-muted-foreground">Best Score</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <Users className="w-6 h-6 text-accent mx-auto mb-1" />
                        <p className="text-2xl font-bold text-foreground">Top {100 - currentStats.percentile}%</p>
                        <p className="text-xs text-muted-foreground">Community</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <Zap className="w-6 h-6 text-secondary mx-auto mb-1" />
                        <p className="text-2xl font-bold text-foreground">{totalXP}</p>
                        <p className="text-xs text-muted-foreground">Total XP</p>
                      </div>
                    </div>
                  </div>

                  {/* Class Selection */}
                  <div className="glass-surface rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="w-5 h-5 text-secondary" />
                      <span className="font-medium">Your Class</span>
                    </div>
                    <div className="space-y-2">
                      {EVOLUTION_CLASSES.map((cls) => (
                        <button
                          key={cls.id}
                          onClick={() => setSelectedClass(cls.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                            selectedClass === cls.id
                              ? 'bg-primary/20 border border-primary/50'
                              : 'bg-muted/30 hover:bg-muted/50'
                          }`}
                        >
                          <cls.icon className={`w-5 h-5 ${selectedClass === cls.id ? 'text-primary' : 'text-muted-foreground'}`} />
                          <div className="text-left flex-1">
                            <p className="font-medium text-sm">{cls.name}</p>
                            <p className="text-xs text-muted-foreground">{cls.description}</p>
                          </div>
                          {selectedClass === cls.id && <Sparkles className="w-4 h-4 text-primary" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'quests' && (
                <motion.div
                  key="quests"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="glass-surface rounded-xl p-5">
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Daily Quests
                    </h3>
                    <div className="space-y-3">
                      {QUESTS.filter(q => q.type === 'daily').map((quest) => (
                        <div
                          key={quest.id}
                          className={`p-4 rounded-lg ${quest.progress >= quest.total ? 'bg-primary/10 border border-primary/30' : 'bg-muted/30'}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium text-sm">{quest.name}</p>
                              <p className="text-xs text-muted-foreground">{quest.description}</p>
                            </div>
                            <span className="text-sm font-semibold text-secondary">+{quest.xp} XP</span>
                          </div>
                          <Progress value={(quest.progress / quest.total) * 100} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-surface rounded-xl p-5">
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                      <Crown className="w-5 h-5 text-secondary" />
                      Weekly Challenges
                    </h3>
                    <div className="space-y-3">
                      {QUESTS.filter(q => q.type === 'weekly').map((quest) => (
                        <div key={quest.id} className="p-4 rounded-lg bg-muted/30">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium text-sm">{quest.name}</p>
                              <p className="text-xs text-muted-foreground">{quest.description}</p>
                            </div>
                            <span className="text-sm font-semibold text-secondary">+{quest.xp} XP</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={(quest.progress / quest.total) * 100} className="h-2 flex-1" />
                            <span className="text-xs text-muted-foreground">{quest.progress}/{quest.total}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'achievements' && (
                <motion.div
                  key="achievements"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  {ACHIEVEMENTS.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl ${
                        achievement.unlocked
                          ? 'glass-surface border border-primary/30'
                          : 'bg-muted/20 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          achievement.unlocked ? 'bg-primary/20' : 'bg-muted'
                        }`}>
                          <achievement.icon className={`w-6 h-6 ${achievement.unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{achievement.name}</p>
                            {achievement.unlocked && <Sparkles className="w-3 h-3 text-secondary" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{achievement.description}</p>
                          <p className="text-xs font-semibold text-secondary mt-1">+{achievement.xp} XP</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'leaderboard' && (
                <motion.div
                  key="leaderboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass-surface rounded-xl p-5"
                >
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-secondary" />
                    Top Leaders This Week
                  </h3>
                  <div className="space-y-2">
                    {LEADERBOARD.map((player, index) => (
                      <motion.div
                        key={player.rank}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center gap-4 p-3 rounded-lg ${
                          index === 0 ? 'bg-secondary/10 border border-secondary/30' :
                          index === 1 ? 'bg-muted/50' :
                          index === 2 ? 'bg-muted/30' : 'bg-muted/20'
                        }`}
                      >
                        <span className={`w-8 text-center font-bold ${
                          index === 0 ? 'text-secondary' : 'text-muted-foreground'
                        }`}>
                          #{player.rank}
                        </span>
                        <span className="text-2xl">{player.avatar}</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{player.name}</p>
                          <p className="text-xs text-muted-foreground">Level {player.level}</p>
                        </div>
                        <span className="text-sm font-semibold text-primary">{player.xp.toLocaleString()} XP</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-4">
                      <span className="w-8 text-center font-bold text-muted-foreground">#{100 - currentStats.percentile}</span>
                      <span className="text-2xl">🎯</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">You</p>
                        <p className="text-xs text-muted-foreground">Level {currentLevel.level}</p>
                      </div>
                      <span className="text-sm font-semibold text-primary">{totalXP.toLocaleString()} XP</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
