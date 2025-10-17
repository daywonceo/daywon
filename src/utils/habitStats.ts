
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
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // Determine max days based on timeframe
    const maxDays = timeframe === "week" ? 7 : timeframe === "month" ? 30 : 365;
    
    // Check if ANY habit has activity today (completed or failed)
    const hasActivityToday = activities.some(a => 
      a.date === todayStr && (a.status === "completed" || a.status === "failed")
    );
    
    // Calculate date range - ALWAYS fixed window, never more than maxDays
    let endDate: Date;
    let startDate: Date;
    
    if (hasActivityToday) {
      // Include today, go back (maxDays - 1) days
      endDate = now;
      startDate = new Date(now);
      startDate.setDate(now.getDate() - (maxDays - 1));
    } else {
      // Don't include today, show yesterday and (maxDays - 1) days before that
      endDate = new Date(now);
      endDate.setDate(now.getDate() - 1);
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - (maxDays - 1));
    }
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    console.log(`Calculating habit stats for ${timeframe} - Start: ${startDateStr}, End: ${endDateStr}, Max Days: ${maxDays}`);
    
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
    
    // Filter activities to ONLY include those within our exact window
    const filteredActivities = activities.filter(activity => {
      return activity.date >= startDateStr && activity.date <= endDateStr;
    });
    
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
      
      // Count statuses
      const completed = uniqueActivities.filter(a => a.status === "completed").length;
      const failed = uniqueActivities.filter(a => a.status === "failed").length;
      const empty = uniqueActivities.filter(a => a.status === "empty").length;
      
      // Calculate actual available days for this habit
      // If habit was created within the window, only count days since creation
      let actualDaysAvailable = maxDays;
      if (createdAt && createdAt > startDate) {
        // Habit was created within the window
        const createdDateStr = createdAt.toISOString().split('T')[0];
        const daysSinceCreation = Math.floor((new Date(endDateStr).getTime() - new Date(createdDateStr).getTime()) / (1000 * 60 * 60 * 24)) + 1;
        actualDaysAvailable = Math.min(daysSinceCreation, maxDays);
      }
      
      // TOTAL is the minimum of maxDays and actual days available
      const total = Math.min(maxDays, actualDaysAvailable);
      
      // Calculate missing days (days with no activity recorded at all)
      // These are days that exist in the window but have no activity record
      const recordedDays = completed + failed + empty;
      const missingDays = Math.max(0, total - recordedDays);
      
      // For display purposes, treat missing days as failed days
      const displayFailed = failed + missingDays;
      
      // Percentage = completed / total
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
        failed: displayFailed, // Use displayFailed which includes missing days
        empty,
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
