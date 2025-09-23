import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AppSession {
  id: string;
  user_id: string;
  session_date: string;
  total_time_minutes: number;
  section_breakdown: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export const useAppSessions = () => {
  const { user } = useAuth();
  const [todaySession, setTodaySession] = useState<AppSession | null>(null);
  const [loading, setLoading] = useState(false);

  // Get today's session data
  const getTodaySession = async (date?: string) => {
    if (!user) return null;
    
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    try {
      const { data, error } = await supabase
        .from('app_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_date', targetDate)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
        console.error('Error fetching session:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching session:', error);
      return null;
    }
  };

  // Save or update session data
  const saveSession = async (totalMinutes: number, sectionBreakdown: Record<string, number>) => {
    if (!user || totalMinutes < 1) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('app_sessions')
        .upsert({
          user_id: user.id,
          session_date: today,
          total_time_minutes: Math.round(totalMinutes),
          section_breakdown: sectionBreakdown
        }, {
          onConflict: 'user_id,session_date'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error saving session:', error);
        return;
      }
      
      setTodaySession(data);
    } catch (error) {
      console.error('Error saving session:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get session data for a specific date
  const getSessionForDate = async (date: string): Promise<AppSession | null> => {
    return await getTodaySession(date);
  };

  // Initialize today's session with debouncing
  useEffect(() => {
    if (!user) return;
    
    let timeoutId: NodeJS.Timeout;
    
    const loadSession = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        getTodaySession().then(setTodaySession);
      }, 100); // Debounce by 100ms
    };
    
    loadSession();
    
    return () => clearTimeout(timeoutId);
  }, [user?.id]); // Only depend on user.id, not the entire user object

  // Sync localStorage data with database periodically with better performance
  useEffect(() => {
    if (!user?.id) return;
    
    const syncData = async () => {
      const stored = localStorage.getItem('appTimeSession');
      if (!stored) return;
      
      try {
        const data = JSON.parse(stored);
        const today = new Date().toISOString().split('T')[0];
        
        // Only sync if it's today's data and has meaningful time
        if (data.date === today && data.totalTime >= 1) {
          // Check if we already synced recently to avoid duplicate requests
          const lastSyncKey = `lastSessionSync_${user.id}_${today}`;
          const lastSync = localStorage.getItem(lastSyncKey);
          const now = Date.now();
          
          if (!lastSync || now - parseInt(lastSync) > 30000) { // 30 seconds
            await saveSession(data.totalTime, data.sections || {});
            localStorage.setItem(lastSyncKey, now.toString());
          }
        }
      } catch (error) {
        console.error('Error syncing session data:', error);
      }
    };
    
    // Sync after a short delay to avoid immediate multiple calls
    const initialTimeout = setTimeout(syncData, 2000);
    
    // Sync every 5 minutes with improved interval management
    const interval = setInterval(syncData, 5 * 60 * 1000);
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [user?.id]); // Only depend on user.id

  return {
    todaySession,
    loading,
    saveSession,
    getSessionForDate,
    getTodaySession
  };
};