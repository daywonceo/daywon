import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useAuthErrorHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthError = (event: any) => {
      if (event.error?.message?.includes('refresh_token') || 
          event.error?.message?.includes('JWT') ||
          event.error?.message?.includes('invalid_token')) {
        
        console.warn('Authentication token issue detected:', event.error);
        
        // Show user-friendly error
        toast({
          title: "Session expired",
          description: "Please sign in again to continue",
          variant: "destructive",
          duration: 5000,
        });

        // Attempt to refresh the session
        supabase.auth.refreshSession().catch((refreshError) => {
          console.error('Failed to refresh session:', refreshError);
          // If refresh fails, redirect to login
          navigate('/login');
        });
      }
    };

    // Listen for auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
        }
      }
    );

    // Listen for network errors
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.message?.includes('Failed to fetch') && 
          event.reason?.stack?.includes('supabase')) {
        console.warn('Supabase network error detected');
        
        // Only show toast if it's a critical auth operation
        if (event.reason?.stack?.includes('token') || 
            event.reason?.stack?.includes('auth')) {
          toast({
            title: "Connection issue",
            description: "Trying to reconnect...",
            duration: 3000,
          });
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
      window.removeEventListener('unhandledrejection', handleAuthError);
    };
  }, [navigate]);
};