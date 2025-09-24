import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useAuth } from '@/contexts/AuthContext';
import { Music, RefreshCw, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const SpotifyIntegration: React.FC = () => {
  const { isConnected, disconnectIntegration, updateIntegrationSettings, getIntegration } = useIntegrations();
  const { signInWithSpotify } = useAuth();
  const connected = isConnected('spotify');
  const integration = getIntegration('spotify');

  const handleConnect = async () => {
    try {
      const { error } = await signInWithSpotify();
      if (error) {
        toast({
          title: "Connection Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Spotify connection error:', error);
      toast({
        title: "Error",
        description: "Failed to connect to Spotify",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = () => {
    disconnectIntegration('spotify');
  };

  const handleSettingChange = (setting: string, value: boolean) => {
    const currentSettings = integration?.integration_settings || {};
    updateIntegrationSettings('spotify', {
      ...currentSettings,
      [setting]: value,
    });
  };

  const settings = integration?.integration_settings || {};

  if (!connected) {
    return (
      <div className="space-y-3">
        <Button 
          onClick={handleConnect} 
          className="w-full"
          variant="default"
        >
          <Music className="w-4 h-4 mr-2" />
          Connect Spotify
        </Button>
        <p className="text-xs text-muted-foreground">
          Connect to get workout playlist recommendations and track music habits
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-green-600">Connected</span>
        <Button 
          onClick={handleDisconnect} 
          variant="outline" 
          size="sm"
        >
          Disconnect
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="playlist-recommendations" className="text-sm">
            Playlist Recommendations
          </Label>
          <Switch
            id="playlist-recommendations"
            checked={settings.playlistRecommendations !== false}
            onCheckedChange={(checked) => handleSettingChange('playlistRecommendations', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="auto-workout-music" className="text-sm">
            Auto Workout Music
          </Label>
          <Switch
            id="auto-workout-music"
            checked={settings.autoWorkoutMusic === true}
            onCheckedChange={(checked) => handleSettingChange('autoWorkoutMusic', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="track-listening-habits" className="text-sm">
            Track Listening Habits
          </Label>
          <Switch
            id="track-listening-habits"
            checked={settings.trackListeningHabits === true}
            onCheckedChange={(checked) => handleSettingChange('trackListeningHabits', checked)}
          />
        </div>
      </div>

      <div className="pt-2 border-t">
        <p className="text-xs text-muted-foreground">
          Last sync: {integration?.last_sync_at ? 
            new Date(integration.last_sync_at).toLocaleString() : 
            'Never'
          }
        </p>
      </div>
    </div>
  );
};