import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Users, Zap, Settings, Hash, Bell, Trophy } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const DiscordIntegration: React.FC = () => {
  const { connectIntegration, disconnectIntegration, isConnected, triggerSync, getIntegration } = useIntegrations();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [botToken, setBotToken] = useState('');
  const [settings, setSettings] = useState({
    shareHabitMilestones: true,
    shareStreaks: true,
    sendDailyReminders: true,
    communityFeatures: true,
    channelId: '',
    enableCommands: true,
    shareProgress: true
  });

  const connected = isConnected('discord');
  const integration = getIntegration('discord');

  const handleConnect = async () => {
    if (!botToken.trim()) {
      toast({
        title: "Missing Bot Token",
        description: "Please enter your Discord bot token",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      // In a real implementation, this would validate the bot token with Discord API
      const success = await connectIntegration(
        'discord',
        botToken.trim(),
        undefined,
        undefined,
        settings
      );

      if (success) {
        toast({
          title: "Success",
          description: "Discord connected successfully! Your habit milestones will now be shared with your community.",
        });
        setBotToken('');
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to Discord. Please check your bot token and permissions.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    const success = await disconnectIntegration('discord');
    if (success) {
      toast({
        title: "Disconnected",
        description: "Discord has been disconnected.",
      });
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    const success = await triggerSync('discord', 'export');
    if (success) {
      toast({
        title: "Sync Started",
        description: "Your recent achievements are being shared to Discord.",
      });
    }
    setIsLoading(false);
  };

  const handleSettingToggle = (setting: keyof typeof settings) => {
    if (setting === 'channelId') return;
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
            <MessageSquare className="w-3 h-3" />
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
              {isLoading ? 'Syncing...' : 'Share Progress'}
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
                  <DialogTitle>Discord Settings</DialogTitle>
                  <DialogDescription>
                    Configure what habit achievements to share with your Discord community
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Community Sharing</div>
                    {Object.entries({
                      shareHabitMilestones: 'Share habit milestones',
                      shareStreaks: 'Share streak achievements',
                      shareProgress: 'Share daily progress',
                      sendDailyReminders: 'Send daily reminders',
                      communityFeatures: 'Enable community challenges',
                      enableCommands: 'Enable bot commands'
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
                    <Label htmlFor="channel-id">Discord Channel ID (optional)</Label>
                    <Input
                      id="channel-id"
                      placeholder="Channel ID for habit updates"
                      value={settings.channelId}
                      onChange={(e) => setSettings(prev => ({ ...prev, channelId: e.target.value }))}
                    />
                    <div className="text-xs text-muted-foreground">
                      Right-click on a channel → Copy Channel ID
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Hash className="w-3 h-3" />
          Channel: {integration?.integration_settings?.channelId || 'Default channel'}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Trophy className="w-3 h-3" />
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
          Disconnect Discord
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        Connect Discord to share your habit achievements and milestones with your community
      </div>
      
      <div className="space-y-2">
        <div className="text-xs font-medium">Community features:</div>
        <div className="flex flex-wrap gap-1">
          {[
            { icon: Trophy, label: 'Milestones' },
            { icon: Users, label: 'Community' },
            { icon: Bell, label: 'Reminders' }
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
          <Label htmlFor="discord-token" className="text-xs">Discord Bot Token</Label>
          <Input
            id="discord-token"
            type="password"
            placeholder="Enter your bot token"
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
            className="text-xs"
          />
          <div className="text-xs text-muted-foreground">
            Create a bot at Discord Developer Portal → Applications → New Application → Bot
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Users className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-800 dark:text-blue-200">
            <div className="font-medium">Community Power</div>
            <div>Share your habit journey and celebrate milestones with your Discord community for extra motivation!</div>
          </div>
        </div>
      </div>
      
      <Button
        onClick={handleConnect}
        disabled={isConnecting || !botToken.trim()}
        className="w-full gap-2"
      >
        <MessageSquare className="w-4 h-4" />
        {isConnecting ? 'Connecting...' : 'Connect Discord'}
      </Button>
    </div>
  );
};