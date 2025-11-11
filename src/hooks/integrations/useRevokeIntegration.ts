import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useRevokeIntegration(provider: 'todoist' | 'strava') {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const revoke = async () => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('integrations-revoke', {
        body: { provider },
      });

      if (response.error) {
        throw response.error;
      }

      toast({
        title: 'Disconnected',
        description: `${provider.charAt(0).toUpperCase() + provider.slice(1)} has been disconnected`,
      });

      return { success: true };
    } catch (error) {
      console.error('Error revoking integration:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect integration',
        variant: 'destructive',
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    revoke,
    loading,
  };
}
