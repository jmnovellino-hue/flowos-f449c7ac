import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface AudioScript {
  id: string;
  user_id: string;
  title: string;
  script: string;
  category: 'meditation' | 'performance';
  config: Record<string, unknown> | null;
  audio_url: string | null;
  duration_seconds: number | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export const useAudioScripts = () => {
  const { user } = useAuth();
  const [scripts, setScripts] = useState<AudioScript[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScripts = useCallback(async () => {
    if (!user) {
      setScripts([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('audio_scripts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScripts(data as AudioScript[]);
    } catch (error) {
      console.error('Error fetching scripts:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchScripts();
  }, [fetchScripts]);

  const saveScript = async (
    title: string,
    script: string,
    category: 'meditation' | 'performance',
    config?: Record<string, unknown>
  ) => {
    if (!user) {
      toast.error('Please sign in to save scripts');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('audio_scripts')
        .insert([{
          user_id: user.id,
          title,
          script,
          category,
          config: config ? JSON.parse(JSON.stringify(config)) : null,
        }])
        .select()
        .single();

      if (error) throw error;
      
      setScripts(prev => [data as AudioScript, ...prev]);
      toast.success('Script saved to library');
      return data as AudioScript;
    } catch (error) {
      console.error('Error saving script:', error);
      toast.error('Failed to save script');
      return null;
    }
  };

  const updateScriptAudio = async (scriptId: string, audioUrl: string, durationSeconds?: number) => {
    try {
      const { error } = await supabase
        .from('audio_scripts')
        .update({ 
          audio_url: audioUrl, 
          duration_seconds: durationSeconds || null 
        })
        .eq('id', scriptId);

      if (error) throw error;

      setScripts(prev => prev.map(s => 
        s.id === scriptId 
          ? { ...s, audio_url: audioUrl, duration_seconds: durationSeconds || null }
          : s
      ));
    } catch (error) {
      console.error('Error updating script audio:', error);
    }
  };

  const toggleFavorite = async (scriptId: string) => {
    const script = scripts.find(s => s.id === scriptId);
    if (!script) return;

    try {
      const { error } = await supabase
        .from('audio_scripts')
        .update({ is_favorite: !script.is_favorite })
        .eq('id', scriptId);

      if (error) throw error;

      setScripts(prev => prev.map(s => 
        s.id === scriptId ? { ...s, is_favorite: !s.is_favorite } : s
      ));
      
      toast.success(script.is_favorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite');
    }
  };

  const deleteScript = async (scriptId: string) => {
    try {
      const { error } = await supabase
        .from('audio_scripts')
        .delete()
        .eq('id', scriptId);

      if (error) throw error;

      setScripts(prev => prev.filter(s => s.id !== scriptId));
      toast.success('Script deleted');
    } catch (error) {
      console.error('Error deleting script:', error);
      toast.error('Failed to delete script');
    }
  };

  const favorites = scripts.filter(s => s.is_favorite);

  return {
    scripts,
    favorites,
    loading,
    saveScript,
    updateScriptAudio,
    toggleFavorite,
    deleteScript,
    refetch: fetchScripts,
  };
};
