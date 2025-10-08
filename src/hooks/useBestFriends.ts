import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface BestFriend {
  id: string;
  friend_id: string;
  pinned_at: string;
  position: number;
  profile?: {
    display_name?: string;
    avatar_url?: string;
    username?: string;
  };
}

export const useBestFriends = () => {
  const [bestFriends, setBestFriends] = useState<BestFriend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const MAX_BEST_FRIENDS = 5;

  const fetchBestFriends = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('best_friends')
        .select(`
          id,
          friend_id,
          pinned_at,
          position
        `)
        .eq('user_id', user.id)
        .order('position', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const friendIds = data.map(bf => bf.friend_id);
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, username')
          .in('id', friendIds);

        if (profileError) throw profileError;

        const enrichedData = data.map(bf => ({
          ...bf,
          profile: profiles?.find(p => p.id === bf.friend_id)
        }));

        setBestFriends(enrichedData);
      } else {
        setBestFriends([]);
      }
    } catch (error) {
      console.error('Error fetching best friends:', error);
      toast.error("Failed to load best friends");
    } finally {
      setIsLoading(false);
    }
  };

  const addBestFriend = async (friendId: string) => {
    if (!user) return false;

    // Check if already at max
    if (bestFriends.length >= MAX_BEST_FRIENDS) {
      toast.error(`You can only pin up to ${MAX_BEST_FRIENDS} best friends`);
      return false;
    }

    try {
      const newPosition = bestFriends.length;
      const { error } = await supabase
        .from('best_friends')
        .insert({
          user_id: user.id,
          friend_id: friendId,
          position: newPosition
        });

      if (error) throw error;

      await fetchBestFriends();
      toast.success("Added to best friends");
      return true;
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error("This friend is already in your best friends");
      } else {
        console.error('Error adding best friend:', error);
        toast.error("Failed to add best friend");
      }
      return false;
    }
  };

  const removeBestFriend = async (bestFriendId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('best_friends')
        .delete()
        .eq('id', bestFriendId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchBestFriends();
      toast.success("Removed from best friends");
      return true;
    } catch (error) {
      console.error('Error removing best friend:', error);
      toast.error("Failed to remove best friend");
      return false;
    }
  };

  const reorderBestFriends = async (friendId: string, newPosition: number) => {
    if (!user) return false;

    try {
      const bestFriend = bestFriends.find(bf => bf.friend_id === friendId);
      if (!bestFriend) return false;

      const { error } = await supabase
        .from('best_friends')
        .update({ position: newPosition })
        .eq('id', bestFriend.id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchBestFriends();
      return true;
    } catch (error) {
      console.error('Error reordering best friends:', error);
      toast.error("Failed to reorder best friends");
      return false;
    }
  };

  const isBestFriend = (friendId: string) => {
    return bestFriends.some(bf => bf.friend_id === friendId);
  };

  useEffect(() => {
    fetchBestFriends();
  }, [user]);

  return {
    bestFriends,
    isLoading,
    addBestFriend,
    removeBestFriend,
    reorderBestFriends,
    isBestFriend,
    maxReached: bestFriends.length >= MAX_BEST_FRIENDS,
    refetch: fetchBestFriends
  };
};
