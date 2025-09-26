import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useToast } from '@/hooks/use-toast';
import { Utensils, Target, Zap, Settings, ChefHat } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const MyFitnessPalIntegration: React.FC = () => {
  const { connectIntegration, disconnectIntegration, isConnected, triggerSync, getIntegration } = useIntegrations();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [settings, setSettings] = useState({
    syncNutrition: true,
    syncWater: true,
    syncWeight: true,
    autoCompleteNutritionHabits: true,
    calorieGoalSync: true
  });

  const connected = isConnected('myfitnesspal');
  const integration = getIntegration('myfitnesspal');

  const handleConnect = async () => {
    if (!credentials.username || !credentials.password) {
      toast({
        title: "Missing Credentials",
        description: "Please enter your MyFitnessPal username and password",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      // In a real implementation, this would authenticate with MyFitnessPal API
      const success = await connectIntegration(
        'myfitnesspal',
        btoa(`${credentials.username}:${credentials.password}`), // Base64 encoded credentials
        undefined,
        undefined,
        { ...settings, username: credentials.username }
      );

      if (success) {
        toast({
          title: "Success",
          description: "MyFitnessPal connected successfully! Your nutrition data will now sync.",
        });
        setCredentials({ username: '', password: '' });
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to MyFitnessPal. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    const success = await disconnectIntegration('myfitnesspal');
    if (success) {
      toast({
        title: "Disconnected",
        description: "MyFitnessPal has been disconnected.",
      });
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    const success = await triggerSync('myfitnesspal', 'import');
    if (success) {
      toast({
        title: "Sync Started",
        description: "Your MyFitnessPal nutrition data is being synced.",
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
            <Utensils className="w-3 h-3" />
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
                  <DialogTitle>MyFitnessPal Settings</DialogTitle>
                  <DialogDescription>
                    Configure which nutrition data to sync and habit automation
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {Object.entries({
                    syncNutrition: 'Food & Calorie Logging',
                    syncWater: 'Water Intake',
                    syncWeight: 'Weight Tracking',
                    calorieGoalSync: 'Daily Calorie Goals',
                    autoCompleteNutritionHabits: 'Auto-complete nutrition habits'
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
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ChefHat className="w-3 h-3" />
          User: {integration?.integration_settings?.username || 'Unknown'}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Target className="w-3 h-3" />
          Last sync: {integration?.last_sync_at ? 
            new Date(integration.last_sync_at).toLocaleDateString() : 
            'Never'
          }
        </div>
        
        <Button
          size="sm"
          variant="destructive"
          onClick={handleDisconnect}
          className="w-full"
        >
          Disconnect MyFitnessPal
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        Connect to automatically track nutrition, water intake, and food logging habits
      </div>
      
      <div className="space-y-2">
        <div className="text-xs font-medium">What we'll sync:</div>
        <div className="flex flex-wrap gap-1">
          {[
            { icon: Utensils, label: 'Food Logs' },
            { icon: Target, label: 'Calories' },
            { icon: ChefHat, label: 'Nutrition' }
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
          <Label htmlFor="mfp-username" className="text-xs">MyFitnessPal Username</Label>
          <Input
            id="mfp-username"
            type="text"
            placeholder="Your username"
            value={credentials.username}
            onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
            className="text-xs"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="mfp-password" className="text-xs">MyFitnessPal Password</Label>
          <Input
            id="mfp-password"
            type="password"
            placeholder="Your password"
            value={credentials.password}
            onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
            className="text-xs"
          />
        </div>
      </div>
      
      <Button
        onClick={handleConnect}
        disabled={isConnecting || !credentials.username || !credentials.password}
        className="w-full gap-2"
      >
        <Utensils className="w-4 h-4" />
        {isConnecting ? 'Connecting...' : 'Connect MyFitnessPal'}
      </Button>
    </div>
  );
};