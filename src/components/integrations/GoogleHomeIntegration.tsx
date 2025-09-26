import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useToast } from '@/hooks/use-toast';
import { Home, Thermometer, Zap, Settings, Mic, Shield, Volume2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const GoogleHomeIntegration: React.FC = () => {
  const { connectIntegration, disconnectIntegration, isConnected, triggerSync, getIntegration } = useIntegrations();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [credentials, setCredentials] = useState({
    email: '',
    appPassword: ''
  });
  const [settings, setSettings] = useState({
    voiceAnnouncements: true,
    thermostatControl: true,
    routineAutomation: true,
    habitReminders: true,
    celebrationSounds: true,
    deviceGroup: 'all_devices',
    announcementVolume: 'medium'
  });

  const connected = isConnected('google_home');
  const integration = getIntegration('google_home');

  const handleConnect = async () => {
    if (!credentials.email || !credentials.appPassword) {
      toast({
        title: "Missing Credentials",
        description: "Please enter your Google account email and app password",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      // In a real implementation, this would authenticate with Google Assistant/Home API
      const success = await connectIntegration(
        'google_home',
        btoa(`${credentials.email}:${credentials.appPassword}`),
        undefined,
        undefined,
        { ...settings, email: credentials.email }
      );

      if (success) {
        toast({
          title: "Success",
          description: "Google Home connected successfully! Your smart home will now respond to your habits.",
        });
        setCredentials({ email: '', appPassword: '' });
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to Google Home. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    const success = await disconnectIntegration('google_home');
    if (success) {
      toast({
        title: "Disconnected",
        description: "Google Home has been disconnected.",
      });
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    const success = await triggerSync('google_home', 'export');
    if (success) {
      toast({
        title: "Sync Started",
        description: "Your smart home routines are being updated.",
      });
    }
    setIsLoading(false);
  };

  const handleSettingToggle = (setting: keyof typeof settings) => {
    if (['deviceGroup', 'announcementVolume'].includes(setting)) return;
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
            <Home className="w-3 h-3" />
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
              {isLoading ? 'Syncing...' : 'Update Routines'}
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
                  <DialogTitle>Google Home Settings</DialogTitle>
                  <DialogDescription>
                    Configure how your smart home responds to habit activities and achievements
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Smart Home Features</div>
                    {Object.entries({
                      voiceAnnouncements: 'Voice announcements for milestones',
                      thermostatControl: 'Thermostat automation',
                      routineAutomation: 'Custom routine triggers',
                      habitReminders: 'Voice reminders for habits',
                      celebrationSounds: 'Celebration sounds for achievements'
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
                      <Label>Device Group</Label>
                      <Select
                        value={settings.deviceGroup}
                        onValueChange={(value) => setSettings(prev => ({ 
                          ...prev, 
                          deviceGroup: value 
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all_devices">All Devices</SelectItem>
                          <SelectItem value="living_room">Living Room</SelectItem>
                          <SelectItem value="bedroom">Bedroom</SelectItem>
                          <SelectItem value="kitchen">Kitchen</SelectItem>
                          <SelectItem value="office">Office</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Announcement Volume</Label>
                      <Select
                        value={settings.announcementVolume}
                        onValueChange={(value) => setSettings(prev => ({ 
                          ...prev, 
                          announcementVolume: value 
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
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
          <Mic className="w-3 h-3" />
          Account: {integration?.integration_settings?.email || 'Unknown'}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Volume2 className="w-3 h-3" />
          Volume: {integration?.integration_settings?.announcementVolume || 'Medium'}
        </div>
        
        <Button
          size="sm"
          variant="destructive"
          onClick={handleDisconnect}
          className="w-full"
        >
          Disconnect Google Home
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        Connect Google Home to automate your smart home based on habit achievements and schedules
      </div>
      
      <div className="space-y-2">
        <div className="text-xs font-medium">Smart home features:</div>
        <div className="flex flex-wrap gap-1">
          {[
            { icon: Mic, label: 'Voice' },
            { icon: Thermometer, label: 'Climate' },
            { icon: Volume2, label: 'Audio' }
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
          <Label htmlFor="google-email" className="text-xs">Google Account Email</Label>
          <Input
            id="google-email"
            type="email"
            placeholder="your.email@gmail.com"
            value={credentials.email}
            onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
            className="text-xs"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="google-app-password" className="text-xs">App Password</Label>
          <Input
            id="google-app-password"
            type="password"
            placeholder="16-character app password"
            value={credentials.appPassword}
            onChange={(e) => setCredentials(prev => ({ ...prev, appPassword: e.target.value }))}
            className="text-xs"
          />
          <div className="text-xs text-muted-foreground">
            Generate at Google Account → Security → 2-Step Verification → App passwords
          </div>
        </div>
      </div>
      
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-green-800 dark:text-green-200">
            <div className="font-medium">Smart Home Automation</div>
            <div>Your Google Home devices will celebrate your achievements and help maintain your habit schedules.</div>
          </div>
        </div>
      </div>
      
      <Button
        onClick={handleConnect}
        disabled={isConnecting || !credentials.email || !credentials.appPassword}
        className="w-full gap-2"
      >
        <Home className="w-4 h-4" />
        {isConnecting ? 'Connecting...' : 'Connect Google Home'}
      </Button>
    </div>
  );
};