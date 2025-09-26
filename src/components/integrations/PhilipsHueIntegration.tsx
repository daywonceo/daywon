import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Palette, Zap, Settings, Sun, Moon, Timer } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

export const PhilipsHueIntegration: React.FC = () => {
  const { connectIntegration, disconnectIntegration, isConnected, triggerSync, getIntegration } = useIntegrations();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [bridgeIP, setBridgeIP] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [settings, setSettings] = useState({
    habitCompletionLights: true,
    workoutAmbience: true,
    sleepSchedule: true,
    motivationalColors: true,
    roomGroup: 'living_room',
    brightness: [80],
    colorTheme: 'energizing'
  });

  const connected = isConnected('philips_hue');
  const integration = getIntegration('philips_hue');

  const handleConnect = async () => {
    if (!bridgeIP.trim() || !apiKey.trim()) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both Bridge IP and API key",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      // In a real implementation, this would test the connection to Philips Hue Bridge
      const success = await connectIntegration(
        'philips_hue',
        apiKey.trim(),
        undefined,
        undefined,
        { ...settings, bridgeIP: bridgeIP.trim() }
      );

      if (success) {
        toast({
          title: "Success",
          description: "Philips Hue connected successfully! Your lights will now respond to your habits.",
        });
        setBridgeIP('');
        setApiKey('');
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to Philips Hue Bridge. Check your IP and API key.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    const success = await disconnectIntegration('philips_hue');
    if (success) {
      toast({
        title: "Disconnected",
        description: "Philips Hue has been disconnected.",
      });
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    const success = await triggerSync('philips_hue', 'export');
    if (success) {
      toast({
        title: "Sync Started",
        description: "Your lighting preferences are being updated.",
      });
    }
    setIsLoading(false);
  };

  const handleSettingToggle = (setting: keyof typeof settings) => {
    if (['roomGroup', 'brightness', 'colorTheme'].includes(setting)) return;
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
            <Lightbulb className="w-3 h-3" />
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
              {isLoading ? 'Syncing...' : 'Update Lights'}
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
                  <DialogTitle>Philips Hue Settings</DialogTitle>
                  <DialogDescription>
                    Configure how your lights respond to habit activities and achievements
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Lighting Automation</div>
                    {Object.entries({
                      habitCompletionLights: 'Celebrate habit completion',
                      workoutAmbience: 'Workout lighting scenes',
                      sleepSchedule: 'Sleep schedule automation',
                      motivationalColors: 'Motivational color themes'
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
                      <Label>Room/Group</Label>
                      <Select
                        value={settings.roomGroup}
                        onValueChange={(value) => setSettings(prev => ({ 
                          ...prev, 
                          roomGroup: value 
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="living_room">Living Room</SelectItem>
                          <SelectItem value="bedroom">Bedroom</SelectItem>
                          <SelectItem value="office">Office</SelectItem>
                          <SelectItem value="all">All Lights</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Default Brightness: {settings.brightness[0]}%</Label>
                      <Slider
                        value={settings.brightness}
                        onValueChange={(value) => setSettings(prev => ({ 
                          ...prev, 
                          brightness: value 
                        }))}
                        max={100}
                        min={10}
                        step={10}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Color Theme</Label>
                      <Select
                        value={settings.colorTheme}
                        onValueChange={(value) => setSettings(prev => ({ 
                          ...prev, 
                          colorTheme: value 
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="energizing">Energizing (Blue/White)</SelectItem>
                          <SelectItem value="relaxing">Relaxing (Warm/Orange)</SelectItem>
                          <SelectItem value="focus">Focus (Cool White)</SelectItem>
                          <SelectItem value="celebration">Celebration (Rainbow)</SelectItem>
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
          <Palette className="w-3 h-3" />
          Bridge: {integration?.integration_settings?.bridgeIP || 'Unknown'}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sun className="w-3 h-3" />
          Theme: {integration?.integration_settings?.colorTheme || 'Energizing'}
        </div>
        
        <Button
          size="sm"
          variant="destructive"
          onClick={handleDisconnect}
          className="w-full"
        >
          Disconnect Philips Hue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        Connect Philips Hue to create immersive lighting that responds to your habit achievements
      </div>
      
      <div className="space-y-2">
        <div className="text-xs font-medium">Smart lighting features:</div>
        <div className="flex flex-wrap gap-1">
          {[
            { icon: Lightbulb, label: 'Celebrations' },
            { icon: Timer, label: 'Schedules' },
            { icon: Palette, label: 'Themes' }
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
          <Label htmlFor="bridge-ip" className="text-xs">Hue Bridge IP Address</Label>
          <Input
            id="bridge-ip"
            placeholder="192.168.1.100"
            value={bridgeIP}
            onChange={(e) => setBridgeIP(e.target.value)}
            className="text-xs"
          />
          <div className="text-xs text-muted-foreground">
            Find in Hue app → Settings → Hue Bridges → i → IP Address
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="hue-api-key" className="text-xs">API Key</Label>
          <Input
            id="hue-api-key"
            type="password"
            placeholder="Generated API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="text-xs"
          />
          <div className="text-xs text-muted-foreground">
            Press Bridge button, then generate key via Hue Developer API
          </div>
        </div>
      </div>
      
      <Button
        onClick={handleConnect}
        disabled={isConnecting || !bridgeIP.trim() || !apiKey.trim()}
        className="w-full gap-2"
      >
        <Lightbulb className="w-4 h-4" />
        {isConnecting ? 'Connecting...' : 'Connect Philips Hue'}
      </Button>
    </div>
  );
};