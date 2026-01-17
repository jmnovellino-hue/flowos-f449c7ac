import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Volume2, Copy, Check, Save, Play, Loader2, Heart, HeartOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AudioPlayer } from './AudioPlayer';

interface ScriptViewerProps {
  script: string;
  title: string;
  category: 'meditation' | 'performance';
  config?: Record<string, unknown>;
  backgroundFrequency?: 'nature' | 'elevate' | 'enlightenment';
  onClose: () => void;
  onSave?: (title: string, script: string, category: 'meditation' | 'performance', config?: Record<string, unknown>) => Promise<{ id: string } | null>;
  savedScriptId?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  existingAudioUrl?: string;
}

// Helper to extract storage path from a Supabase storage URL
const extractStoragePath = (url: string): string | null => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (url.includes(supabaseUrl) && url.includes('/storage/v1/object/public/audio-files/')) {
      const path = url.split('/storage/v1/object/public/audio-files/')[1];
      return path ? decodeURIComponent(path) : null;
    }
    return null;
  } catch {
    return null;
  }
};

export const ScriptViewer = ({ 
  script, 
  title, 
  category,
  config,
  backgroundFrequency,
  onClose, 
  onSave,
  savedScriptId,
  isFavorite,
  onToggleFavorite,
  existingAudioUrl,
}: ScriptViewerProps) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [localScriptId, setLocalScriptId] = useState<string | null>(savedScriptId || null);

  // Load existing audio from private storage bucket
  useEffect(() => {
    const loadExistingAudio = async () => {
      if (!existingAudioUrl) return;
      
      const storagePath = extractStoragePath(existingAudioUrl);
      
      if (storagePath) {
        // It's a Supabase storage URL - download using authenticated client
        setIsLoadingAudio(true);
        try {
          const { data, error } = await supabase.storage
            .from('audio-files')
            .download(storagePath);
          
          if (error) throw error;
          
          const blobUrl = URL.createObjectURL(data);
          setAudioUrl(blobUrl);
        } catch (error) {
          console.error('Error loading audio from storage:', error);
          toast.error('Failed to load saved audio');
        } finally {
          setIsLoadingAudio(false);
        }
      } else {
        // It's a direct URL (blob URL or external) - use as-is
        setAudioUrl(existingAudioUrl);
      }
    };

    loadExistingAudio();

    // Cleanup blob URL on unmount
    return () => {
      if (audioUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [existingAudioUrl]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      toast.success('Script copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleSave = async () => {
    if (!onSave || !user) {
      toast.error('Please sign in to save scripts');
      return;
    }
    
    setIsSaving(true);
    try {
      const result = await onSave(title, script, category, config);
      if (result) {
        setLocalScriptId(result.id);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateAudio = async () => {
    setIsGeneratingAudio(true);
    try {
      // Get the user's session token for authenticated request
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Please sign in to generate audio');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ text: script }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate audio');
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      toast.success('Audio generated successfully!');
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate audio');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl glass-surface rounded-2xl p-6 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-display font-semibold text-foreground">
                {title}
              </h2>
              <p className="text-xs text-muted-foreground capitalize">{category} Script</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {localScriptId && onToggleFavorite && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onToggleFavorite(localScriptId)}
              >
                {isFavorite ? (
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                ) : (
                  <HeartOff className="w-4 h-4" />
                )}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Audio Player or Generate Button */}
        {isLoadingAudio ? (
          <div className="mb-4 p-4 rounded-xl bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading saved audio...</span>
            </div>
          </div>
        ) : audioUrl ? (
          <div className="mb-4">
            <AudioPlayer audioUrl={audioUrl} title={title} autoPlay backgroundFrequency={backgroundFrequency} />
          </div>
        ) : (
          <div className="mb-4 p-4 rounded-xl bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Generate Audio</p>
                <p className="text-xs text-muted-foreground">Convert this script to a calming voice</p>
              </div>
              <Button
                onClick={handleGenerateAudio}
                disabled={isGeneratingAudio}
                className="gap-2"
              >
                {isGeneratingAudio ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Generate Audio
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Script Content */}
        <div className="flex-1 overflow-y-auto mb-4">
          <div className="bg-muted/30 rounded-xl p-6 whitespace-pre-wrap text-sm text-foreground leading-relaxed">
            {script}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {!localScriptId && onSave && user && (
            <Button
              onClick={handleSave}
              disabled={isSaving}
              variant="outline"
              className="flex-1 gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save to Library
                </>
              )}
            </Button>
          )}
          <Button onClick={onClose} variant="ghost" className="flex-1">
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
