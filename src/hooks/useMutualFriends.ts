import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface MutualFriend {
  user_id: string;
  display_name: string;
  avatar_url?: string;
  username: string;
}

export const useMutualFriends = (targetUserId?: string) => {
  const [mutualFriends, setMutualFriends] = useState<MutualFriend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [count, setCount] = useState(0);
  const { user } = useAuth();

  const fetchMutualFriends = async () => {
    if (!user || !targetUserId || user.id === targetUserId) {
      setMutualFriends([]);
      setCount(0);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('get_mutual_friends', {
          user_a: user.id,
          user_b: targetUserId
        });

      if (error) throw error;

      setMutualFriends(data || []);
      setCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching mutual friends:', error);
      setMutualFriends([]);
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMutualFriends();
  }, [user, targetUserId]);

  return {
    mutualFriends,
    count,
    isLoading,
    refetch: fetchMutualFriends
  };
};
