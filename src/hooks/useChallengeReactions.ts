import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChallengeReaction {
  id: string;
  challenge_id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
  profiles?: {
    display_name?: string;
    email?: string;
    avatar_url?: string;
  };
}

interface ReactionSummary {
  [key: string]: {
    count: number;
    users: Array<{
      user_id: string;
      display_name?: string;
      email?: string;
      avatar_url?: string;
    }>;
    userHasReacted: boolean;
  };
}

const REACTION_EMOJIS = {
  like: '👍',
  love: '❤️',
  fire: '🔥',
  strong: '💪',
  celebrate: '🎉',
  trophy: '🏆',
  thumbs_down: '👎',
  thinking: '🤔',
};

export const useChallengeReactions = (challengeId?: string) => {
  const [reactions, setReactions] = useState<ChallengeReaction[]>([]);
  const [reactionSummary, setReactionSummary] = useState<ReactionSummary>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReactions = useCallback(async () => {
    if (!challengeId) return;

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('challenge_reactions')
        .select(`
          *,
          profiles (
            display_name,
            email,
            avatar_url
          )
        `)
        .eq('challenge_id', challengeId);

      if (error) throw error;

      setReactions(data || []);

      // Process reactions into summary
      const summary: ReactionSummary = {};
      
      (data || []).forEach(reaction => {
        const reactionType = reaction.reaction_type;
        
        if (!summary[reactionType]) {
          summary[reactionType] = {
            count: 0,
            users: [],
            userHasReacted: false,
          };
        }

        summary[reactionType].count++;
        summary[reactionType].users.push({
          user_id: reaction.user_id,
          display_name: reaction.profiles?.display_name,
          email: reaction.profiles?.email,
          avatar_url: reaction.profiles?.avatar_url,
        });

        if (reaction.user_id === user.id) {
          summary[reactionType].userHasReacted = true;
        }
      });

      setReactionSummary(summary);
    } catch (error) {
      console.error('Error fetching reactions:', error);
      toast({
        title: "Error",
        description: "Failed to load reactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [challengeId, toast]);

  const toggleReaction = async (reactionType: string) => {
    if (!challengeId) return { success: false };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const userHasReacted = reactionSummary[reactionType]?.userHasReacted;

      if (userHasReacted) {
        // Remove reaction
        const { error } = await supabase
          .from('challenge_reactions')
          .delete()
          .eq('challenge_id', challengeId)
          .eq('user_id', user.id)
          .eq('reaction_type', reactionType);

        if (error) throw error;
      } else {
        // Add reaction
        const { error } = await supabase
          .from('challenge_reactions')
          .insert({
            challenge_id: challengeId,
            user_id: user.id,
            reaction_type: reactionType,
          });

        if (error) throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Error toggling reaction:', error);
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const getReactionEmoji = (reactionType: string) => {
    return REACTION_EMOJIS[reactionType as keyof typeof REACTION_EMOJIS] || '👍';
  };

  const getTotalReactions = () => {
    return Object.values(reactionSummary).reduce((total, reaction) => total + reaction.count, 0);
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!challengeId) return;

    fetchReactions();

    const channel = supabase
      .channel(`challenge-reactions-${challengeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'challenge_reactions',
          filter: `challenge_id=eq.${challengeId}`,
        },
        () => {
          fetchReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [challengeId, fetchReactions]);

  return {
    reactions,
    reactionSummary,
    loading,
    toggleReaction,
    getReactionEmoji,
    getTotalReactions,
    refreshReactions: fetchReactions,
    availableReactions: Object.keys(REACTION_EMOJIS),
  };
};