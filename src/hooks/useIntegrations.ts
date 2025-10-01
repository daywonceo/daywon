import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Integration {
  id: string;
  integration_type: string;
  is_connected: boolean;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  integration_settings: Record<string, any>;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SyncLog {
  id: string;
  integration_type: string;
  sync_type: string;
  status: string;
  records_processed: number;
  error_message?: string;
  sync_details: Record<string, any>;
  started_at: string;
  completed_at?: string;
}

export const useIntegrations = () => {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchIntegrations = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_integrations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast({
        title: "Error",
        description: "Failed to load integrations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSyncLogs = async (integrationType?: string) => {
    if (!user) return;

    try {
      let query = supabase
        .from('integration_sync_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(50);

      if (integrationType) {
        query = query.eq('integration_type', integrationType);
      }

      const { data, error } = await query;
      if (error) throw error;
      setSyncLogs(data || []);
    } catch (error) {
      console.error('Error fetching sync logs:', error);
    }
  };

  const connectIntegration = async (
    integrationType: string,
    accessToken: string,
    refreshToken?: string,
    expiresAt?: string,
    settings?: Record<string, any>
  ) => {
    if (!user) return false;

    try {
      // Note: Tokens are automatically encrypted by database trigger before storage
      // access_token and refresh_token are stored as encrypted values for security
      const { error } = await supabase
        .from('user_integrations')
        .upsert({
          user_id: user.id,
          integration_type: integrationType,
          is_connected: true,
          access_token: accessToken, // Auto-encrypted by trigger
          refresh_token: refreshToken, // Auto-encrypted by trigger
          token_expires_at: expiresAt,
          integration_settings: settings || {},
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `${integrationType} connected successfully`,
      });

      await fetchIntegrations();
      return true;
    } catch (error) {
      console.error('Error connecting integration:', error);
      toast({
        title: "Error",
        description: `Failed to connect ${integrationType}`,
        variant: "destructive",
      });
      return false;
    }
  };

  const disconnectIntegration = async (integrationType: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_integrations')
        .update({
          is_connected: false,
          access_token: null,
          refresh_token: null,
          token_expires_at: null,
        })
        .eq('user_id', user.id)
        .eq('integration_type', integrationType);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${integrationType} disconnected successfully`,
      });

      await fetchIntegrations();
      return true;
    } catch (error) {
      console.error('Error disconnecting integration:', error);
      toast({
        title: "Error",
        description: `Failed to disconnect ${integrationType}`,
        variant: "destructive",
      });
      return false;
    }
  };

  const updateIntegrationSettings = async (
    integrationType: string,
    settings: Record<string, any>
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_integrations')
        .update({
          integration_settings: settings,
        })
        .eq('user_id', user.id)
        .eq('integration_type', integrationType);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Integration settings updated",
      });

      await fetchIntegrations();
      return true;
    } catch (error) {
      console.error('Error updating integration settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
      return false;
    }
  };

  const triggerSync = async (integrationType: string, syncType: 'import' | 'export' | 'bidirectional' = 'import') => {
    if (!user) return false;

    try {
      // Call edge function to trigger sync
      const { data, error } = await supabase.functions.invoke('sync-integration', {
        body: {
          integration_type: integrationType,
          sync_type: syncType,
        },
      });

      if (error) throw error;

      toast({
        title: "Sync Started",
        description: `${integrationType} sync has been initiated`,
      });

      await fetchSyncLogs(integrationType);
      return true;
    } catch (error) {
      console.error('Error triggering sync:', error);
      toast({
        title: "Error",
        description: "Failed to start sync",
        variant: "destructive",
      });
      return false;
    }
  };

  const getIntegration = (integrationType: string) => {
    return integrations.find(i => i.integration_type === integrationType);
  };

  const isConnected = (integrationType: string) => {
    const integration = getIntegration(integrationType);
    return integration?.is_connected || false;
  };

  useEffect(() => {
    if (user) {
      fetchIntegrations();
      fetchSyncLogs();
    }
  }, [user]);

  return {
    integrations,
    syncLogs,
    isLoading,
    connectIntegration,
    disconnectIntegration,
    updateIntegrationSettings,
    triggerSync,
    getIntegration,
    isConnected,
    fetchIntegrations,
    fetchSyncLogs,
  };
};