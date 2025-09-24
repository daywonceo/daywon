import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useIntegrations } from '@/hooks/useIntegrations';
import { Zap, ExternalLink, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const ZapierIntegration: React.FC = () => {
  const { isConnected, connectIntegration, disconnectIntegration, updateIntegrationSettings, getIntegration } = useIntegrations();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  
  const connected = isConnected('zapier');
  const integration = getIntegration('zapier');
  const settings = integration?.integration_settings || {};

  const handleConnect = async () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Zapier webhook URL",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      await connectIntegration('zapier', webhookUrl, undefined, undefined, {
        webhookUrl: webhookUrl,
        triggerOnHabitComplete: true,
        triggerOnStreakMilestone: true,
        triggerOnDailyGoalMet: false,
        customPayload: '{}',
      });
      setWebhookUrl('');
    } catch (error) {
      console.error('Zapier connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectIntegration('zapier');
  };

  const handleTestWebhook = async () => {
    if (!settings.webhookUrl) {
      toast({
        title: "Error",
        description: "No webhook URL configured",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(settings.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          test: true,
          message: "Test webhook from DayWon habit tracker",
          timestamp: new Date().toISOString(),
          user_id: "test_user",
          event_type: "test",
        }),
      });

      toast({
        title: "Test Sent",
        description: "Test webhook has been sent to Zapier. Check your Zap's history to confirm it was received.",
      });
    } catch (error) {
      console.error("Error testing webhook:", error);
      toast({
        title: "Test Sent",
        description: "Test request was sent. If you don't see it in Zapier, check your webhook URL.",
      });
    }
  };

  const handleSettingChange = (setting: string, value: boolean | string) => {
    updateIntegrationSettings('zapier', {
      ...settings,
      [setting]: value,
    });
  };

  const copyWebhookExample = () => {
    const example = `{
  "user_id": "{{user_id}}",
  "event_type": "{{event_type}}",
  "habit_name": "{{habit_name}}",
  "streak_count": "{{streak_count}}",
  "timestamp": "{{timestamp}}"
}`;
    navigator.clipboard.writeText(example);
    toast({
      title: "Copied",
      description: "Webhook payload example copied to clipboard",
    });
  };

  if (!connected) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="webhook-url" className="text-sm">
            Zapier Webhook URL
          </Label>
          <Input
            id="webhook-url"
            type="url"
            placeholder="https://hooks.zapier.com/hooks/catch/..."
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="h-8"
          />
        </div>
        
        <Button 
          onClick={handleConnect} 
          className="w-full"
          variant="default"
          disabled={isConnecting || !webhookUrl.trim()}
        >
          <Zap className="w-4 h-4 mr-2" />
          {isConnecting ? 'Connecting...' : 'Connect Zapier'}
        </Button>
        
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Create a Zap with a "Webhooks by Zapier" trigger to get your webhook URL
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://zapier.com/apps/webhook/integrations', '_blank')}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Create Zap
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-green-600">Connected</span>
        <div className="flex gap-2">
          <Button 
            onClick={handleTestWebhook} 
            variant="outline" 
            size="sm"
          >
            Test
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
          <Label htmlFor="trigger-habit-complete" className="text-sm">
            Trigger on Habit Complete
          </Label>
          <Switch
            id="trigger-habit-complete"
            checked={settings.triggerOnHabitComplete !== false}
            onCheckedChange={(checked) => handleSettingChange('triggerOnHabitComplete', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="trigger-streak-milestone" className="text-sm">
            Trigger on Streak Milestones
          </Label>
          <Switch
            id="trigger-streak-milestone"
            checked={settings.triggerOnStreakMilestone !== false}
            onCheckedChange={(checked) => handleSettingChange('triggerOnStreakMilestone', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="trigger-daily-goal" className="text-sm">
            Trigger on Daily Goal Met
          </Label>
          <Switch
            id="trigger-daily-goal"
            checked={settings.triggerOnDailyGoalMet === true}
            onCheckedChange={(checked) => handleSettingChange('triggerOnDailyGoalMet', checked)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="custom-payload" className="text-sm">
              Custom Payload (JSON)
            </Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyWebhookExample}
              className="h-6 px-2"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
          <Textarea
            id="custom-payload"
            placeholder='{"custom_field": "value"}'
            value={settings.customPayload || '{}'}
            onChange={(e) => handleSettingChange('customPayload', e.target.value)}
            className="h-20 text-xs font-mono"
          />
        </div>

        <div className="p-2 bg-muted rounded text-xs">
          <strong>Webhook URL:</strong>
          <div className="mt-1 break-all font-mono">{settings.webhookUrl}</div>
        </div>
      </div>

      <div className="pt-2 border-t">
        <p className="text-xs text-muted-foreground">
          Webhooks are triggered in real-time when events occur
        </p>
      </div>
    </div>
  );
};