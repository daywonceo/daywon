
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string, username?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithSpotify: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let initializing = true;
    
    // Set up auth state listener FIRST with performance optimization
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        // Only update state if session actually changed
        if (!initializing) {
          const newUser = session?.user ?? null;
          const currentUserId = user?.id;
          const currentAccessToken = session?.access_token;
          
          // Only update if there's a real change
          if (currentUserId !== newUser?.id || currentAccessToken !== session?.access_token) {
            setSession(session);
            setUser(newUser);
          }
        }
        
        setLoading(false);
        
        // Cache user creation date for habit calculations
        if (session?.user?.created_at) {
          localStorage.setItem('user_creation_date', session.user.created_at);
        }
        
        // Store Spotify access token if available
        if (session?.provider_token && session?.provider_refresh_token) {
          localStorage.setItem('spotify_access_token', session.provider_token);
          localStorage.setItem('spotify_refresh_token', session.provider_refresh_token);
        }
      }
    );

    // THEN check for existing session with deduplication
    const sessionKey = 'initial_session_fetch';
    const lastFetch = sessionStorage.getItem(sessionKey);
    const now = Date.now();
    
    if (!lastFetch || now - parseInt(lastFetch) > 300000) { // 5 minutes
      sessionStorage.setItem(sessionKey, now.toString());
      
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        initializing = false;
        
        // Cache user creation date for habit calculations
        if (session?.user?.created_at) {
          localStorage.setItem('user_creation_date', session.user.created_at);
        }
        
        // Store Spotify tokens if available
        if (session?.provider_token && session?.provider_refresh_token) {
          localStorage.setItem('spotify_access_token', session.provider_token);
          localStorage.setItem('spotify_refresh_token', session.provider_refresh_token);
        }
      }).catch(error => {
        console.error('Error fetching session:', error);
        if (mounted) {
          setLoading(false);
          initializing = false;
        }
      });
    } else {
      // Use cached session without API call
      setLoading(false);
      initializing = false;
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [])

  const signUp = async (email: string, password: string, displayName?: string, username?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName,
          username: username?.toLowerCase()
        }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
    return { error };
  };

  const signInWithSpotify = async () => {
    console.log('Attempting Spotify OAuth with redirect to:', `${window.location.origin}/spotify-success`);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'spotify',
        options: {
          redirectTo: `${window.location.origin}/spotify-success`,
          scopes: 'user-read-email user-read-private streaming playlist-modify-public playlist-modify-private'
        }
      });
      
      console.log('Spotify OAuth response:', { data, error });
      
      if (error) {
        console.error('Spotify OAuth error details:', {
          message: error.message,
          status: error.status
        });
      }
      
      return { error };
    } catch (err) {
      console.error('Spotify OAuth catch block error:', err);
      return { error: err };
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const signOut = async () => {
    // Clear Spotify tokens on logout
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithSpotify,
    resetPassword,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
