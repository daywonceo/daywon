import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIntegrations } from '@/hooks/useIntegrations';
import { Calendar, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const CalendarIntegration: React.FC = () => {
  const { isConnected, connectIntegration, disconnectIntegration, updateIntegrationSettings, getIntegration, triggerSync } = useIntegrations();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const connected = isConnected('calendar');
  const integration = getIntegration('calendar');
  const settings = integration?.integration_settings || {};

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Initiate Google OAuth flow with Calendar scope
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/calendar',
          redirectTo: `${window.location.origin}/integrations`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        toast({
          title: "Connection Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Redirecting to Google",
          description: "Please authorize calendar access",
        });
      }
    } catch (error) {
      console.error('Calendar connection error:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to Google Calendar",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectIntegration('calendar');
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await triggerSync('calendar', 'bidirectional');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSettingChange = (setting: string, value: boolean | string | number) => {
    updateIntegrationSettings('calendar', {
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
          <Calendar className="w-4 h-4 mr-2" />
          {isConnecting ? 'Connecting...' : 'Connect Google Calendar'}
        </Button>
        <p className="text-xs text-muted-foreground">
          Sync habits with your calendar and get smart reminders
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
          <Label htmlFor="sync-to-calendar" className="text-sm">
            Sync Habits to Calendar
          </Label>
          <Switch
            id="sync-to-calendar"
            checked={settings.syncToCalendar !== false}
            onCheckedChange={(checked) => handleSettingChange('syncToCalendar', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="create-reminders" className="text-sm">
            Create Habit Reminders
          </Label>
          <Switch
            id="create-reminders"
            checked={settings.createReminders !== false}
            onCheckedChange={(checked) => handleSettingChange('createReminders', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="sync-completions" className="text-sm">
            Sync Completions
          </Label>
          <Switch
            id="sync-completions"
            checked={settings.syncCompletions === true}
            onCheckedChange={(checked) => handleSettingChange('syncCompletions', checked)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="default-calendar" className="text-sm">
            Default Calendar
          </Label>
          <Select
            value={settings.defaultCalendar || 'primary'}
            onValueChange={(value) => handleSettingChange('defaultCalendar', value)}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select calendar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">Primary Calendar</SelectItem>
              <SelectItem value="habits">Habits Calendar</SelectItem>
              <SelectItem value="personal">Personal Calendar</SelectItem>
              <SelectItem value="work">Work Calendar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reminder-minutes" className="text-sm">
            Reminder Time (minutes before)
          </Label>
          <Select
            value={String(settings.reminderMinutes || 15)}
            onValueChange={(value) => handleSettingChange('reminderMinutes', parseInt(value))}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 minutes</SelectItem>
              <SelectItem value="10">10 minutes</SelectItem>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
            </SelectContent>
          </Select>
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