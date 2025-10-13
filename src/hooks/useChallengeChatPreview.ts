import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  message: string;
  created_at: string;
  user_id: string;
  profiles?: {
    display_name: string;
    avatar_url: string;
  };
}

export const useChallengeChatPreview = (challengeId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentMessages();
    const channel = setupRealtimeSubscription();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [challengeId]);

  const fetchRecentMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('challenge_chat')
        .select(`
          id,
          message,
          created_at,
          user_id,
          profiles:user_id (
            display_name,
            avatar_url
          )
        `)
        .eq('challenge_id', challengeId)
        .is('team_id', null) // General challenge chat only
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      setMessages((data as any) || []);
      
      // Calculate unread (messages from last 24 hours from other users)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        
        const unread = (data || []).filter(
          msg => msg.user_id !== user.id && new Date(msg.created_at) > oneDayAgo
        );
        setUnreadCount(unread.length);
      }
    } catch (error) {
      console.error('Error fetching chat preview:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    return supabase
      .channel(`challenge-chat-preview-${challengeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'challenge_chat',
          filter: `challenge_id=eq.${challengeId}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from('challenge_chat')
            .select(`
              id,
              message,
              created_at,
              user_id,
              profiles:user_id (
                display_name,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setMessages(prev => [data as any, ...prev.slice(0, 4)]);
            
            const { data: { user } } = await supabase.auth.getUser();
            if (user && data.user_id !== user.id) {
              setUnreadCount(prev => prev + 1);
            }
          }
        }
      )
      .subscribe();
  };

  const markAsRead = () => {
    setUnreadCount(0);
  };

  return {
    messages,
    unreadCount,
    loading,
    markAsRead,
    refetch: fetchRecentMessages,
  };
};
