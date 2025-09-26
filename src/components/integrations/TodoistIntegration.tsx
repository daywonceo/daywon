import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useToast } from '@/hooks/use-toast';
import { CheckSquare, Target, Zap, Settings, Calendar, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const TodoistIntegration: React.FC = () => {
  const { connectIntegration, disconnectIntegration, isConnected, triggerSync, getIntegration } = useIntegrations();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [apiToken, setApiToken] = useState('');
  const [settings, setSettings] = useState({
    syncTasks: true,
    syncProjects: true,
    autoCompleteTaskHabits: true,
    createHabitTasks: true,
    projectFilter: '',
    completedTasksAsHabits: true
  });

  const connected = isConnected('todoist');
  const integration = getIntegration('todoist');

  const handleConnect = async () => {
    if (!apiToken.trim()) {
      toast({
        title: "Missing API Token",
        description: "Please enter your Todoist API token",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      // In a real implementation, this would validate the token with Todoist API
      const success = await connectIntegration(
        'todoist',
        apiToken.trim(),
        undefined,
        undefined,
        settings
      );

      if (success) {
        toast({
          title: "Success",
          description: "Todoist connected successfully! Your tasks will now sync with your habits.",
        });
        setApiToken('');
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to Todoist. Please check your API token.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    const success = await disconnectIntegration('todoist');
    if (success) {
      toast({
        title: "Disconnected",
        description: "Todoist has been disconnected.",
      });
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    const success = await triggerSync('todoist', 'bidirectional');
    if (success) {
      toast({
        title: "Sync Started",
        description: "Your Todoist tasks and habits are being synced.",
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
            <CheckSquare className="w-3 h-3" />
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
                  <DialogTitle>Todoist Settings</DialogTitle>
                  <DialogDescription>
                    Configure how Todoist tasks and habits are synchronized
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Data Sync</div>
                    {Object.entries({
                      syncTasks: 'Sync task completion',
                      syncProjects: 'Sync project organization',
                      autoCompleteTaskHabits: 'Auto-complete task-based habits',
                      createHabitTasks: 'Create Todoist tasks for habits',
                      completedTasksAsHabits: 'Track completed tasks as productivity habits'
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
                    <Label htmlFor="project-filter">Project Filter (optional)</Label>
                    <Input
                      id="project-filter"
                      placeholder="Filter by project name"
                      value={settings.projectFilter}
                      onChange={(e) => setSettings(prev => ({ ...prev, projectFilter: e.target.value }))}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Target className="w-3 h-3" />
          Last sync: {integration?.last_sync_at ? 
            new Date(integration.last_sync_at).toLocaleDateString() : 
            'Never'
          }
        </div>
        
        <div className="text-xs text-muted-foreground">
          Project filter: {integration?.integration_settings?.projectFilter || 'All projects'}
        </div>
        
        <Button
          size="sm"
          variant="destructive"
          onClick={handleDisconnect}
          className="w-full"
        >
          Disconnect Todoist
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        Connect Todoist to automatically sync tasks with your productivity habits
      </div>
      
      <div className="space-y-2">
        <div className="text-xs font-medium">What we'll sync:</div>
        <div className="flex flex-wrap gap-1">
          {[
            { icon: CheckSquare, label: 'Tasks' },
            { icon: Target, label: 'Goals' },
            { icon: Calendar, label: 'Projects' }
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
          <Label htmlFor="todoist-token" className="text-xs">Todoist API Token</Label>
          <Input
            id="todoist-token"
            type="password"
            placeholder="Enter your API token"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            className="text-xs"
          />
          <div className="text-xs text-muted-foreground">
            Get your token from Todoist Settings → Integrations → API token
          </div>
        </div>
      </div>
      
      <Button
        onClick={handleConnect}
        disabled={isConnecting || !apiToken.trim()}
        className="w-full gap-2"
      >
        <CheckSquare className="w-4 h-4" />
        {isConnecting ? 'Connecting...' : 'Connect Todoist'}
      </Button>
    </div>
  );
};