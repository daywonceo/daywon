import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Integration {
  id: string;
  user_id: string;
  integration_type: string;
  provider_user_id: string | null;
  access_token: string | null;
  refresh_token: string | null;
  expires_at: string | null;
  integration_scopes: string[] | null;
  is_connected: boolean;
  integration_status: string;
  connected_at: string;
  last_synced_at: string | null;
  ignore_before: string;
  integration_settings: any;
  created_at: string;
  updated_at: string;
}

export function useIntegrationsList() {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIntegrations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_integrations')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIntegration = (provider: string): Integration | undefined => {
    return integrations.find((i) => i.integration_type === provider);
  };

  useEffect(() => {
    fetchIntegrations();
  }, [user]);

  // Real-time subscription for integration changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-integrations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_integrations',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setIntegrations((prev) => [...prev, payload.new as Integration]);
          } else if (payload.eventType === 'UPDATE') {
            setIntegrations((prev) =>
              prev.map((integration) =>
                integration.id === (payload.new as Integration).id
                  ? (payload.new as Integration)
                  : integration
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setIntegrations((prev) =>
              prev.filter((integration) => integration.id !== (payload.old as Integration).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    integrations,
    loading,
    getIntegration,
    refetch: fetchIntegrations,
  };
}
