import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface BlockedUser {
  id: string;
  blocked_id: string;
  blocked_at: string;
  reason?: string;
  profile?: {
    display_name?: string;
    avatar_url?: string;
    username?: string;
  };
}

export const useBlockedUsers = () => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchBlockedUsers = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select(`
          id,
          blocked_id,
          blocked_at,
          reason
        `)
        .eq('blocker_id', user.id)
        .order('blocked_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for blocked users
      if (data && data.length > 0) {
        const profileIds = data.map(b => b.blocked_id);
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, username')
          .in('id', profileIds);

        if (profileError) throw profileError;

        const enrichedData = data.map(block => ({
          ...block,
          profile: profiles?.find(p => p.id === block.blocked_id)
        }));

        setBlockedUsers(enrichedData);
      } else {
        setBlockedUsers([]);
      }
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      toast.error("Failed to load blocked users");
    } finally {
      setIsLoading(false);
    }
  };

  const blockUser = async (userId: string, reason?: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('blocked_users')
        .insert({
          blocker_id: user.id,
          blocked_id: userId,
          reason
        });

      if (error) throw error;

      // Remove any existing friend relationships
      await supabase
        .from('user_relationships')
        .delete()
        .or(`and(follower_id.eq.${user.id},following_id.eq.${userId}),and(follower_id.eq.${userId},following_id.eq.${user.id})`);

      await fetchBlockedUsers();
      toast.success("User blocked successfully");
      return true;
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error("Failed to block user");
      return false;
    }
  };

  const unblockUser = async (blockId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('id', blockId)
        .eq('blocker_id', user.id);

      if (error) throw error;

      await fetchBlockedUsers();
      toast.success("User unblocked successfully");
      return true;
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast.error("Failed to unblock user");
      return false;
    }
  };

  const isUserBlocked = async (userId: string) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select('id')
        .eq('blocker_id', user.id)
        .eq('blocked_id', userId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking block status:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, [user]);

  return {
    blockedUsers,
    isLoading,
    blockUser,
    unblockUser,
    isUserBlocked,
    refetch: fetchBlockedUsers
  };
};
