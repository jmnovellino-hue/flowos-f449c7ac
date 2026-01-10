import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Headphones, Clock, Lock, Brain, Moon, Zap, Volume2, Sparkles, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MeditationBuilder } from '@/components/studio/MeditationBuilder';
import { PerformanceBuilder } from '@/components/studio/PerformanceBuilder';
import { ScriptViewer } from '@/components/studio/ScriptViewer';

interface AudioCategory {
  id: string;
  label: string;
  description: string;
  icon: typeof Brain;
  hasAiBuilder: boolean;
}

const audioCategories: AudioCategory[] = [
  { 
    id: 'meditation', 
    label: 'Meditation', 
    description: 'Craft a personalized guided meditation tailored to your intentions—choose breathing, grounding, affirmations, manifestation, or gratitude to build your practice.',
    icon: Brain,
    hasAiBuilder: true,
  },
  { 
    id: 'sleep', 
    label: 'Sleep Better', 
    description: 'Wind down with frequency-tuned audio designed to calm your nervous system and prepare you for deep, restorative rest.',
    icon: Moon,
    hasAiBuilder: false,
  },
  { 
    id: 'performance', 
    label: 'Peak Performance Primer', 
    description: 'Get mentally primed for high-stakes moments—receive wisdom, reframes, and grounding techniques tailored to the challenge you\'re about to face.',
    icon: Zap,
    hasAiBuilder: true,
  },
];

// Sleep frequency options
const sleepContent = [
  {
    id: 'sleep-delta',
    title: 'Delta Waves',
    frequency: '0.5-4Hz',
    duration: '60:00',
    description: 'Deep sleep frequencies for maximum restoration and physical recovery.',
    locked: false,
  },
  {
    id: 'sleep-theta',
    title: 'Theta Relaxation',
    frequency: '4-8Hz',
    duration: '45:00',
    description: 'Light sleep and deep relaxation frequencies for drifting off peacefully.',
    locked: false,
  },
  {
    id: 'sleep-schumann',
    title: 'Schumann Resonance',
    frequency: '7.83Hz',
    duration: '60:00',
    description: 'Earth\'s natural frequency for grounding and harmonizing your sleep cycle.',
    locked: false,
  },
  {
    id: 'sleep-432',
    title: 'Harmonic Sleep',
    frequency: '432Hz',
    duration: '45:00',
    description: 'Natural tuning frequency for calming the mind and reducing anxiety before sleep.',
    locked: true,
  },
  {
    id: 'sleep-528',
    title: 'Healing Sleep',
    frequency: '528Hz',
    duration: '60:00',
    description: 'The "love frequency" associated with DNA repair and deep cellular healing during rest.',
    locked: true,
  },
];

// Pre-made meditation content
const meditationContent = [
  {
    id: 'med-morning',
    title: 'Morning Clarity',
    duration: '12:00',
    description: 'Start your day with intention and focused awareness.',
    locked: false,
  },
  {
    id: 'med-breath',
    title: 'Breath of Calm',
    duration: '7:30',
    description: 'Quick reset meditation for high-pressure moments.',
    locked: false,
  },
  {
    id: 'med-body',
    title: 'Body Scan for Leaders',
    duration: '15:00',
    description: 'Release tension and reconnect with physical awareness.',
    locked: true,
  },
];

// Pre-made performance content
const performanceContent = [
  {
    id: 'perf-board',
    title: 'Before the Board Meeting',
    duration: '4:32',
    description: 'Neuro-prime your state for high-stakes boardroom presence.',
    locked: false,
  },
  {
    id: 'perf-convo',
    title: 'Difficult Conversations',
    duration: '5:22',
    description: 'Mental preparation for the hardest conversations.',
    locked: false,
  },
  {
    id: 'perf-negotiate',
    title: 'Negotiation Mindset',
    duration: '6:45',
    description: 'Center yourself before crucial discussions.',
    locked: true,
  },
];

