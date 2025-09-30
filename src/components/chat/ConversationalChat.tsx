import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Sparkles, User, Bot, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VoiceRecorder } from './VoiceRecorder';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: {
    type: string;
    data: string[];
  };
}

export const ConversationalChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI habit coach. I can help you track habits, get insights, and stay motivated. Try saying 'Log my workout' or 'How am I doing today?'",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      console.log('Sending message to chat service...');

      // Prepare conversation history
      const conversationMessages = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      // Add the new user message
      conversationMessages.push({
        role: 'user',
        content: text
      });

      const { data, error } = await supabase.functions.invoke('habit-chat', {
        body: { messages: conversationMessages }
      });

      if (error) {
        console.error('Chat error:', error);
        
        if (error.message?.includes('Rate limit')) {
          toast({
            title: "Rate Limit Reached",
            description: "Too many requests. Please try again in a moment.",
            variant: "destructive",
          });
          return;
        }
        
        if (error.message?.includes('credits')) {
          toast({
            title: "AI Credits Depleted",
            description: "Please add funds to your workspace.",
            variant: "destructive",
          });
          return;
        }
        
        throw error;
      }

      if (data?.message) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          action: data.action
        };

        setMessages(prev => [...prev, assistantMessage]);
        console.log('Response received:', data.message);

        // Show success toast for logged habits
        if (data.action?.type === 'LOG_HABIT') {
          toast({
            title: "Habit Logged!",
            description: `${data.action.data[0]} marked as ${data.action.data[1]}`,
          });
          
          // Trigger refresh event
          window.dispatchEvent(new CustomEvent('habitStatusChanged', {
            detail: { category: data.action.data[0], status: data.action.data[1] }
          }));
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      
      // Add error message to chat
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceTranscription = (text: string) => {
    console.log('Voice transcription received:', text);
    setInput(text);
    // Automatically send the transcribed text
    sendMessage(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const getActionIcon = (action?: { type: string; data: string[] }) => {
    if (!action) return null;
    
    switch (action.type) {
      case 'LOG_HABIT':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'CREATE_HABIT':
        return <Sparkles className="h-3 w-3 text-blue-500" />;
      case 'GET_INSIGHTS':
        return <AlertCircle className="h-3 w-3 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          AI Habit Assistant
          <Badge variant="secondary" className="ml-auto gap-1">
            <Sparkles className="h-3 w-3" />
            Voice Enabled
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`p-2 rounded-lg ${message.role === 'user' ? 'bg-primary/10' : 'bg-muted'}`}>
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4 text-primary" />
                  )}
                </div>
                
                <div className={`flex-1 space-y-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {message.action && (
                      <Badge variant="outline" className="gap-1">
                        {getActionIcon(message.action)}
                        {message.action.type.replace('_', ' ').toLowerCase()}
                      </Badge>
                    )}
                    <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="inline-block p-3 rounded-lg bg-muted">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message or use voice..."
              disabled={isLoading}
              className="flex-1"
            />
            <VoiceRecorder onTranscription={handleVoiceTranscription} />
            <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
          
          <div className="mt-2 text-xs text-muted-foreground">
            Try: "Log my workout", "How am I doing?", "Create a reading habit"
          </div>
        </div>
      </CardContent>
    </Card>
  );
};