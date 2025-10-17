import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Optimized hook for fetching user's top habits with caching
 * Reduces duplicate queries by using React Query's built-in cache
 */
export const useOptimizedTopHabits = (month?: string) => {
  const { user } = useAuth();
  
  const currentMonth = month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  
  return useQuery({
    queryKey: ['topHabits', user?.id, currentMonth],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_top_habits')
        .select('habits')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data?.habits ?? null;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });
};

/**
 * Optimized hook for fetching habit activities with smart pagination
 * Fetches only recent data by default to reduce query size
 */
export const useOptimizedHabitActivities = (daysBack: number = 30) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['habitActivities', user?.id, daysBack],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);
      const dateStr = startDate.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('habit_activities')
        .select('id, habit_id, habit_name, activity_date, status')
        .eq('user_id', user.id)
        .gte('activity_date', dateStr)
        .order('activity_date', { ascending: false })
        .limit(1000); // Safety limit
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Optimized hook for fetching active habits with caching
 * Combines filters in a single query
 */
export const useOptimizedActiveHabits = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['activeHabits', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('habits')
        .select('id, name, created_at, category, description')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .is('ended_at', null)
        .is('archived_at', null)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
};

/**
 * Optimized hook for all habits (including archived)
 */
export const useOptimizedAllHabits = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['allHabits', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('habits')
        .select('id, name, created_at, category, description, status, ended_at, archived_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 20, // 20 minutes
  });
};

/**
 * Hook to help prefetch data for better UX
 * Use queryClient.prefetchQuery for actual prefetching
 */
export const usePrefetchHelper = () => {
  const { user } = useAuth();
  
  return {
    shouldPrefetch: !!user?.id,
    userId: user?.id,
  };
};
