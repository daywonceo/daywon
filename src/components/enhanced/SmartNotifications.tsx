import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, 
  Brain, 
  Clock, 
  Smartphone, 
  Mail, 
  MessageSquare,
  Target,
  TrendingUp,
  Users,
  Settings
} from 'lucide-react';

interface NotificationRule {
  id: string;
  name: string;
  description: string;
  type: 'habit_reminder' | 'streak_milestone' | 'social_update' | 'insight' | 'goal_progress';
  enabled: boolean;
  channels: ('push' | 'email' | 'sms' | 'in_app')[];
  conditions: {
    timing?: string;
    frequency?: string;
    threshold?: number;
    priority?: 'low' | 'medium' | 'high';
  };
  aiOptimized: boolean;
}

interface SmartNotificationsProps {
  userId?: string;
}

export const SmartNotifications: React.FC<SmartNotificationsProps> = ({ userId }) => {
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [smartOptimization, setSmartOptimization] = useState(true);
  const [quietHours, setQuietHours] = useState({ start: 22, end: 7 });
  const [adaptiveTiming, setAdaptiveTiming] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading notification rules
    setTimeout(() => {
      const mockRules: NotificationRule[] = [
        {
          id: '1',
          name: 'Smart Habit Reminders',
          description: 'AI-powered reminders based on your optimal completion times',
          type: 'habit_reminder',
          enabled: true,
          channels: ['push', 'in_app'],
          conditions: {
            timing: 'optimal',
            frequency: 'adaptive',
            priority: 'high'
          },
          aiOptimized: true
        },
        {
          id: '2',
          name: 'Streak Celebrations',
          description: 'Celebrate milestones and encourage consistency',
          type: 'streak_milestone',
          enabled: true,
          channels: ['push', 'email'],
          conditions: {
            threshold: 7,
            priority: 'medium'
          },
          aiOptimized: false
        },
        {
          id: '3',
          name: 'Social Engagement',
          description: 'Updates on friend activities and team challenges',
          type: 'social_update',
          enabled: false,
          channels: ['push'],
          conditions: {
            frequency: 'daily',
            priority: 'low'
          },
          aiOptimized: true
        },
        {
          id: '4',
          name: 'AI Insights',
          description: 'Weekly insights and personalized recommendations',
          type: 'insight',
          enabled: true,
          channels: ['email', 'in_app'],
          conditions: {
            frequency: 'weekly',
            priority: 'medium'
          },
          aiOptimized: true
        },
        {
          id: '5',
          name: 'Goal Progress Updates',
          description: 'Track progress toward your monthly and yearly goals',
          type: 'goal_progress',
          enabled: true,
          channels: ['push', 'email'],
          conditions: {
            frequency: 'weekly',
            threshold: 25,
            priority: 'medium'
          },
          aiOptimized: true
        }
      ];
      
      setRules(mockRules);
      setLoading(false);
    }, 1000);
  }, []);

  const toggleRule = (ruleId: string) => {
    setRules(rules.map(rule => 
      rule.id === ruleId 
        ? { ...rule, enabled: !rule.enabled }
        : rule
    ));
  };

  const updateRuleChannels = (ruleId: string, channels: NotificationRule['channels']) => {
    setRules(rules.map(rule => 
      rule.id === ruleId 
        ? { ...rule, channels }
        : rule
    ));
  };

  const getTypeIcon = (type: NotificationRule['type']) => {
    switch (type) {
      case 'habit_reminder': return <Clock className="h-4 w-4" />;
      case 'streak_milestone': return <Target className="h-4 w-4" />;
      case 'social_update': return <Users className="h-4 w-4" />;
      case 'insight': return <Brain className="h-4 w-4" />;
      case 'goal_progress': return <TrendingUp className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'push': return <Smartphone className="h-3 w-3" />;
      case 'email': return <Mail className="h-3 w-3" />;
      case 'sms': return <MessageSquare className="h-3 w-3" />;
      case 'in_app': return <Bell className="h-3 w-3" />;
      default: return <Bell className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Smart Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">AI Optimization</div>
              <div className="text-sm text-muted-foreground">
                Let AI learn your preferences and optimize notification timing
              </div>
            </div>
            <Switch
              checked={smartOptimization}
              onCheckedChange={setSmartOptimization}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Adaptive Timing</div>
              <div className="text-sm text-muted-foreground">
                Automatically adjust reminder times based on your completion patterns
              </div>
            </div>
            <Switch
              checked={adaptiveTiming}
              onCheckedChange={setAdaptiveTiming}
            />
          </div>

          <div className="space-y-3">
            <div className="font-medium">Quiet Hours</div>
            <div className="text-sm text-muted-foreground mb-2">
              No notifications will be sent during these hours
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start</label>
                <Select value={quietHours.start.toString()} onValueChange={(value) => 
                  setQuietHours({ ...quietHours, start: parseInt(value) })
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i.toString().padStart(2, '0')}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">End</label>
                <Select value={quietHours.end.toString()} onValueChange={(value) => 
                  setQuietHours({ ...quietHours, end: parseInt(value) })
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i.toString().padStart(2, '0')}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {rules.map(rule => (
            <div key={rule.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {getTypeIcon(rule.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{rule.name}</h4>
                      {rule.aiOptimized && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Brain className="h-3 w-3" />
                          AI
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{rule.description}</p>
                  </div>
                </div>
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={() => toggleRule(rule.id)}
                />
              </div>

              {rule.enabled && (
                <div className="grid gap-4 pl-12">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Channels</label>
                    <div className="flex flex-wrap gap-2">
                      {['push', 'email', 'sms', 'in_app'].map(channel => (
                        <Button
                          key={channel}
                          variant={rule.channels.includes(channel as any) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            const newChannels = rule.channels.includes(channel as any)
                              ? rule.channels.filter(c => c !== channel)
                              : [...rule.channels, channel as any];
                            updateRuleChannels(rule.id, newChannels);
                          }}
                          className="flex items-center gap-1 capitalize"
                        >
                          {getChannelIcon(channel)}
                          {channel.replace('_', ' ')}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {rule.conditions.threshold && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Threshold: {rule.conditions.threshold}
                        {rule.type === 'streak_milestone' ? ' days' : 
                         rule.type === 'goal_progress' ? '%' : ''}
                      </label>
                      <Slider
                        value={[rule.conditions.threshold]}
                        onValueChange={([value]) => {
                          const updatedRules = rules.map(r => 
                            r.id === rule.id 
                              ? { ...r, conditions: { ...r.conditions, threshold: value } }
                              : r
                          );
                          setRules(updatedRules);
                        }}
                        max={rule.type === 'goal_progress' ? 100 : 30}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};