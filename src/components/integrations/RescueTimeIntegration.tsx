import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useToast } from '@/hooks/use-toast';
import { Clock, Monitor, Zap, Settings, AlertTriangle, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const RescueTimeIntegration: React.FC = () => {
  const { connectIntegration, disconnectIntegration, isConnected, triggerSync, getIntegration } = useIntegrations();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [settings, setSettings] = useState({
    trackProductiveTime: true,
    trackScreenTime: true,
    setFocusGoals: true,
    autoCompleteDigitalWellnessHabits: true,
    trackAppUsage: true,
    weeklyReports: true,
    dailyTimeGoals: 480 // 8 hours in minutes
  });

  const connected = isConnected('rescuetime');
  const integration = getIntegration('rescuetime');

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Missing API Key",
        description: "Please enter your RescueTime API key",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      // In a real implementation, this would validate the key with RescueTime API
      const success = await connectIntegration(
        'rescuetime',
        apiKey.trim(),
        undefined,
        undefined,
        settings
      );

      if (success) {
        toast({
          title: "Success",
          description: "RescueTime connected successfully! Your digital wellness tracking is now active.",
        });
        setApiKey('');
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to RescueTime. Please check your API key.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    const success = await disconnectIntegration('rescuetime');
    if (success) {
      toast({
        title: "Disconnected",
        description: "RescueTime has been disconnected.",
      });
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    const success = await triggerSync('rescuetime', 'import');
    if (success) {
      toast({
        title: "Sync Started",
        description: "Your RescueTime data is being synced.",
      });
    }
    setIsLoading(false);
  };

  const handleSettingToggle = (setting: keyof typeof settings) => {
    if (setting === 'dailyTimeGoals') return; // Don't toggle numeric settings
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
            <Clock className="w-3 h-3" />
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
                  <DialogTitle>RescueTime Settings</DialogTitle>
                  <DialogDescription>
                    Configure digital wellness tracking and habit automation
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Tracking Features</div>
                    {Object.entries({
                      trackProductiveTime: 'Track productive time',
                      trackScreenTime: 'Monitor screen time',
                      trackAppUsage: 'Track application usage',
                      setFocusGoals: 'Set focus time goals',
                      autoCompleteDigitalWellnessHabits: 'Auto-complete digital wellness habits',
                      weeklyReports: 'Generate weekly reports'
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="daily-goals">Daily Productive Time Goal (hours)</Label>
                    <Input
                      id="daily-goals"
                      type="number"
                      min="1"
                      max="24"
                      value={settings.dailyTimeGoals / 60}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        dailyTimeGoals: parseInt(e.target.value) * 60 || 480 
                      }))}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <TrendingUp className="w-3 h-3" />
          Last sync: {integration?.last_sync_at ? 
            new Date(integration.last_sync_at).toLocaleDateString() : 
            'Never'
          }
        </div>
        
        <div className="text-xs text-muted-foreground">
          Daily goal: {(integration?.integration_settings?.dailyTimeGoals || 480) / 60} hours productive time
        </div>
        
        <Button
          size="sm"
          variant="destructive"
          onClick={handleDisconnect}
          className="w-full"
        >
          Disconnect RescueTime
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        Connect RescueTime to automatically track digital wellness and productivity habits
      </div>
      
      <div className="space-y-2">
        <div className="text-xs font-medium">What we'll track:</div>
        <div className="flex flex-wrap gap-1">
          {[
            { icon: Clock, label: 'Screen Time' },
            { icon: Monitor, label: 'App Usage' },
            { icon: TrendingUp, label: 'Productivity' }
          ].map(({ icon: Icon, label }) => (
            <Badge key={label} variant="secondary" className="gap-1 text-xs">
              <Icon className="w-3 h-3" />
              {label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="rescuetime-key" className="text-xs">RescueTime API Key</Label>
          <Input
            id="rescuetime-key"
            type="password"
            placeholder="Enter your API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="text-xs"
          />
          <div className="text-xs text-muted-foreground">
            Get your API key from RescueTime → My RescueTime → API Key Management
          </div>
        </div>
      </div>
      
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-800 dark:text-amber-200">
            <div className="font-medium">Privacy Note</div>
            <div>RescueTime tracks your computer usage. We only access aggregated productivity data, not specific websites or documents.</div>
          </div>
        </div>
      </div>
      
      <Button
        onClick={handleConnect}
        disabled={isConnecting || !apiKey.trim()}
        className="w-full gap-2"
      >
        <Clock className="w-4 h-4" />
        {isConnecting ? 'Connecting...' : 'Connect RescueTime'}
      </Button>
    </div>
  );
};