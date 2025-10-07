import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthOptimized } from './useAuthOptimized';
import { toast } from '@/hooks/use-toast';

export interface PrivacySettings {
  id?: string;
  user_id?: string;
  profile_visibility: 'public' | 'friends' | 'private';
  allow_friend_requests: 'everyone' | 'friends_of_friends' | 'nobody';
  show_online_status: boolean;
  show_activity: boolean;
  show_habits: boolean;
}

const defaultSettings: PrivacySettings = {
  profile_visibility: 'friends',
  allow_friend_requests: 'everyone',
  show_online_status: true,
  show_activity: true,
  show_habits: true,
};

export const usePrivacySettings = () => {
  const { user } = useAuthOptimized();
  const [settings, setSettings] = useState<PrivacySettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('privacy_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings(data);
      } else {
        // Create default settings for new users
        const { data: newSettings, error: createError } = await supabase
          .from('privacy_settings')
          .insert({
            user_id: user.id,
            ...defaultSettings,
          })
          .select()
          .single();

        if (createError) throw createError;
        setSettings(newSettings);
      }
    } catch (error: any) {
      console.error('Error fetching privacy settings:', error);
      toast({
        title: "Error",
        description: "Failed to load privacy settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<PrivacySettings>) => {
    if (!user) return { success: false };

    try {
      setSaving(true);

      const { error } = await supabase
        .from('privacy_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          ...updates,
        });

      if (error) throw error;

      setSettings({ ...settings, ...updates });

      toast({
        title: "Settings Updated",
        description: "Your privacy settings have been saved",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error updating privacy settings:', error);
      toast({
        title: "Error",
        description: "Failed to update privacy settings",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setSaving(false);
    }
  };

  const canSendFriendRequest = async (targetUserId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('can_send_friend_request', {
        target_user_id: targetUserId,
      });

      if (error) throw error;
      return data || false;
    } catch (error: any) {
      console.error('Error checking friend request permission:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user?.id]);

  return {
    settings,
    loading,
    saving,
    updateSettings,
    canSendFriendRequest,
    refreshSettings: fetchSettings,
  };
};