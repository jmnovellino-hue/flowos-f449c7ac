import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, TrendingUp, Quote, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { JournalingSection } from './JournalingSection';
import { MicroExperimentsSection } from './MicroExperimentsSection';
import { CommitmentTracker } from './CommitmentTracker';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  userId?: string;
  onNavigateToProfile?: () => void;
}

// Rotating daily wisdom quotes
const wisdomQuotes = [
  { quote: "Until you make the unconscious conscious, it will direct your life and you will call it fate.", author: "Carl Jung", category: "Shadow Work" },
  { quote: "Between stimulus and response there is a space. In that space is our power to choose our response.", author: "Viktor Frankl", category: "Choice" },
  { quote: "The obstacle is the way.", author: "Marcus Aurelius", category: "Stoicism" },
  { quote: "What stands in the way becomes the way.", author: "Ryan Holiday", category: "Adversity" },
  { quote: "The quality of your life is the quality of your relationships.", author: "Esther Perel", category: "Connection" },
  { quote: "Vulnerability is the birthplace of innovation, creativity, and change.", author: "Brené Brown", category: "Courage" },
  { quote: "People don't buy what you do; they buy why you do it.", author: "Simon Sinek", category: "Purpose" },
  { quote: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear", category: "Habits" },
  { quote: "The way you do anything is the way you do everything.", author: "Zen Proverb", category: "Mindfulness" },
  { quote: "Leadership is not about being in charge. It's about taking care of those in your charge.", author: "Simon Sinek", category: "Leadership" },
  { quote: "The cave you fear to enter holds the treasure you seek.", author: "Joseph Campbell", category: "Hero's Journey" },
  { quote: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche", category: "Meaning" },
  { quote: "The privilege of a lifetime is to become who you truly are.", author: "Carl Jung", category: "Individuation" },
  { quote: "It is not the strongest of the species that survives, but the most adaptable.", author: "Charles Darwin", category: "Adaptation" },
];

// Get a quote based on the day of year for consistent daily rotation
const getDailyWisdom = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return wisdomQuotes[dayOfYear % wisdomQuotes.length];
};

const dailyWisdom = getDailyWisdom();

export const HomeTab = ({ userProfile, userId, onNavigateToProfile }: HomeTabProps) => {
  const [sleepQuality, setSleepQuality] = useState(7);
  const [energyLevel, setEnergyLevel] = useState(8);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSavedToday, setHasSavedToday] = useState(false);

  useEffect(() => {
    if (userId) {
      checkTodayEntry();
    }
  }, [userId]);

  const checkTodayEntry = async () => {
    if (!userId) return;
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('journal_entries')
      .select('mood, energy')
      .eq('user_id', userId)
      .eq('entry_date', today)
      .maybeSingle();
    
    if (data) {
      setHasSavedToday(true);
      setSleepQuality(data.mood);
      setEnergyLevel(data.energy);
    }
  };

  const handleLogToday = async () => {
    if (!userId) {
      toast.error('Please sign in to log your daily stats');
      return;
    }

    setIsSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('journal_entries')
        .upsert({
          user_id: userId,
          entry_date: today,
          mood: sleepQuality,
          energy: energyLevel,
        }, {
          onConflict: 'user_id,entry_date'
        });

      if (error) throw error;

      toast.success('Daily bio check-in saved!');
      setHasSavedToday(true);
    } catch (error: any) {
      console.error('Error saving bio check-in:', error);
      toast.error(error.message || 'Failed to save check-in');
    } finally {
      setIsSaving(false);
    }
  };

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
          {greeting.text}, <span className="text-gradient-primary">{userProfile.name || 'Leader'}</span>
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
            className="glass-surface rounded-2xl p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Quote className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium text-primary uppercase tracking-wider">
                  Daily Wisdom
                </span>
                <span className="ml-auto text-xs text-muted-foreground">{dailyWisdom.category}</span>
              </div>
              <blockquote className="text-lg md:text-xl font-display text-foreground leading-relaxed mb-3">
                "{dailyWisdom.quote}"
              </blockquote>
              <cite className="text-muted-foreground not-italic text-sm">
                — {dailyWisdom.author}
              </cite>
            </div>
          </motion.div>

          {/* Daily Journal - Core habit, positioned prominently */}
          <JournalingSection userId={userId} />

          {/* Micro-Experiments */}
          <MicroExperimentsSection />

          {/* Commitment Tracker */}
          <CommitmentTracker expanded={false} />
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
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={onNavigateToProfile}
              >
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground">Quick Bio Check-in</h3>
              {hasSavedToday && (
                <span className="text-xs text-primary flex items-center gap-1">
                  <Check className="w-3 h-3" /> Logged
                </span>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Sleep Quality</span>
                  <span className="text-foreground font-medium">{sleepQuality}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Energy Level</span>
                  <span className="text-foreground font-medium">{energyLevel}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                  className="w-full accent-secondary"
                />
              </div>
            </div>
            <Button 
              className="w-full mt-4 bg-primary hover:bg-primary/90"
              onClick={handleLogToday}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : hasSavedToday ? (
                'Update Log'
              ) : (
                'Log Today'
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};