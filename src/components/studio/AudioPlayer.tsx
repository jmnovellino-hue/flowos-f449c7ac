import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Loader2, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  onClose?: () => void;
  autoPlay?: boolean;
  backgroundFrequency?: 'nature' | 'elevate' | 'enlightenment';
}

// Nature background sounds - calming and relaxing
const NATURE_SOUNDS: Record<string, string[]> = {
  nature: [
    'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3', // Forest birds
    'https://cdn.pixabay.com/download/audio/2021/08/09/audio_dce1dee36d.mp3', // Rain sounds
    'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3', // Ocean waves
    'https://cdn.pixabay.com/download/audio/2021/10/19/audio_75cc4dc63d.mp3', // Gentle stream
  ],
  elevate: [
    'https://cdn.pixabay.com/download/audio/2022/01/20/audio_8b2af3cc03.mp3', // Ambient meditation
    'https://cdn.pixabay.com/download/audio/2023/04/19/audio_6940809be2.mp3', // Soft ambient
    'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3', // Peaceful ambient
  ],
  enlightenment: [
    'https://cdn.pixabay.com/download/audio/2021/04/06/audio_f927d5c6ee.mp3', // Higher frequency
    'https://cdn.pixabay.com/download/audio/2022/03/15/audio_8cb749d484.mp3', // 432Hz ambient
    'https://cdn.pixabay.com/download/audio/2023/03/20/audio_10f76ae9b7.mp3', // Cosmic ambient
  ],
};

// Get a random sound from the category
const getRandomSound = (category: string): string => {
  const sounds = NATURE_SOUNDS[category] || NATURE_SOUNDS.nature;
  return sounds[Math.floor(Math.random() * sounds.length)];
};

export const AudioPlayer = ({ audioUrl, title, onClose, autoPlay = false, backgroundFrequency }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const bgAudioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize background audio with random nature sound
  useEffect(() => {
    if (backgroundFrequency && NATURE_SOUNDS[backgroundFrequency]) {
      const soundUrl = getRandomSound(backgroundFrequency);
      const bgAudio = new Audio(soundUrl);
      bgAudio.loop = true;
      bgAudio.volume = 0.25; // Lower volume for background - more subtle
      bgAudioRef.current = bgAudio;

      return () => {
        bgAudio.pause();
        bgAudio.src = '';
      };
    }
  }, [backgroundFrequency]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      if (autoPlay) {
        audio.play();
        setIsPlaying(true);
        // Start background audio when main audio plays
        if (bgAudioRef.current) {
          bgAudioRef.current.play().catch(() => {});
        }
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      // Stop background audio when main audio ends
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
        bgAudioRef.current.currentTime = 0;
      }
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [autoPlay]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      if (bgAudioRef.current) bgAudioRef.current.pause();
    } else {
      audio.play();
      if (bgAudioRef.current) bgAudioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newVolume = value[0];
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    // Background audio stays at 30% of main volume
    if (bgAudioRef.current) {
      bgAudioRef.current.volume = newVolume * 0.3;
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      audio.volume = volume || 0.8;
      if (bgAudioRef.current) bgAudioRef.current.volume = (volume || 0.8) * 0.3;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      if (bgAudioRef.current) bgAudioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const restart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-surface rounded-2xl p-6"
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-primary font-medium uppercase tracking-wider mb-1">Now Playing</p>
          <h3 className="text-lg font-semibold text-foreground truncate">{title}</h3>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          disabled={isLoading}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={restart}
            disabled={isLoading}
            className="w-10 h-10"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <Button
          size="icon"
          onClick={togglePlay}
          disabled={isLoading}
          className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 glow-emerald"
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 text-primary-foreground animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-6 h-6 text-primary-foreground" />
          ) : (
            <Play className="w-6 h-6 text-primary-foreground ml-1" />
          )}
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="w-10 h-10"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-20"
          />
        </div>
      </div>
    </motion.div>
  );
};
