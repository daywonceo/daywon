import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, 
  Clock, 
  Calendar, 
  Target, 
  Users, 
  Heart,
  Award,
  MessageSquare,
  Settings,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface NotificationPreferences {
  habit_reminders: boolean;
  streak_milestones: boolean;
  social_interactions: boolean;
  workout_reminders: boolean;
  weekly_summaries: boolean;
  friend_activities: boolean;
  challenge_updates: boolean;
  meal_planning: boolean;
  daily_reflection: boolean;
  achievement_unlocks: boolean;
}

interface NotificationSettings {
  enabled: boolean;
  preferences: NotificationPreferences;
  reminder_time: string;
  quiet_hours_start: string;
  quiet_hours_end: string;
  delivery_method: 'push' | 'email' | 'both';
  frequency: 'immediate' | 'batched' | 'digest';
}

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  entity_type: string;
  entity_id: string;
  actor_id: string;
}

export const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    preferences: {
      habit_reminders: true,
      streak_milestones: true,
      social_interactions: true,
      workout_reminders: true,
      weekly_summaries: true,
      friend_activities: false,
      challenge_updates: true,
      meal_planning: false,
      daily_reflection: true,
      achievement_unlocks: true,
    },
    reminder_time: '09:00',
    quiet_hours_start: '22:00',
    quiet_hours_end: '07:00',
    delivery_method: 'push',
    frequency: 'immediate',
  });
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
      loadSettings();
      checkNotificationPermission();
    }
  }, [user]);

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setHasPermission(Notification.permission === 'granted');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setHasPermission(permission === 'granted');
      
      if (permission === 'granted') {
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive important updates from DayWon.",
        });
      }
    }
  };

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadSettings = () => {
    const saved = localStorage.getItem(`notification_settings_${user?.id}`);
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem(`notification_settings_${user?.id}`, JSON.stringify(newSettings));
    
    toast({
      title: "Settings Saved",
      description: "Your notification preferences have been updated.",
    });
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      
      toast({
        title: "All notifications marked as read",
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'habit_reminder':
      case 'streak_milestone':
        return <Target className="w-5 h-5 text-green-600" />;
      case 'workout_reminder':
        return <Heart className="w-5 h-5 text-red-600" />;
      case 'social_interaction':
      case 'friend_activity':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'achievement':
        return <Award className="w-5 h-5 text-yellow-600" />;
      case 'challenge_update':
        return <MessageSquare className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notification Center</h1>
          <p className="text-muted-foreground">
            Manage your notifications and stay updated with your progress
          </p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="text-sm">
            {unreadCount} unread
          </Badge>
        )}
      </div>

      {/* Notification Permission */}
      {!hasPermission && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-800">Enable Notifications</h3>
                  <p className="text-sm text-yellow-700">
                    Get timely reminders and updates to stay on track with your goals
                  </p>
                </div>
              </div>
              <Button onClick={requestNotificationPermission} size="sm">
                Enable
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Notifications List */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Notifications</CardTitle>
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" onClick={markAllAsRead}>
                    Mark all read
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No notifications yet</p>
                  <p className="text-sm">You'll see updates and reminders here</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      notification.is_read ? 'bg-background' : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Settings Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Master Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications-enabled">Enable Notifications</Label>
                <Switch
                  id="notifications-enabled"
                  checked={settings.enabled}
                  onCheckedChange={(checked) =>
                    saveSettings({ ...settings, enabled: checked })
                  }
                />
              </div>

              {/* Delivery Method */}
              <div className="space-y-2">
                <Label>Delivery Method</Label>
                <Select
                  value={settings.delivery_method}
                  onValueChange={(value: 'push' | 'email' | 'both') =>
                    saveSettings({ ...settings, delivery_method: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="push">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        Push Notifications
                      </div>
                    </SelectItem>
                    <SelectItem value="email">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Only
                      </div>
                    </SelectItem>
                    <SelectItem value="both">Both Push & Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notification Types */}
              <div className="space-y-3">
                <Label>Notification Types</Label>
                {Object.entries(settings.preferences).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) =>
                        saveSettings({
                          ...settings,
                          preferences: { ...settings.preferences, [key]: checked }
                        })
                      }
                    />
                  </div>
                ))}
              </div>

              {/* Timing Settings */}
              <div className="space-y-3">
                <Label>Timing</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Daily Reminder</span>
                    <input
                      type="time"
                      value={settings.reminder_time}
                      onChange={(e) =>
                        saveSettings({ ...settings, reminder_time: e.target.value })
                      }
                      className="text-sm border rounded px-2 py-1"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Quiet Hours Start</span>
                    <input
                      type="time"
                      value={settings.quiet_hours_start}
                      onChange={(e) =>
                        saveSettings({ ...settings, quiet_hours_start: e.target.value })
                      }
                      className="text-sm border rounded px-2 py-1"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Quiet Hours End</span>
                    <input
                      type="time"
                      value={settings.quiet_hours_end}
                      onChange={(e) =>
                        saveSettings({ ...settings, quiet_hours_end: e.target.value })
                      }
                      className="text-sm border rounded px-2 py-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Volume2 className="w-4 h-4 mr-2" />
                Test Notification
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Summary
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Clock className="w-4 h-4 mr-2" />
                Snooze All (1h)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};