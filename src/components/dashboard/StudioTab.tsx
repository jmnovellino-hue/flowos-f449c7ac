import { motion } from 'framer-motion';
import { Play, Pause, Headphones, Clock, Lock, Mic, Volume2, Moon, Brain, Heart } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface AudioCategory {
  id: string;
  label: string;
  description: string;
}

const audioCategories: AudioCategory[] = [
  { id: 'all', label: 'All', description: '' },
  { id: 'podcast', label: 'Podcast', description: 'Deep-dive episodes on leadership psychology, philosophy, and self-mastery.' },
  { id: 'prime', label: 'Peak Performance Primer', description: 'Short sessions to prime your mindset before critical moments—meetings, negotiations, or difficult conversations.' },
  { id: 'decompress', label: 'Decompression', description: 'Guided sessions to transition out of work mode and release the day\'s tension.' },
  { id: 'meditation', label: 'Meditation', description: 'Focused mindfulness practices to build presence, clarity, and emotional regulation.' },
  { id: 'sleep', label: 'Sleep Better', description: 'Wind-down audio to prepare your nervous system for deep, restorative sleep.' },
];

const audioContent = [
  {
    id: 1,
    title: 'Before the Board Meeting',
    category: 'prime',
    duration: '4:32',
    description: 'Neuro-prime your state for high-stakes boardroom presence.',
    locked: false,
    featured: true,
  },
  {
    id: 2,
    title: 'The Shadow Integration',
    category: 'podcast',
    duration: '28:45',
    description: 'Deep dive into Jungian shadow work for modern leaders.',
    locked: false,
    featured: false,
  },
  {
    id: 3,
    title: 'Work-to-Home Transition',
    category: 'decompress',
    duration: '8:15',
    description: 'Guided meditation to shift from executive mode to family mode.',
    locked: false,
    featured: false,
  },
  {
    id: 4,
    title: 'Before Firing Someone',
    category: 'prime',
    duration: '5:22',
    description: 'Mental preparation for the hardest conversations.',
    locked: true,
    featured: false,
  },
  {
    id: 5,
    title: 'Stoic Resilience Training',
    category: 'podcast',
    duration: '35:10',
    description: 'Ancient wisdom for modern leadership challenges.',
    locked: true,
    featured: false,
  },
  {
    id: 6,
    title: 'Salary Negotiation Prep',
    category: 'prime',
    duration: '6:45',
    description: 'Center yourself before crucial compensation discussions.',
    locked: false,
    featured: false,
  },
  {
    id: 7,
    title: 'Morning Clarity',
    category: 'meditation',
    duration: '12:00',
    description: 'Start your day with intention and focused awareness.',
    locked: false,
    featured: false,
  },
  {
    id: 8,
    title: 'Breath of Calm',
    category: 'meditation',
    duration: '7:30',
    description: 'Quick reset meditation for high-pressure moments.',
    locked: false,
    featured: false,
  },
  {
    id: 9,
    title: 'Body Scan for Leaders',
    category: 'meditation',
    duration: '15:00',
    description: 'Release tension and reconnect with physical awareness.',
    locked: true,
    featured: false,
  },
  {
    id: 10,
    title: 'Sleep Preparation Ritual',
    category: 'sleep',
    duration: '20:00',
    description: 'Progressive relaxation to prepare mind and body for deep rest.',
    locked: false,
    featured: false,
  },
  {
    id: 11,
    title: 'Letting Go of the Day',
    category: 'sleep',
    duration: '18:30',
    description: 'Guided imagery to process and release the day\'s events.',
    locked: false,
    featured: false,
  },
  {
    id: 12,
    title: 'Deep Sleep Soundscape',
    category: 'sleep',
    duration: '45:00',
    description: 'Ambient audio designed to enhance sleep quality and recovery.',
    locked: true,
    featured: false,
  },
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'podcast': return Mic;
    case 'meditation': return Brain;
    case 'sleep': return Moon;
    case 'decompress': return Heart;
    default: return Headphones;
  }
};

export const StudioTab = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [playing, setPlaying] = useState<number | null>(null);

  const filteredContent = activeCategory === 'all' 
    ? audioContent 
    : audioContent.filter(a => a.category === activeCategory);

  const activeCategoryData = audioCategories.find(c => c.id === activeCategory);

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
          Audio for the liminal spaces of your day.
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
            <h3 className="text-lg font-semibold text-foreground truncate">Before the Board Meeting</h3>
            <p className="text-sm text-muted-foreground">Peak Performance Primer • 4:32</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <div className="w-24 h-1 bg-muted rounded-full">
                <div className="w-3/4 h-full bg-primary rounded-full" />
              </div>
            </div>
            <Button
              size="icon"
              className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 glow-emerald"
              onClick={() => setPlaying(playing === 1 ? null : 1)}
            >
              {playing === 1 ? (
                <Pause className="w-5 h-5 text-primary-foreground" />
              ) : (
                <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
              )}
            </Button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-1 bg-muted rounded-full">
            <div className="w-1/3 h-full bg-gradient-to-r from-primary to-accent rounded-full" />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>1:28</span>
            <span>4:32</span>
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
          {audioCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Category Description */}
        {activeCategoryData?.description && (
          <motion.p
            key={activeCategory}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 mt-2"
          >
            {activeCategoryData.description}
          </motion.p>
        )}
      </motion.div>

      {/* Audio Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredContent.map((audio, index) => {
          const CategoryIcon = getCategoryIcon(audio.category);
          const categoryLabel = audioCategories.find(c => c.id === audio.category)?.label;

          return (
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
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">
                    {categoryLabel}
                  </span>
                  {audio.featured && (
                    <span className="px-2 py-0.5 rounded-full bg-secondary/20 text-secondary text-xs">
                      Featured
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
          );
        })}
      </div>
    </div>
  );
};
