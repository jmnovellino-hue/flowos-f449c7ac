import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  TreeDeciduous,
  Waves,
  Music,
  Clock,
  Target,
  Maximize2,
  Minimize2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const AUDIO_CATEGORIES = [
  {
    id: 'nature',
    label: 'Nature Sounds',
    icon: TreeDeciduous,
    description: 'Forest rain, ocean waves, birds',
    tracks: [
      { id: 'rain', label: 'Forest Rain', url: 'https://cdn.pixabay.com/audio/2022/05/13/audio_6f264ca7a5.mp3' },
      { id: 'ocean', label: 'Ocean Waves', url: 'https://cdn.pixabay.com/audio/2022/02/23/audio_d1d93c64ed.mp3' },
      { id: 'birds', label: 'Morning Birds', url: 'https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1e6c4.mp3' },
    ],
  },
  {
    id: 'binaural',
    label: 'Binaural Beats',
    icon: Waves,
    description: 'Alpha, Theta, Focus frequencies',
    tracks: [
      { id: 'alpha', label: 'Alpha (10Hz) - Relaxation', url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_bc5f929e2d.mp3' },
      { id: 'theta', label: 'Theta (6Hz) - Meditation', url: 'https://cdn.pixabay.com/audio/2022/10/18/audio_69edfc1f39.mp3' },
      { id: 'focus', label: 'Beta (14Hz) - Focus', url: 'https://cdn.pixabay.com/audio/2022/08/31/audio_419263fc12.mp3' },
    ],
  },
  {
    id: 'lofi',
    label: 'Lo-Fi Music',
    icon: Music,
    description: 'Calm beats for deep work',
    tracks: [
      { id: 'chill', label: 'Chill Beats', url: 'https://cdn.pixabay.com/audio/2022/11/22/audio_07c9e8c2c5.mp3' },
      { id: 'study', label: 'Study Session', url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3' },
      { id: 'ambient', label: 'Ambient Flow', url: 'https://cdn.pixabay.com/audio/2023/07/30/audio_e49f64cf8c.mp3' },
    ],
  },
];

const DURATION_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 25, label: '25 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
  { value: 90, label: '90 min' },
];

interface QuantumBubbleProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuantumBubble = ({ isOpen, onClose }: QuantumBubbleProps) => {
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionRef = useRef<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('nature');
  const [selectedTrack, setSelectedTrack] = useState('rain');
  const [sessionDuration, setSessionDuration] = useState(25);
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      stopSession();
    }
    return () => {
      stopSession();
    };
  }, [isOpen]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const getCurrentTrack = () => {
    const category = AUDIO_CATEGORIES.find(c => c.id === selectedCategory);
    return category?.tracks.find(t => t.id === selectedTrack);
  };

  const startSession = async () => {
    const track = getCurrentTrack();
    if (!track) return;

    setIsLoadingAudio(true);

    // Create audio element
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    const audio = new Audio(track.url);
    audio.loop = true;
    audio.volume = isMuted ? 0 : volume / 100;
    audioRef.current = audio;

    audio.oncanplaythrough = async () => {
      setIsLoadingAudio(false);
      audio.play();
      setIsPlaying(true);
      setIsSessionActive(true);
      setTimeRemaining(sessionDuration * 60);

      // Start timer
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            completeSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Log session start
      if (user?.id) {
        const { data } = await supabase
          .from('focus_sessions')
          .insert({
            user_id: user.id,
            duration_minutes: sessionDuration,
            audio_type: `${selectedCategory}/${selectedTrack}`,
          })
          .select()
          .single();

        if (data) {
          sessionRef.current = data.id;
        }
      }

      toast.success('🫧 Quantum Bubble activated! Focus mode engaged.');
    };

    audio.onerror = () => {
      setIsLoadingAudio(false);
      toast.error('Failed to load audio. Please try another track.');
    };

    audio.load();
  };

  const stopSession = async () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsPlaying(false);
    setIsSessionActive(false);
    setTimeRemaining(sessionDuration * 60);
  };

  const completeSession = async () => {
    stopSession();

    // Update session as completed
    if (sessionRef.current && user?.id) {
      await supabase
        .from('focus_sessions')
        .update({
          ended_at: new Date().toISOString(),
          completed: true,
        })
        .eq('id', sessionRef.current);
    }

    toast.success('🎉 Focus session complete! Great work!');
    sessionRef.current = null;
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((sessionDuration * 60 - timeRemaining) / (sessionDuration * 60)) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-[100] ${isFullscreen ? 'bg-background' : 'bg-background/95 backdrop-blur-xl'}`}
        >
          {/* Animated background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-primary/30 via-primary/10 to-transparent"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.05, 0.15, 0.05],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-secondary/20 via-secondary/5 to-transparent"
            />
          </div>

          {/* Header */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-display font-semibold text-foreground">Quantum Bubble</h2>
                <p className="text-sm text-muted-foreground">Deep focus mode activated</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-muted-foreground hover:text-foreground"
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Main content */}
          <div className="h-full flex flex-col items-center justify-center px-4 pt-20 pb-8">
            {/* Timer display */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="relative mb-8"
            >
              <svg className="w-64 h-64 -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="110"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="128"
                  cy="128"
                  r="110"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(progress / 100) * 691} 691`}
                  className="drop-shadow-[0_0_15px_hsl(var(--primary)/0.5)]"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-display font-bold text-foreground">
                  {formatTime(timeRemaining)}
                </span>
                <span className="text-sm text-muted-foreground mt-1">
                  {isSessionActive ? 'remaining' : 'session'}
                </span>
              </div>
            </motion.div>

            {/* Session controls */}
            {!isSessionActive ? (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-6 w-full max-w-md"
              >
                {/* Duration selector */}
                <div className="glass-surface rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Session Duration</span>
                  </div>
                  <div className="flex gap-2">
                    {DURATION_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSessionDuration(opt.value);
                          setTimeRemaining(opt.value * 60);
                        }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                          sessionDuration === opt.value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Audio categories */}
                <div className="glass-surface rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Focus Audio</span>
                  </div>
                  <div className="grid gap-2 mb-4">
                    {AUDIO_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setSelectedTrack(cat.tracks[0].id);
                        }}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                          selectedCategory === cat.id
                            ? 'bg-primary/20 border border-primary/50'
                            : 'bg-muted/50 hover:bg-muted'
                        }`}
                      >
                        <cat.icon className={`w-5 h-5 ${selectedCategory === cat.id ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div className="text-left flex-1">
                          <p className={`text-sm font-medium ${selectedCategory === cat.id ? 'text-foreground' : 'text-foreground'}`}>
                            {cat.label}
                          </p>
                          <p className="text-xs text-muted-foreground">{cat.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Track selector */}
                  <div className="flex gap-2">
                    {AUDIO_CATEGORIES.find(c => c.id === selectedCategory)?.tracks.map((track) => (
                      <button
                        key={track.id}
                        onClick={() => setSelectedTrack(track.id)}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                          selectedTrack === track.id
                            ? 'bg-secondary text-secondary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {track.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Start button */}
                <Button
                  size="lg"
                  className="w-full h-14 text-lg gap-3 glow-turquoise"
                  onClick={startSession}
                  disabled={isLoadingAudio}
                >
                  {isLoadingAudio ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Target className="w-5 h-5" />
                      Enter the Bubble
                    </>
                  )}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="space-y-6 w-full max-w-md"
              >
                {/* Now playing */}
                <div className="glass-surface rounded-2xl p-4 text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Now Playing</p>
                  <p className="text-lg font-medium text-foreground">
                    {getCurrentTrack()?.label}
                  </p>
                </div>

                {/* Playback controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-12 h-12"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>

                  <Button
                    size="icon"
                    onClick={togglePlayPause}
                    className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90"
                  >
                    {isPlaying ? (
                      <Pause className="w-7 h-7" />
                    ) : (
                      <Play className="w-7 h-7 ml-1" />
                    )}
                  </Button>

                  <div className="w-12 h-12" /> {/* Spacer for symmetry */}
                </div>

                {/* Volume slider */}
                <div className="flex items-center gap-4 px-4">
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                  <Slider
                    value={[volume]}
                    onValueChange={([v]) => setVolume(v)}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                </div>

                {/* End session */}
                <Button
                  variant="outline"
                  className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                  onClick={stopSession}
                >
                  <X className="w-4 h-4 mr-2" />
                  Exit Bubble
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
