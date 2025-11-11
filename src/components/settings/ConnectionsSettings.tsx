import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { CheckSquare, Activity } from 'lucide-react';
import { ManageIntegrationDrawer } from './ManageIntegrationDrawer';

interface Integration {
  id: string;
  integration_type: string;
  integration_status: string;
  is_connected: boolean;
  connected_at: string | null;
  last_synced_at: string | null;
  integration_scopes?: string[];
}

interface ProviderConfig {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  scopeNote: string;
  color: string;
}

const providers: ProviderConfig[] = [
  {
    id: 'todoist',
    name: 'Todoist',
    icon: CheckSquare,
    scopeNote: 'Read completed tasks',
    color: 'hsl(var(--destructive))',
  },
  {
    id: 'strava',
    name: 'Strava',
    icon: Activity,
    scopeNote: 'Read activities',
    color: 'hsl(var(--chart-1))',
  },
];

export function ConnectionsSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [manageDrawerOpen, setManageDrawerOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<{ id: string; name: string } | null>(null);

  const fetchIntegrations = async () => {
    if (!user) return;

    try {
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

  useEffect(() => {
    fetchIntegrations();
  }, [user]);

  useEffect(() => {
    // Check for connection success/error in URL params
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const error = params.get('error');

    if (connected) {
      toast({
        title: 'Connection successful!',
        description: `Your ${connected} account has been connected.`,
      });
      // Clean up URL
      window.history.replaceState({}, '', '/settings/connections');
      fetchIntegrations();
    } else if (error) {
      toast({
        title: 'Connection failed',
        description: 'There was an error connecting your account. Please try again.',
        variant: 'destructive',
      });
      window.history.replaceState({}, '', '/settings/connections');
    }
  }, []);

  const getIntegration = (providerId: string): Integration | undefined => {
    return integrations.find(i => i.integration_type === providerId);
  };

  const getStatusInfo = (integration?: Integration) => {
    if (!integration || !integration.is_connected) {
      return {
        label: 'Not connected',
        variant: 'secondary' as const,
        icon: XCircle,
      };
    }

    if (integration.integration_status === 'needs_reauth') {
      return {
        label: 'Needs re-auth',
        variant: 'destructive' as const,
        icon: AlertCircle,
      };
    }

    if (integration.integration_status === 'connected') {
      return {
        label: 'Connected',
        variant: 'default' as const,
        icon: CheckCircle2,
      };
    }

    return {
      label: 'Unknown',
      variant: 'secondary' as const,
      icon: XCircle,
    };
  };

  const handleConnect = async (providerId: string) => {
    if (!user) return;

    setConnectingProvider(providerId);

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
      url.searchParams.set('provider', providerId);

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

    } catch (error) {
      console.error('Error initiating OAuth:', error);
      toast({
        title: 'Connection error',
        description: 'Failed to start connection process. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setConnectingProvider(null);
    }
  };

  const handleManage = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (provider) {
      setSelectedProvider({ id: provider.id, name: provider.name });
      setManageDrawerOpen(true);
    }
  };

  const handleReauthorize = () => {
    if (selectedProvider) {
      setManageDrawerOpen(false);
      handleConnect(selectedProvider.id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Connected Apps</h2>
        <p className="text-muted-foreground mt-1">
          Connect your favorite apps to automatically track habits
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {providers.map((provider) => {
          const integration = getIntegration(provider.id);
          const status = getStatusInfo(integration);
          const Icon = provider.icon;
          const StatusIcon = status.icon;
          const isConnected = integration?.is_connected;
          const isConnecting = connectingProvider === provider.id;

          return (
            <Card key={provider.id} className="relative overflow-hidden">
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: provider.color }}
              />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2.5 rounded-lg"
                      style={{ backgroundColor: `${provider.color}15` }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                      <CardDescription className="text-sm mt-0.5">
                        {provider.scopeNote}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={status.variant} className="flex items-center gap-1.5">
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
                  <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>
                    We only log new activity after you connect. No history is imported.
                  </span>
                </div>

                {isConnected && integration.connected_at && (
                  <div className="text-xs text-muted-foreground">
                    Connected {new Date(integration.connected_at).toLocaleDateString()}
                  </div>
                )}

                <Button
                  onClick={() => isConnected ? handleManage(provider.id) : handleConnect(provider.id)}
                  disabled={isConnecting}
                  className="w-full"
                  variant={isConnected ? 'outline' : 'default'}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : isConnected ? (
                    'Manage'
                  ) : (
                    'Connect'
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedProvider && (
        <ManageIntegrationDrawer
          open={manageDrawerOpen}
          onOpenChange={setManageDrawerOpen}
          providerId={selectedProvider.id}
          providerName={selectedProvider.name}
          integration={getIntegration(selectedProvider.id)}
          onReauthorize={handleReauthorize}
        />
      )}
    </div>
  );
}
