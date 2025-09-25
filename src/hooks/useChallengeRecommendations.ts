import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthOptimized } from './useAuthOptimized';
import { useFriends } from './useFriends';

interface ChallengeRecommendation {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  participant_count: number;
  friends_participating: number;
  popularity_score: number;
  match_score: number;
  creator_name: string;
  start_date: string;
  end_date: string;
}

export const useChallengeRecommendations = () => {
  const [recommendations, setRecommendations] = useState<ChallengeRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthOptimized();
  const { friends } = useFriends();

  const fetchRecommendations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get user's past challenge types and interests
      const { data: userChallenges } = await supabase
        .from('challenge_participants')
        .select(`
          challenges!inner(challenge_type, title)
        `)
        .eq('user_id', user.id);

      const userInterests = userChallenges?.map((c: any) => c.challenges?.challenge_type).filter(Boolean) || [];
      const friendIds = friends.map(f => f.id);

      // Get active challenges with participant counts and friend participation
      const { data: activeChallenges } = await supabase
        .from('challenges')
        .select(`
          id,
          title,
          description,
          challenge_type,
          start_date,
          end_date,
          profiles!challenges_creator_id_fkey(display_name),
          challenge_participants(
            user_id,
            profiles!challenge_participants_user_id_fkey(display_name)
          )
        `)
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString().split('T')[0])
        .not('creator_id', 'eq', user.id);

      if (!activeChallenges) {
        setRecommendations([]);
        return;
      }

      // Calculate recommendations with scoring
      const scored = activeChallenges.map(challenge => {
        const participantCount = challenge.challenge_participants?.length || 0;
        const friendsParticipating = challenge.challenge_participants?.filter(p => 
          friendIds.includes(p.user_id)
        ).length || 0;

        // Calculate match score based on user interests
        const typeMatch = userInterests.includes(challenge.challenge_type) ? 50 : 0;
        const friendBoost = friendsParticipating * 20;
        const popularityBoost = Math.min(participantCount * 2, 30);
        
        const matchScore = typeMatch + friendBoost + popularityBoost;
        const popularityScore = participantCount + (friendsParticipating * 2);

        return {
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          challenge_type: challenge.challenge_type,
          participant_count: participantCount,
          friends_participating: friendsParticipating,
          popularity_score: popularityScore,
          match_score: matchScore,
          creator_name: (challenge as any).profiles?.display_name || 'Unknown',
          start_date: challenge.start_date,
          end_date: challenge.end_date,
        };
      });

      // Sort by match score and limit to top 6
      const sortedRecommendations = scored
        .sort((a, b) => b.match_score - a.match_score)
        .slice(0, 6);

      setRecommendations(sortedRecommendations);
    } catch (error) {
      console.error('Error fetching challenge recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [user, friends]);

  return {
    recommendations,
    loading,
    refreshRecommendations: fetchRecommendations,
  };
};