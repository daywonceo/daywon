import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useIntegrations } from '@/hooks/useIntegrations';
import { Activity, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const GoogleFitIntegration: React.FC = () => {
  const { isConnected, connectIntegration, disconnectIntegration, updateIntegrationSettings, getIntegration, triggerSync } = useIntegrations();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const connected = isConnected('google_fit');
  const integration = getIntegration('google_fit');
  const settings = integration?.integration_settings || {};

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Simulate OAuth flow - in real implementation, this would redirect to Google OAuth
      toast({
        title: "OAuth Required",
        description: "Google Fit integration requires OAuth setup in a production environment",
      });
      
      // For demo purposes, simulate connection
      await connectIntegration('google_fit', 'demo_token', undefined, undefined, {
        syncSteps: true,
        syncWorkouts: true,
        autoCompleteHabits: false,
        dailySyncTime: '08:00',
      });
    } catch (error) {
      console.error('Google Fit connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectIntegration('google_fit');
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await triggerSync('google_fit', 'import');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSettingChange = (setting: string, value: boolean | string) => {
    updateIntegrationSettings('google_fit', {
      ...settings,
      [setting]: value,
    });
  };

  if (!connected) {
    return (
      <div className="space-y-3">
        <Button 
          onClick={handleConnect} 
          className="w-full"
          variant="default"
          disabled={isConnecting}
        >
          <Activity className="w-4 h-4 mr-2" />
          {isConnecting ? 'Connecting...' : 'Connect Google Fit'}
        </Button>
        <p className="text-xs text-muted-foreground">
          Sync fitness data including steps, workouts, and health metrics
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-green-600">Connected</span>
        <div className="flex gap-2">
          <Button 
            onClick={handleSync} 
            variant="outline" 
            size="sm"
            disabled={isSyncing}
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync
          </Button>
          <Button 
            onClick={handleDisconnect} 
            variant="outline" 
            size="sm"
          >
            Disconnect
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="sync-steps" className="text-sm">
            Sync Steps Data
          </Label>
          <Switch
            id="sync-steps"
            checked={settings.syncSteps !== false}
            onCheckedChange={(checked) => handleSettingChange('syncSteps', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="sync-workouts" className="text-sm">
            Sync Workouts
          </Label>
          <Switch
            id="sync-workouts"
            checked={settings.syncWorkouts !== false}
            onCheckedChange={(checked) => handleSettingChange('syncWorkouts', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="auto-complete" className="text-sm">
            Auto-complete Habits
          </Label>
          <Switch
            id="auto-complete"
            checked={settings.autoCompleteHabits === true}
            onCheckedChange={(checked) => handleSettingChange('autoCompleteHabits', checked)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="daily-sync-time" className="text-sm">
            Daily Sync Time
          </Label>
          <Input
            id="daily-sync-time"
            type="time"
            value={settings.dailySyncTime || '08:00'}
            onChange={(e) => handleSettingChange('dailySyncTime', e.target.value)}
            className="h-8"
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