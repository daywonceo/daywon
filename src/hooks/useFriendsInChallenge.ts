import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FriendInChallenge {
  id: string;
  user_id: string;
  current_progress: number;
  joined_at: string;
  profiles: {
    display_name: string;
    avatar_url: string;
    username: string;
  };
}

export const useFriendsInChallenge = (challengeId: string) => {
  const [friends, setFriends] = useState<FriendInChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalFriends, setTotalFriends] = useState(0);

  useEffect(() => {
    fetchFriendsInChallenge();
  }, [challengeId]);

  const fetchFriendsInChallenge = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get user's friends
      const { data: friendships } = await supabase
        .from('user_relationships')
        .select('follower_id, following_id')
        .or(`follower_id.eq.${user.id},following_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (!friendships || friendships.length === 0) {
        setLoading(false);
        return;
      }

      // Extract friend IDs
      const friendIds = friendships.map(f => 
        f.follower_id === user.id ? f.following_id : f.follower_id
      );

      // Get friends participating in this challenge
      const { data: participants, error } = await supabase
        .from('challenge_participants')
        .select(`
          id,
          user_id,
          current_progress,
          joined_at,
          profiles:user_id (
            display_name,
            avatar_url,
            username
          )
        `)
        .eq('challenge_id', challengeId)
        .in('user_id', friendIds)
        .order('current_progress', { ascending: false });

      if (error) throw error;

      setFriends((participants as any) || []);
      setTotalFriends(participants?.length || 0);
    } catch (error) {
      console.error('Error fetching friends in challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    friends,
    totalFriends,
    loading,
    refetch: fetchFriendsInChallenge,
  };
};
