import { motion } from 'framer-motion';
import { Play, Pause, Headphones, Clock, Lock, Mic, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const audioCategories = [
  { id: 'all', label: 'All' },
  { id: 'podcast', label: 'Podcast' },
  { id: 'prime', label: 'High-Stakes Prep' },
  { id: 'decompress', label: 'Decompression' },
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
];

export const StudioTab = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [playing, setPlaying] = useState<number | null>(null);

  const filteredContent = activeCategory === 'all' 
    ? audioContent 
    : audioContent.filter(a => a.category === activeCategory);

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
            <p className="text-sm text-muted-foreground">High-Stakes Prep • 4:32</p>
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
        className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none"
      >
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
      </motion.div>

      {/* Audio Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredContent.map((audio, index) => (
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
              ) : audio.category === 'podcast' ? (
                <Mic className="w-5 h-5 text-primary" />
              ) : (
                <Headphones className="w-5 h-5 text-primary" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-primary uppercase tracking-wider">
                  {audioCategories.find(c => c.id === audio.category)?.label}
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
        ))}
      </div>
    </div>
  );
};
