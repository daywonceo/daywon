import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FriendRelationship {
  id: string;
  follower_id: string;
  following_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface Friend {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  status: 'online' | 'away' | 'offline';
  last_active: string;
  relationship_status: 'pending' | 'accepted' | 'blocked';
  mutual_habits?: number;
}

export const useFriends = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [sentRequests, setSentRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch friends and pending requests
  const fetchFriends = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get accepted friends
      const { data: acceptedFriends, error: friendsError } = await supabase
        .from('user_relationships')
        .select(`
          id,
          follower_id,
          following_id,
          status,
          profiles!user_relationships_following_id_fkey(
            id,
            display_name,
            avatar_url,
            status,
            last_active
          )
        `)
        .eq('follower_id', user.id)
        .eq('status', 'accepted');

      if (friendsError) throw friendsError;

      // Get pending friend requests (received)
      const { data: pendingFriends, error: pendingError } = await supabase
        .from('user_relationships')
        .select(`
          id,
          follower_id,
          following_id,
          status,
          profiles!user_relationships_follower_id_fkey(
            id,
            display_name,
            avatar_url,
            status,
            last_active
          )
        `)
        .eq('following_id', user.id)
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      // Get sent requests
      const { data: sentFriends, error: sentError } = await supabase
        .from('user_relationships')
        .select(`
          id,
          follower_id,
          following_id,
          status,
          profiles!user_relationships_following_id_fkey(
            id,
            display_name,
            avatar_url,
            status,
            last_active
          )
        `)
        .eq('follower_id', user.id)
        .eq('status', 'pending');

      if (sentError) throw sentError;

      // Format friends data - filter out null profiles
      const formattedFriends = acceptedFriends
        ?.filter(rel => rel.profiles !== null)
        ?.map(rel => ({
          id: (rel.profiles as any).id,
          display_name: (rel.profiles as any).display_name,
          avatar_url: (rel.profiles as any).avatar_url,
          status: (rel.profiles as any).status,
          last_active: (rel.profiles as any).last_active,
          relationship_status: rel.status as 'accepted',
        })) || [];

      const formattedPending = pendingFriends
        ?.filter(rel => rel.profiles !== null)
        ?.map(rel => ({
          id: (rel.profiles as any).id,
          display_name: (rel.profiles as any).display_name,
          avatar_url: (rel.profiles as any).avatar_url,
          status: (rel.profiles as any).status,
          last_active: (rel.profiles as any).last_active,
          relationship_status: rel.status as 'pending',
        })) || [];

      const formattedSent = sentFriends
        ?.filter(rel => rel.profiles !== null)
        ?.map(rel => ({
          id: (rel.profiles as any).id,
          display_name: (rel.profiles as any).display_name,
          avatar_url: (rel.profiles as any).avatar_url,
          status: (rel.profiles as any).status,
          last_active: (rel.profiles as any).last_active,
          relationship_status: rel.status as 'pending',
        })) || [];

      setFriends(formattedFriends);
      setPendingRequests(formattedPending);
      setSentRequests(formattedSent);
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast({
        title: "Error",
        description: "Failed to load friends",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Send friend request
  const sendFriendRequest = useCallback(async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('user_relationships')
        .insert({
          follower_id: user.id,
          following_id: userId,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: "Friend request sent",
        description: "Your friend request has been sent",
      });

      fetchFriends(); // Refresh the lists
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      if (error.code === '23505') {
        toast({
          title: "Already connected",
          description: "You already have a relationship with this user",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send friend request",
          variant: "destructive",
        });
      }
    }
  }, [toast, fetchFriends]);

  // Accept friend request
  const acceptFriendRequest = useCallback(async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('user_relationships')
        .update({ status: 'accepted' })
        .eq('follower_id', userId)
        .eq('following_id', user.id);

      if (error) throw error;

      // Create reciprocal relationship
      await supabase
        .from('user_relationships')
        .insert({
          follower_id: user.id,
          following_id: userId,
          status: 'accepted',
        });

      toast({
        title: "Friend request accepted",
        description: "You are now friends!",
      });

      fetchFriends(); // Refresh the lists
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast({
        title: "Error",
        description: "Failed to accept friend request",
        variant: "destructive",
      });
    }
  }, [toast, fetchFriends]);

  // Decline friend request
  const declineFriendRequest = useCallback(async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('user_relationships')
        .delete()
        .eq('follower_id', userId)
        .eq('following_id', user.id);

      if (error) throw error;

      toast({
        title: "Friend request declined",
        description: "The friend request has been declined",
      });

      fetchFriends(); // Refresh the lists
    } catch (error) {
      console.error('Error declining friend request:', error);
      toast({
        title: "Error",
        description: "Failed to decline friend request",
        variant: "destructive",
      });
    }
  }, [toast, fetchFriends]);

  // Remove friend
  const removeFriend = useCallback(async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Remove both directions of the relationship
      await supabase
        .from('user_relationships')
        .delete()
        .or(`and(follower_id.eq.${user.id},following_id.eq.${userId}),and(follower_id.eq.${userId},following_id.eq.${user.id})`);

      toast({
        title: "Friend removed",
        description: "Friend has been removed from your list",
      });

      fetchFriends(); // Refresh the lists
    } catch (error) {
      console.error('Error removing friend:', error);
      toast({
        title: "Error",
        description: "Failed to remove friend",
        variant: "destructive",
      });
    }
  }, [toast, fetchFriends]);

  // Cancel sent friend request
  const cancelFriendRequest = useCallback(async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('user_relationships')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) throw error;

      toast({
        title: "Friend request cancelled",
        description: "Your friend request has been cancelled",
      });

      fetchFriends(); // Refresh the lists
    } catch (error) {
      console.error('Error cancelling friend request:', error);
      toast({
        title: "Error",
        description: "Failed to cancel friend request",
        variant: "destructive",
      });
    }
  }, [toast, fetchFriends]);

  // Get friend status with a user
  const getFriendshipStatus = useCallback(async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_relationships')
        .select('status, follower_id, following_id')
        .or(`and(follower_id.eq.${user.id},following_id.eq.${userId}),and(follower_id.eq.${userId},following_id.eq.${user.id})`)
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      console.error('Error checking friendship status:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  // Memoize return values
  const memoizedReturn = useMemo(() => ({
    friends,
    pendingRequests,
    sentRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    cancelFriendRequest,
    getFriendshipStatus,
    refetch: fetchFriends,
  }), [
    friends,
    pendingRequests,
    sentRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    cancelFriendRequest,
    getFriendshipStatus,
    fetchFriends
  ]);

  return memoizedReturn;
};