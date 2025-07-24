import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Challenge {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_value: number | null;
  target_unit: string | null;
  start_date: string;
  end_date: string;
  max_participants: number | null;
  is_team_based: boolean;
  max_team_size: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  participant_count?: number;
  user_participation?: {
    current_progress: number;
    status: string;
    team_id?: string;
  };
}

export const useChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch active challenges
  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get challenges with participant counts and user participation
      const { data: challengesData, error } = await supabase
        .from('challenges')
        .select(`
          *,
          challenge_participants!inner (
            id,
            current_progress,
            status,
            team_id,
            user_id
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process challenges to add participant counts and user participation
      const processedChallenges = challengesData?.reduce<Challenge[]>((acc, challenge) => {
        const existingChallenge = acc.find(c => c.id === challenge.id);
        
        if (existingChallenge) {
          existingChallenge.participant_count! += 1;
          if (challenge.challenge_participants.user_id === user.id) {
            existingChallenge.user_participation = {
              current_progress: challenge.challenge_participants.current_progress,
              status: challenge.challenge_participants.status,
              team_id: challenge.challenge_participants.team_id,
            };
          }
        } else {
          const newChallenge: Challenge = {
            ...challenge,
            participant_count: 1,
            user_participation: challenge.challenge_participants.user_id === user.id ? {
              current_progress: challenge.challenge_participants.current_progress,
              status: challenge.challenge_participants.status,
              team_id: challenge.challenge_participants.team_id,
            } : undefined,
          };
          delete (newChallenge as any).challenge_participants;
          acc.push(newChallenge);
        }
        
        return acc;
      }, []) || [];

      setChallenges(processedChallenges);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast({
        title: "Error",
        description: "Failed to load challenges",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Join a challenge
  const joinChallenge = async (challengeId: string, teamId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          team_id: teamId || null,
        });

      if (error) throw error;

      // Send notification to challenge creator
      const challenge = challenges.find(c => c.id === challengeId);
      if (challenge && challenge.creator_id !== user.id) {
        await supabase.from('notifications').insert({
          user_id: challenge.creator_id,
          actor_id: user.id,
          type: 'challenge_join',
          entity_type: 'challenge',
          entity_id: challengeId,
          message: `joined your challenge "${challenge.title}"`,
        });
      }

      await fetchChallenges();
      
      toast({
        title: "Success",
        description: "Successfully joined the challenge!",
      });

      return true;
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast({
        title: "Error",
        description: "Failed to join challenge",
        variant: "destructive",
      });
      return false;
    }
  };

  // Leave a challenge
  const leaveChallenge = async (challengeId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('challenge_participants')
        .delete()
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchChallenges();
      
      toast({
        title: "Success",
        description: "Left the challenge",
      });

      return true;
    } catch (error) {
      console.error('Error leaving challenge:', error);
      toast({
        title: "Error",
        description: "Failed to leave challenge",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  return {
    challenges,
    loading,
    joinChallenge,
    leaveChallenge,
    refreshChallenges: fetchChallenges,
  };
};