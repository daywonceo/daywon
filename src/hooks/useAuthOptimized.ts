import { useContext, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Optimized auth hook that prevents unnecessary re-renders
 * by memoizing stable user properties
 */
export const useAuthOptimized = () => {
  const { user, session, loading, ...authMethods } = useAuth();
  
  // Memoize stable user properties to prevent unnecessary re-renders
  const stableUser = useMemo(() => {
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      email_confirmed_at: user.email_confirmed_at,
      // Add other stable properties as needed
    };
  }, [user?.id, user?.email, user?.created_at, user?.email_confirmed_at]);
  
  // Memoize session properties
  const stableSession = useMemo(() => {
    if (!session) return null;
    
    return {
      access_token: session.access_token,
      expires_at: session.expires_at,
      refresh_token: session.refresh_token,
      provider_token: session.provider_token,
    };
  }, [session?.access_token, session?.expires_at, session?.refresh_token, session?.provider_token]);
  
  return {
    user: stableUser,
    session: stableSession,
    fullUser: user, // Keep reference to full user object when needed
    fullSession: session, // Keep reference to full session object when needed
    loading,
    ...authMethods
  };
};