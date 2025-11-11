import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useToast } from '@/hooks/use-toast';
import { Activity, Target, Zap, Settings, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';

export const StravaIntegration: React.FC = () => {
  const { disconnectIntegration, isConnected, triggerSync, getIntegration } = useIntegrations();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    syncActivities: true,
    activityTypes: ['Run', 'Ride', 'Swim', 'Workout'],
    createHabitsFromActivities: true,
  });

  const connected = isConnected('strava');
  const integration = getIntegration('strava');

  const handleConnect = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to connect Strava",
          variant: "destructive",
        });
        return;
      }

      const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID || '138959';
      const redirectUri = `https://ncjbvdbkulnekwsjzicq.supabase.co/functions/v1/oauth-strava-callback`;
      
      // Create state parameter with user ID
      const state = btoa(JSON.stringify({ userId: user.id }));
      
      const authUrl = `https://www.strava.com/oauth/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `approval_prompt=auto&` +
        `scope=read,activity:read_all&` +
        `state=${state}`;

      window.location.href = authUrl;
    } catch (error) {
      console.error('Strava connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Unable to connect to Strava. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async () => {
    const success = await disconnectIntegration('strava');
    if (success) {
      toast({
        title: "Disconnected",
        description: "Strava has been disconnected.",
      });
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    const success = await triggerSync('strava', 'import');
    if (success) {
      toast({
        title: "Sync Started",
        description: "Your Strava activities are being synced.",
      });
    }
    setIsLoading(false);
  };

  const handleSettingToggle = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  if (connected) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Connected
          </Badge>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSync}
              disabled={isLoading}
              className="gap-1"
            >
              <Zap className="w-3 h-3" />
              {isLoading ? 'Syncing...' : 'Sync Now'}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1">
                  <Settings className="w-3 h-3" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Strava Settings</DialogTitle>
                  <DialogDescription>
                    Configure how Strava activities are synchronized
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Activity Sync</div>
                    {Object.entries({
                      syncActivities: 'Sync completed activities',
                      createHabitsFromActivities: 'Auto-create habits from activities',
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label>{label}</Label>
                        <Button
                          size="sm"
                          variant={settings[key as keyof typeof settings] ? "default" : "outline"}
                          onClick={() => handleSettingToggle(key as keyof typeof settings)}
                        >
                          {settings[key as keyof typeof settings] ? 'Enabled' : 'Disabled'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Target className="w-3 h-3" />
          Last sync: {integration?.last_sync_at ? 
            new Date(integration.last_sync_at).toLocaleDateString() : 
            'Never'
          }
        </div>
        
        {integration?.integration_settings?.athlete && (
          <div className="text-xs text-muted-foreground">
            Athlete: {integration.integration_settings.athlete.firstname} {integration.integration_settings.athlete.lastname}
          </div>
        )}
        
        <Button
          size="sm"
          variant="destructive"
          onClick={handleDisconnect}
          className="w-full"
        >
          Disconnect Strava
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        Connect Strava to automatically track your runs, rides, and other activities as habits
      </div>
      
      <div className="space-y-2">
        <div className="text-xs font-medium">What we'll sync:</div>
        <div className="flex flex-wrap gap-1">
          {[
            { icon: Activity, label: 'Activities' },
            { icon: Target, label: 'Stats' },
            { icon: CheckCircle2, label: 'Achievements' }
          ].map(({ icon: Icon, label }) => (
            <Badge key={label} variant="secondary" className="gap-1 text-xs">
              <Icon className="w-3 h-3" />
              {label}
            </Badge>
          ))}
        </div>
      </div>
      
      <Button
        onClick={handleConnect}
        className="w-full gap-2"
      >
        <Activity className="w-4 h-4" />
        Connect with Strava
      </Button>
    </div>
  );
};
