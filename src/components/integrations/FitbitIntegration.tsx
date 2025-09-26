import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useToast } from '@/hooks/use-toast';
import { Watch, Activity, Heart, Zap, Settings, Moon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export const FitbitIntegration: React.FC = () => {
  const { connectIntegration, disconnectIntegration, isConnected, triggerSync, getIntegration } = useIntegrations();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [settings, setSettings] = useState({
    syncSteps: true,
    syncHeartRate: true,
    syncSleep: true,
    syncWorkouts: true,
    syncWeight: true,
    autoCompleteStepGoals: true,
    autoCompleteSleepGoals: true,
    autoCompleteExerciseGoals: true
  });

  const connected = isConnected('fitbit');
  const integration = getIntegration('fitbit');

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // In a real implementation, this would redirect to Fitbit OAuth
      // For now, we'll simulate the OAuth flow
      const mockAuthUrl = 'https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=FITBIT_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&scope=activity+heartrate+location+nutrition+profile+settings+sleep+social+weight';
      
      // Simulate successful OAuth return
      const success = await connectIntegration(
        'fitbit',
        'mock_fitbit_access_token',
        'mock_fitbit_refresh_token',
        new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour from now
        settings
      );

      if (success) {
        toast({
          title: "Success",
          description: "Fitbit connected successfully! Your fitness data will now sync automatically.",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to Fitbit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    const success = await disconnectIntegration('fitbit');
    if (success) {
      toast({
        title: "Disconnected",
        description: "Fitbit has been disconnected.",
      });
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    const success = await triggerSync('fitbit', 'import');
    if (success) {
      toast({
        title: "Sync Started",
        description: "Your Fitbit data is being synced.",
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
            <Watch className="w-3 h-3" />
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
                  <DialogTitle>Fitbit Settings</DialogTitle>
                  <DialogDescription>
                    Configure which Fitbit data to sync and habit automation
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Data Sync</div>
                    {Object.entries({
                      syncSteps: 'Steps & Distance',
                      syncHeartRate: 'Heart Rate',
                      syncSleep: 'Sleep Analysis',
                      syncWorkouts: 'Exercise & Workouts',
                      syncWeight: 'Weight & BMI'
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
                  
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Habit Automation</div>
                    {Object.entries({
                      autoCompleteStepGoals: 'Auto-complete step goals',
                      autoCompleteSleepGoals: 'Auto-complete sleep goals',
                      autoCompleteExerciseGoals: 'Auto-complete exercise goals'
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
          <Activity className="w-3 h-3" />
          Last sync: {integration?.last_sync_at ? 
            new Date(integration.last_sync_at).toLocaleDateString() : 
            'Never'
          }
        </div>
        
        <div className="text-xs text-muted-foreground">
          Token expires: {integration?.token_expires_at ? 
            new Date(integration.token_expires_at).toLocaleDateString() : 
            'Unknown'
          }
        </div>
        
        <Button
          size="sm"
          variant="destructive"
          onClick={handleDisconnect}
          className="w-full"
        >
          Disconnect Fitbit
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        Connect your Fitbit to automatically track steps, workouts, heart rate, sleep, and weight
      </div>
      
      <div className="space-y-2">
        <div className="text-xs font-medium">Data we'll sync:</div>
        <div className="flex flex-wrap gap-1">
          {[
            { icon: Activity, label: 'Steps' },
            { icon: Heart, label: 'Heart Rate' },
            { icon: Moon, label: 'Sleep' },
            { icon: Zap, label: 'Exercise' }
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
        disabled={isConnecting}
        className="w-full gap-2"
      >
        <Watch className="w-4 h-4" />
        {isConnecting ? 'Connecting...' : 'Connect with Fitbit'}
      </Button>
      
      <div className="text-xs text-muted-foreground">
        You'll be redirected to Fitbit to authorize data access
      </div>
    </div>
  );
};