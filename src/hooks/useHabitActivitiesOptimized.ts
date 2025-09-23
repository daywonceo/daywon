import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRequestCache, useThrottle } from "./usePerformanceOptimized";

export type ActivityStatus = "completed" | "failed" | "empty";

export interface OptimizedDayActivity {
  day: number;
  text: string;
  categories: string[];
  statuses: Record<string, ActivityStatus>;
  isEditing: boolean;
}

const PAGE_SIZE = 20;
const CACHE_DURATION = 60000; // 1 minute

export const useHabitActivitiesOptimized = (habitList?: string[]) => {
  const { user } = useAuth();
  const { getCachedRequest, setCachedRequest } = useRequestCache();
  const [activities, setActivities] = useState<OptimizedDayActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  // Memoize user habits to prevent unnecessary recalculations
  const userHabits = useMemo(() => {
    return habitList && habitList.length > 0 ? habitList : ["Workout", "Devotions", "Read"];
  }, [habitList?.join(',')]);

  // Optimized habit activities fetch with pagination and caching
  const fetchHabitActivities = useCallback(async (pageNum: number = 0, reset: boolean = false) => {
    if (!user?.id) return [];

    const cacheKey = `habit-activities-${user.id}-${pageNum}`;
    const cached = getCachedRequest(cacheKey, CACHE_DURATION);
    
    if (cached && !reset) {
      return cached;
    }

    try {
      // Calculate date range - last 30 days with pagination
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - (30 + pageNum * PAGE_SIZE));
      endDate.setDate(endDate.getDate() - pageNum * PAGE_SIZE);

      const { data, error } = await supabase
        .from('habit_activities')
        .select('habit_id,habit_name,activity_date,status,created_at')
        .eq('user_id', user.id)
        .gte('activity_date', startDate.toISOString().split('T')[0])
        .lte('activity_date', endDate.toISOString().split('T')[0])
        .order('activity_date', { ascending: false })
        .limit(PAGE_SIZE);

      if (error) {
        console.error('Error fetching habit activities:', error);
        return [];
      }

      const result = data || [];
      setCachedRequest(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error in fetchHabitActivities:', error);
      return [];
    }
  }, [user?.id, getCachedRequest, setCachedRequest]);

  // Throttled load activities function
  const loadActivities = useThrottle(useCallback(async (reset: boolean = false) => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      
      const currentPage = reset ? 0 : page;
      const habitActivities = await fetchHabitActivities(currentPage, reset);
      
      // Process only the last 3 days for the main view
      const today = new Date();
      const last3Days = [0, 1, 2].map(daysAgo => {
        const date = new Date(today);
        date.setDate(today.getDate() - daysAgo);
        return date;
      });

      const newActivities = last3Days.map((date, index) => {
        const day = date.getDate();
        const dateStr = date.toISOString().split('T')[0];
        
        let text = "";
        if (index === 0) {
          text = "TODAY";
        } else if (index === 1) {
          text = "YESTERDAY";
        } else {
          text = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
        }
        
        // Initialize statuses map efficiently
        const statuses: Record<string, ActivityStatus> = {};
        
        userHabits.forEach(category => {
          const activity = habitActivities.find(a => 
            a.habit_name === category && a.activity_date === dateStr
          );
          statuses[category] = activity ? activity.status as ActivityStatus : "empty";
        });
        
        return {
          day,
          text,
          categories: userHabits,
          statuses,
          isEditing: false
        };
      });
      
      if (reset) {
        setActivities(newActivities);
        setPage(0);
      } else {
        setActivities(prev => [...prev, ...newActivities]);
        setPage(currentPage + 1);
      }
      
      setHasMore(habitActivities.length === PAGE_SIZE);
    } catch (error) {
      console.error("Failed to load activities:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, userHabits, page, fetchHabitActivities]), 1000); // 1 second throttle

  // Optimized toggle status with immediate UI update
  const toggleStatus = useCallback((dayIndex: number, category: string) => {
    setActivities(prevActivities => {
      const newActivities = [...prevActivities];
      const currentStatus = newActivities[dayIndex]?.statuses[category];
      
      if (!currentStatus) return prevActivities;
      
      // Cycle through statuses efficiently
      const statusCycle: Record<ActivityStatus, ActivityStatus> = {
        "empty": "completed",
        "completed": "failed", 
        "failed": "empty"
      };
      
      const newStatus = statusCycle[currentStatus];
      newActivities[dayIndex].statuses[category] = newStatus;
      
      // Async operations without blocking UI
      Promise.resolve().then(() => {
        const today = new Date();
        const date = new Date(today);
        date.setDate(today.getDate() - dayIndex);
        
        // Dispatch event for real-time updates
        window.dispatchEvent(new CustomEvent('habitStatusChanged', { 
          detail: { category, status: newStatus, date: date.toISOString().split('T')[0] } 
        }));
      });
      
      return newActivities;
    });
  }, []);

  // Load more activities for infinite scroll
  const loadMoreActivities = useCallback(() => {
    if (!isLoading && hasMore) {
      loadActivities(false);
    }
  }, [isLoading, hasMore, loadActivities]);

  // Initial load with dependency optimization
  useEffect(() => {
    if (user?.id && userHabits.length > 0) {
      loadActivities(true);
    }
  }, [user?.id, userHabits.length]); // Minimal dependencies

  return {
    activities: activities.slice(0, 3), // Only return first 3 for main view
    allActivities: activities,
    isLoading,
    hasMore,
    loadMoreActivities,
    toggleStatus,
    refreshActivities: () => loadActivities(true),
    userHabits
  };
};