export const StudioTab = () => {
  const [activeCategory, setActiveCategory] = useState<string>('meditation');
  const [playing, setPlaying] = useState<string | null>(null);
  const [showMeditationBuilder, setShowMeditationBuilder] = useState(false);
  const [showPerformanceBuilder, setShowPerformanceBuilder] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<{ script: string; title: string } | null>(null);

  const activeCategoryData = audioCategories.find(c => c.id === activeCategory);
  const CategoryIcon = activeCategoryData?.icon || Headphones;

  const getContentForCategory = () => {
    switch (activeCategory) {
      case 'meditation': return meditationContent;
      case 'sleep': return sleepContent;
      case 'performance': return performanceContent;
      default: return [];
    }
  };

  const handleMeditationComplete = (script: string) => {
    setShowMeditationBuilder(false);
    setGeneratedScript({ script, title: 'Custom Meditation' });
  };

  const handlePerformanceComplete = (script: string, situation: string) => {
    setShowPerformanceBuilder(false);
    setGeneratedScript({ script, title: `Primer: ${situation}` });
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
          The Studio
        </h1>
        <p className="text-lg text-muted-foreground">
          AI-powered audio for the liminal spaces of your day.
        </p>
      </motion.div>

      {/* Now Playing Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-surface rounded-2xl p-6 mb-8"
      >
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 glow-emerald">
            <Headphones className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-primary font-medium uppercase tracking-wider mb-1">Now Playing</p>
            <h3 className="text-lg font-semibold text-foreground truncate">Select an audio to play</h3>
            <p className="text-sm text-muted-foreground">Choose from the categories below</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <div className="w-24 h-1 bg-muted rounded-full">
                <div className="w-0 h-full bg-primary rounded-full" />
              </div>
            </div>
            <Button
              size="icon"
              className="w-12 h-12 rounded-full bg-muted hover:bg-muted/80"
              disabled
            >
              <Play className="w-5 h-5 text-muted-foreground ml-0.5" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-8"
      >
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none">
          {audioCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeCategory === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Category Description */}
        {activeCategoryData?.description && (
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-muted/30 rounded-lg p-4 mt-2"
          >
            <p className="text-sm text-muted-foreground mb-3">
              {activeCategoryData.description}
            </p>
            {activeCategoryData.hasAiBuilder && (
              <Button
                onClick={() => {
                  if (activeCategory === 'meditation') setShowMeditationBuilder(true);
                  if (activeCategory === 'performance') setShowPerformanceBuilder(true);
                }}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Create Custom {activeCategory === 'meditation' ? 'Meditation' : 'Primer'}
              </Button>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Audio Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <CategoryIcon className="w-4 h-4" />
          {activeCategory === 'sleep' ? 'Frequency Library' : 'Ready-Made Sessions'}
        </h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          {getContentForCategory().map((audio, index) => (
            <motion.div
              key={audio.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className={`glass-surface rounded-xl p-5 flex items-start gap-4 group hover:border-primary/30 transition-all ${
                audio.locked ? 'opacity-70' : ''
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                audio.locked 
                  ? 'bg-muted' 
                  : 'bg-gradient-to-br from-primary/20 to-accent/10 group-hover:from-primary/30 group-hover:to-accent/20'
              }`}>
                {audio.locked ? (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <CategoryIcon className="w-5 h-5 text-primary" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {'frequency' in audio && typeof audio.frequency === 'string' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                      {audio.frequency}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1 truncate group-hover:text-primary transition-colors">
                  {audio.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {audio.description}
                </p>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs">{audio.duration}</span>
                </div>
                {!audio.locked && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-10 h-10 rounded-full hover:bg-primary/10"
                    onClick={() => setPlaying(playing === audio.id ? null : audio.id)}
                  >
                    {playing === audio.id ? (
                      <Pause className="w-4 h-4 text-primary" />
                    ) : (
                      <Play className="w-4 h-4 text-primary ml-0.5" />
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showMeditationBuilder && (
        <MeditationBuilder
          onComplete={handleMeditationComplete}
          onCancel={() => setShowMeditationBuilder(false)}
        />
      )}
      {showPerformanceBuilder && (
        <PerformanceBuilder
          onComplete={handlePerformanceComplete}
          onCancel={() => setShowPerformanceBuilder(false)}
        />
      )}
      {generatedScript && (
        <ScriptViewer
          script={generatedScript.script}
          title={generatedScript.title}
          onClose={() => setGeneratedScript(null)}
        />
      )}
    </div>
  );
};
