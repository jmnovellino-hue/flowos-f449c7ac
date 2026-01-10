import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Commitment {
  id: string;
  user_id: string;
  behavior: string;
  feeling: string;
  belief: string;
  commitment: string;
  deadline: string;
  reminder_enabled: boolean;
  status: 'active' | 'completed' | 'abandoned';
  completed_at: string | null;
  completion_reflection: string | null;
  days_practiced: number;
  last_check_in: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommitmentLog {
  id: string;
  commitment_id: string;
  user_id: string;
  log_date: string;
  practiced: boolean;
  notes: string | null;
  mood_before: number | null;
  mood_after: number | null;
  created_at: string;
}

export const useCommitments = () => {
  const { user } = useAuth();
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommitments = useCallback(async () => {
    if (!user) {
      setCommitments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('commitments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommitments((data as Commitment[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch commitments');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCommitments();
  }, [fetchCommitments]);

  const createCommitment = async (commitment: Omit<Commitment, 'id' | 'user_id' | 'status' | 'completed_at' | 'completion_reflection' | 'days_practiced' | 'last_check_in' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('Must be logged in');

    const { data, error } = await supabase
      .from('commitments')
      .insert({
        user_id: user.id,
        behavior: commitment.behavior,
        feeling: commitment.feeling,
        belief: commitment.belief,
        commitment: commitment.commitment,
        deadline: commitment.deadline,
        reminder_enabled: commitment.reminder_enabled,
      })
      .select()
      .single();

    if (error) throw error;
    await fetchCommitments();
    return data as Commitment;
  };

  const updateCommitment = async (id: string, updates: Partial<Commitment>) => {
    const { error } = await supabase
      .from('commitments')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    await fetchCommitments();
  };

  const completeCommitment = async (id: string, reflection: string) => {
    await updateCommitment(id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      completion_reflection: reflection,
    });
  };

  const logCheckIn = async (commitmentId: string, practiced: boolean, notes?: string, moodBefore?: number, moodAfter?: number) => {
    if (!user) throw new Error('Must be logged in');

    const today = new Date().toISOString().split('T')[0];
    
    const { error } = await supabase
      .from('commitment_logs')
      .upsert({
        commitment_id: commitmentId,
        user_id: user.id,
        log_date: today,
        practiced,
        notes,
        mood_before: moodBefore,
        mood_after: moodAfter,
      }, {
        onConflict: 'commitment_id,log_date',
      });

    if (error) throw error;

    // Update days_practiced count if practiced
    if (practiced) {
      const commitment = commitments.find(c => c.id === commitmentId);
      if (commitment) {
        await updateCommitment(commitmentId, {
          days_practiced: commitment.days_practiced + 1,
          last_check_in: today,
        });
      }
    }
  };

  const getCommitmentLogs = async (commitmentId: string): Promise<CommitmentLog[]> => {
    const { data, error } = await supabase
      .from('commitment_logs')
      .select('*')
      .eq('commitment_id', commitmentId)
      .order('log_date', { ascending: false });

    if (error) throw error;
    return (data as CommitmentLog[]) || [];
  };

  const getActiveCommitments = () => commitments.filter(c => c.status === 'active');
  const getCompletedCommitments = () => commitments.filter(c => c.status === 'completed');

  return {
    commitments,
    loading,
    error,
    createCommitment,
    updateCommitment,
    completeCommitment,
    logCheckIn,
    getCommitmentLogs,
    getActiveCommitments,
    getCompletedCommitments,
    refetch: fetchCommitments,
  };
};
