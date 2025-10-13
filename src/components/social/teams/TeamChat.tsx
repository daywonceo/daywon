import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/shared/LoadingStates';

interface TeamChatProps {
  challengeId: string;
  teamId: string;
  teamName: string;
}

interface Message {
  id: string;
  message: string;
  created_at: string;
  user_id: string;
  profiles?: {
    display_name: string;
    avatar_url: string;
    username: string;
  };
}

const TeamChat = ({ challengeId, teamId, teamName }: TeamChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    fetchMessages();
    const channel = setupRealtimeSubscription();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [challengeId, teamId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
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
            avatar_url,
            username
          )
        `)
        .eq('challenge_id', challengeId)
        .eq('team_id', teamId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages(data as any || []);
    } catch (error: any) {
      toast({
        title: "Error loading messages",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`team-chat-${teamId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'challenge_chat',
          filter: `team_id=eq.${teamId}`,
        },
        async (payload) => {
          // Fetch the new message with profile data
          const { data } = await supabase
            .from('challenge_chat')
            .select(`
              id,
              message,
              created_at,
              user_id,
              profiles:user_id (
                display_name,
                avatar_url,
                username
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setMessages(prev => [...prev, data as any]);
          }
        }
      )
      .subscribe();

    return channel;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentUserId) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('challenge_chat')
        .insert({
          challenge_id: challengeId,
          team_id: teamId,
          user_id: currentUserId,
          message: newMessage.trim(),
          message_type: 'text',
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading chat..." />;
  }

  return (
    <Card className="bg-card border flex flex-col h-[500px]">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle size={20} />
          <span>{teamName} Chat</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isOwnMessage = msg.user_id === currentUserId;
              const displayName = msg.profiles?.display_name || 'User';

              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex space-x-2 max-w-[80%] ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {!isOwnMessage && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={msg.profiles?.avatar_url || '/placeholder.svg'} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {displayName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                      {!isOwnMessage && (
                        <span className="text-xs font-medium mb-1">{displayName}</span>
                      )}
                      <div
                        className={`px-3 py-2 rounded-lg ${
                          isOwnMessage
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm break-words">{msg.message}</p>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </CardContent>

      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            maxLength={500}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={sending || !newMessage.trim()}
          >
            <Send size={18} />
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default TeamChat;
