import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateChallengeData {
  title: string;
  description: string;
  challenge_type: string;
  target_value: number;
  target_unit: string;
  start_date: string;
  end_date: string;
  max_participants?: number;
  is_team_based: boolean;
  max_team_size: number;
  entry_requirements?: any;
  prizes?: any;
  rules?: string;
}

export const useChallengeManagement = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Create a new challenge
  const createChallenge = async (challengeData: CreateChallengeData) => {
    try {
      setSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: challenge, error } = await supabase
        .from('challenges')
        .insert({
          ...challengeData,
          creator_id: user.id,
          status: 'active', // Auto-activate for now
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join creator to their own challenge
      await supabase.from('challenge_participants').insert({
        challenge_id: challenge.id,
        user_id: user.id,
        current_progress: 0,
      });

      toast({
        title: "Success!",
        description: "Your challenge has been created and is now live!",
      });

      return { success: true, challenge };
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast({
        title: "Error",
        description: "Failed to create challenge. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setSubmitting(false);
    }
  };

  // Update challenge
  const updateChallenge = async (challengeId: string, updates: Partial<CreateChallengeData>) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('challenges')
        .update(updates)
        .eq('id', challengeId)
        .eq('creator_id', user.id); // Ensure only creator can update

      if (error) throw error;

      toast({
        title: "Success",
        description: "Challenge updated successfully",
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating challenge:', error);
      toast({
        title: "Error",
        description: "Failed to update challenge",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Delete/Cancel challenge
  const deleteChallenge = async (challengeId: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Update status to cancelled instead of deleting
      const { error } = await supabase
        .from('challenges')
        .update({ status: 'cancelled' })
        .eq('id', challengeId)
        .eq('creator_id', user.id);

      if (error) throw error;

      toast({
        title: "Challenge Cancelled",
        description: "The challenge has been cancelled successfully",
      });

      return { success: true };
    } catch (error) {
      console.error('Error cancelling challenge:', error);
      toast({
        title: "Error",
        description: "Failed to cancel challenge",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Get user's created challenges
  const getUserChallenges = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: challenges, error } = await supabase
        .from('challenges')
        .select(`
          *,
          challenge_participants (
            id,
            current_progress,
            status,
            profiles (
              display_name,
              email,
              avatar_url
            )
          )
        `)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, challenges };
    } catch (error) {
      console.error('Error fetching user challenges:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Update participant progress (for challenge creators)
  const updateParticipantProgress = async (participantId: string, progress: number) => {
    try {
      const { error } = await supabase
        .from('challenge_participants')
        .update({ 
          current_progress: progress,
          last_progress_update: new Date().toISOString(),
        })
        .eq('id', participantId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error updating participant progress:', error);
      return { success: false, error };
    }
  };

  return {
    createChallenge,
    updateChallenge,
    deleteChallenge,
    getUserChallenges,
    updateParticipantProgress,
    loading,
    submitting,
  };
};