import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  email?: string; // Only available for current user's own profile
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  status: 'online' | 'away' | 'offline';
  last_active: string;
  created_at: string;
  username?: string | null;
}

export interface UpdateProfileData {
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  status?: 'online' | 'away' | 'offline';
  username?: string;
}

export const useSocialProfiles = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch current user's profile
  const fetchCurrentUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setCurrentUserProfile(data);
    } catch (error) {
      // Silently handle error - profile might not exist yet
    }
  };

  // Fetch connected friends' profiles (without email addresses)
  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_connected_profiles');

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load user profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update current user's profile
  const updateProfile = async (updates: UpdateProfileData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          last_active: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setCurrentUserProfile(data);
      // Update in profiles list if it exists
      setProfiles(prev => prev.map(p => p.id === data.id ? data : p));
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });

      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update user status
  const updateStatus = async (status: 'online' | 'away' | 'offline') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('profiles')
        .update({ 
          status,
          last_active: new Date().toISOString(),
        })
        .eq('id', user.id);

      // Update local state
      if (currentUserProfile) {
        const updated = { ...currentUserProfile, status, last_active: new Date().toISOString() };
        setCurrentUserProfile(updated);
        setProfiles(prev => prev.map(p => p.id === user.id ? updated : p));
      }
    } catch (error) {
      // Silently handle status update errors
    }
  };

  // Search profiles by display name only (no email search)
  const searchProfiles = async (query: string) => {
    try {
      const { data, error } = await supabase.rpc('search_connected_profiles', { 
        search_query: query 
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      return [];
    }
  };

  // Discover potential friends (very limited data for privacy)
  const discoverProfiles = async (query?: string) => {
    try {
      const { data, error } = await supabase.rpc('discover_potential_friends', { 
        search_query: query || null
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      return [];
    }
  };

  // Get profile by ID (limited to friends or own profile)
  const getProfileById = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, bio, status, last_active, created_at')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    fetchCurrentUserProfile();
    fetchProfiles();

    // Set user as online when component mounts
    updateStatus('online');

    // Set user as offline when they leave
    const handleBeforeUnload = () => {
      updateStatus('offline');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updateStatus('offline');
    };
  }, []);

  return {
    profiles,
    currentUserProfile,
    loading,
    fetchProfiles,
    updateProfile,
    updateStatus,
    searchProfiles,
    discoverProfiles,
    getProfileById,
    refetch: () => {
      fetchCurrentUserProfile();
      fetchProfiles();
    },
  };
};