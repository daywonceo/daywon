import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useToast } from '@/hooks/use-toast';
import { Brain, Heart, Zap, Settings, Moon, Smile, Waves } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const HeadspaceIntegration: React.FC = () => {
  const { connectIntegration, disconnectIntegration, isConnected, triggerSync, getIntegration } = useIntegrations();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [settings, setSettings] = useState({
    trackMeditation: true,
    trackSleep: true,
    trackMindfulness: true,
    autoCompleteMeditationHabits: true,
    autoCompleteSleepHabits: true,
    dailyMeditationGoal: 10, // minutes
    preferredMeditationType: 'mindfulness'
  });

  const connected = isConnected('headspace');
  const integration = getIntegration('headspace');

  const handleConnect = async () => {
    if (!credentials.email || !credentials.password) {
      toast({
        title: "Missing Credentials",
        description: "Please enter your Headspace email and password",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      // In a real implementation, this would authenticate with Headspace API
      const success = await connectIntegration(
        'headspace',
        btoa(`${credentials.email}:${credentials.password}`), // Base64 encoded credentials
        undefined,
        undefined,
        { ...settings, email: credentials.email }
      );

      if (success) {
        toast({
          title: "Success",
          description: "Headspace connected successfully! Your mindfulness and sleep data will now sync.",
        });
        setCredentials({ email: '', password: '' });
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to Headspace. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    const success = await disconnectIntegration('headspace');
    if (success) {
      toast({
        title: "Disconnected",
        description: "Headspace has been disconnected.",
      });
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    const success = await triggerSync('headspace', 'import');
    if (success) {
      toast({
        title: "Sync Started",
        description: "Your Headspace meditation and sleep data is being synced.",
      });
    }
    setIsLoading(false);
  };

  const handleSettingToggle = (setting: keyof typeof settings) => {
    if (setting === 'dailyMeditationGoal' || setting === 'preferredMeditationType') return;
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
            <Brain className="w-3 h-3" />
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
                  <DialogTitle>Headspace Settings</DialogTitle>
                  <DialogDescription>
                    Configure mindfulness tracking and habit automation
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Activity Tracking</div>
                    {Object.entries({
                      trackMeditation: 'Track meditation sessions',
                      trackSleep: 'Track sleep stories & sounds',
                      trackMindfulness: 'Track mindfulness exercises',
                      autoCompleteMeditationHabits: 'Auto-complete meditation habits',
                      autoCompleteSleepHabits: 'Auto-complete sleep habits'
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
                    <div className="space-y-2">
                      <Label htmlFor="meditation-goal">Daily Meditation Goal (minutes)</Label>
                      <Input
                        id="meditation-goal"
                        type="number"
                        min="1"
                        max="120"
                        value={settings.dailyMeditationGoal}
                        onChange={(e) => setSettings(prev => ({ 
                          ...prev, 
                          dailyMeditationGoal: parseInt(e.target.value) || 10 
                        }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Preferred Meditation Type</Label>
                      <Select
                        value={settings.preferredMeditationType}
                        onValueChange={(value) => setSettings(prev => ({ 
                          ...prev, 
                          preferredMeditationType: value 
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mindfulness">Mindfulness</SelectItem>
                          <SelectItem value="sleep">Sleep</SelectItem>
                          <SelectItem value="focus">Focus</SelectItem>
                          <SelectItem value="movement">Movement</SelectItem>
                          <SelectItem value="all">All Types</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Smile className="w-3 h-3" />
          User: {integration?.integration_settings?.email || 'Unknown'}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Waves className="w-3 h-3" />
          Last sync: {integration?.last_sync_at ? 
            new Date(integration.last_sync_at).toLocaleDateString() : 
            'Never'
          }
        </div>
        
        <div className="text-xs text-muted-foreground">
          Daily goal: {integration?.integration_settings?.dailyMeditationGoal || 10} minutes meditation
        </div>
        
        <Button
          size="sm"
          variant="destructive"
          onClick={handleDisconnect}
          className="w-full"
        >
          Disconnect Headspace
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        Connect Headspace to automatically track meditation, mindfulness, and sleep wellness habits
      </div>
      
      <div className="space-y-2">
        <div className="text-xs font-medium">What we'll sync:</div>
        <div className="flex flex-wrap gap-1">
          {[
            { icon: Brain, label: 'Meditation' },
            { icon: Heart, label: 'Mindfulness' },
            { icon: Moon, label: 'Sleep' }
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
          <Label htmlFor="headspace-email" className="text-xs">Headspace Email</Label>
          <Input
            id="headspace-email"
            type="email"
            placeholder="Your email address"
            value={credentials.email}
            onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
            className="text-xs"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="headspace-password" className="text-xs">Headspace Password</Label>
          <Input
            id="headspace-password"
            type="password"
            placeholder="Your password"
            value={credentials.password}
            onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
            className="text-xs"
          />
        </div>
      </div>
      
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Heart className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-green-800 dark:text-green-200">
            <div className="font-medium">Mental Wellness Sync</div>
            <div>Your meditation sessions and mindfulness activities will automatically complete your wellness habits.</div>
          </div>
        </div>
      </div>
      
      <Button
        onClick={handleConnect}
        disabled={isConnecting || !credentials.email || !credentials.password}
        className="w-full gap-2"
      >
        <Brain className="w-4 h-4" />
        {isConnecting ? 'Connecting...' : 'Connect Headspace'}
      </Button>
    </div>
  );
};