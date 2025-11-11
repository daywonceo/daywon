import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface IntegrationRule {
  id: string;
  user_id: string;
  provider: string;
  match_type: string;
  match_value: string;
  habit_id: string;
  active: boolean;
  created_at: string;
  habits?: {
    id: string;
    name: string;
  };
}

interface CreateRuleInput {
  match_type: string;
  match_value: string;
  habit_id: string;
  active?: boolean;
}

interface UpdateRuleInput {
  match_type?: string;
  match_value?: string;
  habit_id?: string;
  active?: boolean;
}

export function useIntegrationRules(provider: 'todoist' | 'strava') {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rules, setRules] = useState<IntegrationRule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRules = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('integration_rules')
        .select('*, habits(id, name)')
        .eq('user_id', user.id)
        .eq('provider', provider)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Error fetching rules:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch integration rules',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createRule = async (input: CreateRuleInput) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in',
        variant: 'destructive',
      });
      return { success: false };
    }

    try {
      const { data, error } = await supabase
        .from('integration_rules')
        .insert({
          user_id: user.id,
          provider,
          match_type: input.match_type,
          match_value: input.match_value,
          habit_id: input.habit_id,
          active: input.active ?? true,
        })
        .select('*, habits(id, name)')
        .single();

      if (error) throw error;

      setRules((prev) => [data, ...prev]);
      toast({
        title: 'Rule created',
        description: 'Integration rule added successfully',
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error creating rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to create rule',
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  const updateRule = async (ruleId: string, updates: UpdateRuleInput) => {
    if (!user) return { success: false };

    try {
      const { data, error } = await supabase
        .from('integration_rules')
        .update(updates)
        .eq('id', ruleId)
        .eq('user_id', user.id)
        .select('*, habits(id, name)')
        .single();

      if (error) throw error;

      setRules((prev) =>
        prev.map((rule) => (rule.id === ruleId ? data : rule))
      );

      toast({
        title: 'Rule updated',
        description: 'Integration rule updated successfully',
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error updating rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to update rule',
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (!user) return { success: false };

    try {
      const { error } = await supabase
        .from('integration_rules')
        .delete()
        .eq('id', ruleId)
        .eq('user_id', user.id);

      if (error) throw error;

      setRules((prev) => prev.filter((rule) => rule.id !== ruleId));
      toast({
        title: 'Rule deleted',
        description: 'Integration rule removed successfully',
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete rule',
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchRules();
  }, [user, provider]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('integration-rules-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'integration_rules',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchRules();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, provider]);

  return {
    rules,
    loading,
    createRule,
    updateRule,
    deleteRule,
    refetch: fetchRules,
  };
}
