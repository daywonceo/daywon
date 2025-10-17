
import { getHabitActivities, HabitActivity } from "./habitActivity";
import { getUserTimeWindowSync } from "./userTimeWindow";
import { supabase } from "@/integrations/supabase/client";

export interface HabitStats {
  habitName: string;
  completed: number;
  failed: number;
  empty: number;
  total: number;
  percentage: number;
  category: 'good' | 'bad' | 'in-progress';
}

// Calculate habit statistics for the specified timeframe with automatic categorization using habit_id
export const calculateHabitStats = async (timeframe: "week" | "month" | "year"): Promise<{ goodHabits: HabitStats[], badHabits: HabitStats[], inProgressHabits: HabitStats[] }> => {
  try {
    const activities = getHabitActivities();
    
    // Get user-aware time window based on account creation date
    const { startDate, totalDaysAvailable } = getUserTimeWindowSync(timeframe);
    
    console.log(`Calculating habit stats for ${timeframe} - Start date: ${startDate.toISOString()}, Total days: ${totalDaysAvailable}`);
    
    // Fetch habits from database to get created_at dates
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { goodHabits: [], badHabits: [], inProgressHabits: [] };
    }

    const { data: habits, error } = await supabase
      .from('habits')
      .select('id, name, created_at')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching habits:', error);
      return { goodHabits: [], badHabits: [], inProgressHabits: [] };
    }

    const habitCreationDates = new Map<string, Date>();
    habits?.forEach(habit => {
      habitCreationDates.set(habit.id, new Date(habit.created_at));
    });
    
    // Filter activities by date
    const startDateStr = startDate.toISOString().split('T')[0];
    const filteredActivities = activities.filter(
      activity => activity.date >= startDateStr
    );
    
    // Get all unique habits (using habit_id as primary key, habitName as fallback)
    const habitMap = new Map<string, { habitName: string; createdAt: Date | null }>();
    filteredActivities.forEach(activity => {
      const key = activity.habitId || activity.habitName;
      if (!habitMap.has(key)) {
        const createdAt = activity.habitId ? habitCreationDates.get(activity.habitId) || null : null;
        habitMap.set(key, { habitName: activity.habitName, createdAt });
      }
    });
    
    // Calculate statistics for each habit
    const allHabitStats: HabitStats[] = Array.from(habitMap.entries()).map(([habitKey, { habitName, createdAt }]) => {
      // Get all activities for this habit (within the timeframe)
      const habitActivities = filteredActivities.filter(activity => {
        const activityKey = activity.habitId || activity.habitName;
        return activityKey === habitKey;
      });
      
      // Remove duplicates by date - keep the latest status for each date
      const uniqueActivityMap = new Map<string, HabitActivity>();
      habitActivities.forEach(activity => {
        const existing = uniqueActivityMap.get(activity.date);
        if (!existing || activity.date >= existing.date) {
          uniqueActivityMap.set(activity.date, activity);
        }
      });
      
      const uniqueActivities = Array.from(uniqueActivityMap.values());
      
      // Count only COMPLETED activities (not failed, not empty)
      const completed = uniqueActivities.filter(a => a.status === "completed").length;
      const failed = uniqueActivities.filter(a => a.status === "failed").length;
      const empty = uniqueActivities.filter(a => a.status === "empty").length;
      
      // Calculate TOTAL days from habit creation date (or timeframe start, whichever is later)
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const hasCompletedToday = uniqueActivities.some(a => a.date === todayStr && a.status === 'completed');
      
      let calculatedTotal = totalDaysAvailable;
      
      if (createdAt) {
        // Use the later of: timeframe start OR habit creation date
        const effectiveStart = createdAt > startDate ? createdAt : startDate;
        
        // Calculate actual days from effective start to now
        const msPerDay = 1000 * 60 * 60 * 24;
        const daysDiff = Math.floor((now.getTime() - effectiveStart.getTime()) / msPerDay);
        
        // Total days = days elapsed + 1 (to include both start and end day)
        // BUT: Only count today if the habit has been completed today
        const actualDays = hasCompletedToday ? daysDiff + 1 : daysDiff;
        
        // Cap at the timeframe's total available days
        calculatedTotal = Math.min(actualDays, totalDaysAvailable);
      }
      
      // CRITICAL FIX: Total should be AT LEAST the number of unique activity days
      // This handles cases where activities were recorded before we tracked creation dates
      // BUT: Never exceed the timeframe's total available days (e.g., 7 for week)
      const total = Math.min(Math.max(uniqueActivities.length, calculatedTotal), totalDaysAvailable);
      
      // Percentage = completed / total (failed and empty don't count as completed)
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      // Auto-categorize
      let category: 'good' | 'bad' | 'in-progress';
      if (percentage >= 70) {
        category = 'good';
      } else if (percentage < 40) {
        category = 'bad';
      } else {
        category = 'in-progress';
      }
      
      return {
        habitName,
        completed,
        failed,
        empty: empty + Math.max(0, total - uniqueActivities.length),
        total,
        percentage,
        category
      };
    });
    
    // Separate habits by category and sort by percentage
    const goodHabits = allHabitStats
      .filter(habit => habit.category === 'good')
      .sort((a, b) => b.percentage - a.percentage);
    
    const badHabits = allHabitStats
      .filter(habit => habit.category === 'bad')
      .sort((a, b) => a.percentage - b.percentage);
    
    const inProgressHabits = allHabitStats
      .filter(habit => habit.category === 'in-progress')
      .sort((a, b) => b.percentage - a.percentage);
    
    return {
      goodHabits,
      badHabits,
      inProgressHabits
    };
  } catch (error) {
    console.error("Error calculating habit stats:", error);
    return { goodHabits: [], badHabits: [], inProgressHabits: [] };
  }
};
