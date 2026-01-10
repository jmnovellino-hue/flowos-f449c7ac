import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Brain, Zap, AlertCircle, ChevronDown, ChevronUp, TrendingUp, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface JournalEntry {
  date: string;
  mood: number;
  energy: number;
  labScore: number;
  experimentsCompleted: number;
}

interface JournalingSectionProps {
  userId?: string;
}

const moodOptions = [
  { value: 1, label: '😔', description: 'Struggling' },
  { value: 2, label: '😕', description: 'Low' },
  { value: 3, label: '😐', description: 'Neutral' },
  { value: 4, label: '🙂', description: 'Good' },
  { value: 5, label: '😊', description: 'Great' },
];

const energyLevels = [
  { value: 1, label: 'Depleted', color: 'destructive' },
  { value: 2, label: 'Low', color: 'destructive' },
  { value: 3, label: 'Moderate', color: 'secondary' },
  { value: 4, label: 'High', color: 'primary' },
  { value: 5, label: 'Peak', color: 'primary' },
];

export const JournalingSection = ({ userId }: JournalingSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<number | null>(null);
  const [thoughts, setThoughts] = useState('');
  const [concerns, setConcerns] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [weekData, setWeekData] = useState<JournalEntry[]>([]);
  const [todayEntrySaved, setTodayEntrySaved] = useState(false);

  useEffect(() => {
    if (userId) {
      loadWeekData();
    }
  }, [userId]);

  const loadWeekData = async () => {
    if (!userId) return;

    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6);

    const { data: entries } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('entry_date', weekAgo.toISOString().split('T')[0])
      .order('entry_date', { ascending: true });

    // Build week data from entries
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekEntries: JournalEntry[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = days[date.getDay()];
      
      const entry = entries?.find(e => e.entry_date === dateStr);
      
      if (entry) {
        weekEntries.push({
          date: dayName,
          mood: entry.mood,
          energy: entry.energy,
          labScore: Math.round(((entry.mood + entry.energy) / 10) * 100),
          experimentsCompleted: 0,
        });
        
        // Check if today's entry exists
        if (i === 0) {
          setTodayEntrySaved(true);
          setSelectedMood(entry.mood);
          setSelectedEnergy(entry.energy);
          setThoughts(entry.thoughts || '');
          setConcerns(entry.concerns || '');
        }
      } else {
        weekEntries.push({
          date: dayName,
          mood: 0,
          energy: 0,
          labScore: 0,
          experimentsCompleted: 0,
        });
      }
    }

    setWeekData(weekEntries);
  };

  const saveEntry = async () => {
    if (!userId || !selectedMood || !selectedEnergy) {
      toast.error('Please select mood and energy level');
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
          mood: selectedMood,
          energy: selectedEnergy,
          thoughts: thoughts || null,
          concerns: concerns || null,
        }, {
          onConflict: 'user_id,entry_date'
        });

      if (error) throw error;

      toast.success('Journal entry saved!');
      setTodayEntrySaved(true);
      loadWeekData();
    } catch (error: any) {
      console.error('Error saving journal entry:', error);
      toast.error(error.message || 'Failed to save entry');
    } finally {
      setIsSaving(false);
    }
  };

  const displayWeekData = weekData.length > 0 ? weekData : [
    { date: 'Mon', mood: 0, energy: 0, labScore: 0, experimentsCompleted: 0 },
    { date: 'Tue', mood: 0, energy: 0, labScore: 0, experimentsCompleted: 0 },
    { date: 'Wed', mood: 0, energy: 0, labScore: 0, experimentsCompleted: 0 },
    { date: 'Thu', mood: 0, energy: 0, labScore: 0, experimentsCompleted: 0 },
    { date: 'Fri', mood: 0, energy: 0, labScore: 0, experimentsCompleted: 0 },
    { date: 'Sat', mood: 0, energy: 0, labScore: 0, experimentsCompleted: 0 },
    { date: 'Sun', mood: 0, energy: 0, labScore: 0, experimentsCompleted: 0 },
  ];

  const calculateOverallScore = (entry: JournalEntry) => {
    if (entry.mood === 0) return 0;
    const moodWeight = 0.3;
    const energyWeight = 0.2;
    const labWeight = 0.35;
    const experimentsWeight = 0.15;
    
    return Math.round(
      (entry.mood / 5) * 100 * moodWeight +
      (entry.energy / 5) * 100 * energyWeight +
      entry.labScore * labWeight +
      Math.min(entry.experimentsCompleted / 3, 1) * 100 * experimentsWeight
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-primary';
    if (score >= 60) return 'text-secondary';
    if (score >= 40) return 'text-amber-500';
    return 'text-destructive';
  };

  const filledDays = displayWeekData.filter(d => d.mood > 0);
  const weekAverage = filledDays.length > 0 
    ? Math.round(filledDays.reduce((sum, d) => sum + calculateOverallScore(d), 0) / filledDays.length)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-surface rounded-2xl overflow-hidden"
    >
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-foreground">Daily Journal</h3>
            <p className="text-sm text-muted-foreground">Unload your mind, track your state</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground">7-Day Avg</p>
            <p className={`text-lg font-semibold ${getScoreColor(weekAverage)}`}>{weekAverage}</p>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-6 pb-6 space-y-6"
        >
          {/* Why Journaling Matters */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">Why write it down?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Research shows that externalizing thoughts reduces cognitive load by 23% and breaks the "mental loop" of rumination. 
                  Writing activates the prefrontal cortex, transforming abstract worries into manageable, concrete problems.
                </p>
              </div>
            </div>
          </div>

          {/* Mood Selection */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              How are you feeling right now?
            </label>
            <div className="flex gap-2 justify-between">
              {moodOptions.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`flex-1 p-3 rounded-xl text-center transition-all ${
                    selectedMood === mood.value
                      ? 'bg-primary/20 border-2 border-primary'
                      : 'bg-muted/50 border-2 border-transparent hover:bg-muted'
                  }`}
                >
                  <span className="text-2xl">{mood.label}</span>
                  <p className="text-xs text-muted-foreground mt-1">{mood.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Energy Level */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block flex items-center gap-2">
              <Zap className="w-4 h-4 text-secondary" />
              Energy Level
            </label>
            <div className="flex gap-2">
              {energyLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setSelectedEnergy(level.value)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    selectedEnergy === level.value
                      ? `bg-${level.color}/20 text-${level.color} border-2 border-${level.color}`
                      : 'bg-muted/50 text-muted-foreground border-2 border-transparent hover:bg-muted'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Thoughts */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              What's on your mind?
            </label>
            <Textarea
              value={thoughts}
              onChange={(e) => setThoughts(e.target.value)}
              placeholder="Stream of consciousness... no filter needed"
              className="min-h-[80px] bg-muted/30 border-muted resize-none"
            />
          </div>

          {/* Concerns */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-secondary" />
              Any concerns or worries?
            </label>
            <Textarea
              value={concerns}
              onChange={(e) => setConcerns(e.target.value)}
              placeholder="Get it out of your head and onto the page..."
              className="min-h-[60px] bg-muted/30 border-muted resize-none"
            />
          </div>

          {/* 7-Day Overview Graph */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">7-Day State Overview</span>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {displayWeekData.map((day, index) => {
                const score = calculateOverallScore(day);
                const isToday = index === displayWeekData.length - 1;
                return (
                  <div key={day.date} className="text-center">
                    <span className={`text-xs ${isToday ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {day.date}
                    </span>
                    <div className="mt-2 h-24 relative flex flex-col justify-end">
                      {score > 0 ? (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${score}%` }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          className={`rounded-t-md ${
                            score >= 80 ? 'bg-primary' :
                            score >= 60 ? 'bg-secondary' :
                            score >= 40 ? 'bg-amber-500' : 'bg-destructive'
                          }`}
                          style={{ minHeight: '8px' }}
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <span className="text-xs text-muted-foreground rotate-90">—</span>
                        </div>
                      )}
                    </div>
                    <span className={`text-xs font-medium mt-1 block ${getScoreColor(score)}`}>
                      {score > 0 ? score : '—'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>Great (80+)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-secondary" />
                <span>Good (60-79)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Fair (40-59)</span>
              </div>
            </div>
          </div>

          <Button 
            className="w-full bg-primary hover:bg-primary/90"
            disabled={!selectedMood || !selectedEnergy || isSaving}
            onClick={saveEntry}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : todayEntrySaved ? (
              'Update Today\'s Entry'
            ) : (
              'Save Today\'s Entry'
            )}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};
