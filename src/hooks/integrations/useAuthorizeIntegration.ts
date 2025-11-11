import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useAuthorizeIntegration(provider: 'todoist' | 'strava') {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const authorize = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error('Not authenticated');
      }

      const projectRef = 'ncjbvdbkulnekwsjzicq';
      const url = new URL(
        `https://${projectRef}.supabase.co/functions/v1/integrations-authorize`
      );
      url.searchParams.set('provider', provider);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get authorization URL');
      }

      const { connectUrl } = await response.json();

      // Open OAuth URL in popup
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      window.open(
        connectUrl,
        'oauth',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
      );

      return { success: true };
    } catch (error) {
      console.error('Error authorizing integration:', error);
      toast({
        title: 'Connection error',
        description: 'Failed to start connection process. Please try again.',
        variant: 'destructive',
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    authorize,
    loading,
  };
}
