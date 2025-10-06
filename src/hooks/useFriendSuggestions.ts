import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FriendSuggestion {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  username: string;
  mutual_friends_count: number;
  shared_habits_count: number;
  score: number;
  suggestion_reason: string;
}

export const useFriendSuggestions = () => {
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('get_friend_suggestions', {
        p_user_id: user.id,
        p_limit: 10
      });

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error('Error fetching friend suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissSuggestion = async (suggestedUserId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('friend_suggestions')
        .upsert({
          user_id: user.id,
          suggested_user_id: suggestedUserId,
          dismissed_at: new Date().toISOString()
        });

      if (error) throw error;

      setSuggestions(prev => prev.filter(s => s.user_id !== suggestedUserId));
      toast({
        title: 'Suggestion dismissed',
        description: 'We won\'t suggest this person again'
      });
    } catch (error) {
      console.error('Error dismissing suggestion:', error);
      toast({
        title: 'Error',
        description: 'Failed to dismiss suggestion',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  return {
    suggestions,
    loading,
    dismissSuggestion,
    refetch: fetchSuggestions
  };
};
