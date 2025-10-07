import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthOptimized } from './useAuthOptimized';
import { toast } from '@/hooks/use-toast';

interface FriendInvitation {
  id: string;
  email: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  expires_at: string;
  created_at: string;
  accepted_at?: string;
  accepted_by_user_id?: string;
}

export const useFriendInvitations = () => {
  const { user } = useAuthOptimized();
  const [invitations, setInvitations] = useState<FriendInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchInvitations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('friend_invitations')
        .select('*')
        .eq('inviter_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error: any) {
      console.error('Error fetching invitations:', error);
      toast({
        title: "Error",
        description: "Failed to load invitations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async (email: string, message?: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to send invitations",
        variant: "destructive",
      });
      return { success: false };
    }

    try {
      setSending(true);

      const { data, error } = await supabase.functions.invoke('send-friend-invitation', {
        body: { email, message },
      });

      if (error) throw error;

      if (data.error) {
        if (data.userId) {
          toast({
            title: "User Already Registered",
            description: "This user is already on Daywon. Try searching for them instead!",
          });
          return { success: false, existingUserId: data.userId };
        }
        throw new Error(data.error);
      }

      toast({
        title: "Invitation Sent!",
        description: `We've sent an invitation to ${email}`,
      });

      // Refresh invitations list
      await fetchInvitations();

      return { success: true, data };
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setSending(false);
    }
  };

  const acceptInvitation = async (token: string) => {
    if (!user) return { success: false };

    try {
      // Fetch invitation details
      const { data: invitation, error: fetchError } = await supabase
        .from('friend_invitations')
        .select('*')
        .eq('token', token)
        .eq('status', 'pending')
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!invitation) {
        toast({
          title: "Invalid Invitation",
          description: "This invitation is no longer valid",
          variant: "destructive",
        });
        return { success: false };
      }

      // Check if expired
      if (new Date(invitation.expires_at) < new Date()) {
        await supabase
          .from('friend_invitations')
          .update({ status: 'expired' })
          .eq('id', invitation.id);

        toast({
          title: "Invitation Expired",
          description: "This invitation has expired",
          variant: "destructive",
        });
        return { success: false };
      }

      // Update invitation status
      const { error: updateError } = await supabase
        .from('friend_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          accepted_by_user_id: user.id,
        })
        .eq('id', invitation.id);

      if (updateError) throw updateError;

      // Create friend relationship
      const { error: relationshipError } = await supabase
        .from('user_relationships')
        .insert({
          follower_id: user.id,
          following_id: invitation.inviter_id,
          status: 'accepted',
        });

      if (relationshipError) throw relationshipError;

      toast({
        title: "Success!",
        description: "You're now friends!",
      });

      return { success: true, inviterId: invitation.inviter_id };
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error",
        description: "Failed to accept invitation",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [user?.id]);

  return {
    invitations,
    loading,
    sending,
    sendInvitation,
    acceptInvitation,
    refreshInvitations: fetchInvitations,
  };
};