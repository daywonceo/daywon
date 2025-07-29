
import { getHabitActivitiesV2, HabitActivityV2 } from "./habitActivityV2";
import { getUserTimeWindowSync } from "./userTimeWindow";

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
export const calculateHabitStats = (timeframe: "week" | "month" | "year"): { goodHabits: HabitStats[], badHabits: HabitStats[], inProgressHabits: HabitStats[] } => {
  try {
    const activities = getHabitActivitiesV2();
    
    // Get user-aware time window based on account creation date
    const { startDate, totalDaysAvailable } = getUserTimeWindowSync(timeframe);
    
    console.log(`Calculating habit stats for ${timeframe} - Start date: ${startDate.toISOString()}, Total days: ${totalDaysAvailable}`);
    
    // Filter activities by date
    const startDateStr = startDate.toISOString().split('T')[0];
    const filteredActivities = activities.filter(
      activity => activity.date >= startDateStr
    );
    
    // Get all unique habits (using habit_id as primary key, habitName as fallback)
    const habitMap = new Map<string, string>(); // habitId -> habitName mapping
    filteredActivities.forEach(activity => {
      const key = activity.habitId || activity.habitName;
      if (!habitMap.has(key)) {
        habitMap.set(key, activity.habitName);
      }
    });
    
    // Calculate statistics for each habit
    const allHabitStats: HabitStats[] = Array.from(habitMap.entries()).map(([habitKey, habitName]) => {
      // Get all activities for this habit
      const habitActivities = filteredActivities.filter(activity => {
        const activityKey = activity.habitId || activity.habitName;
        return activityKey === habitKey;
      });
      
      // Remove duplicates by date - keep the latest status for each date
      const uniqueActivityMap = new Map<string, HabitActivityV2>();
      habitActivities.forEach(activity => {
        const existing = uniqueActivityMap.get(activity.date);
        // Keep the activity with the latest creation (activities are usually ordered by creation)
        if (!existing || activity.date >= existing.date) {
          uniqueActivityMap.set(activity.date, activity);
        }
      });
      
      const uniqueActivities = Array.from(uniqueActivityMap.values());
      
      // Count completed, failed, and empty activities that were explicitly recorded
      const completed = uniqueActivities.filter(a => a.status === "completed").length;
      const failed = uniqueActivities.filter(a => a.status === "failed").length;
      const empty = uniqueActivities.filter(a => a.status === "empty").length;
      
      // CRITICAL FIX: Total should be ALL days in the user's available period
      // Days without any record are considered "missed" (empty/incomplete)
      const recordedDays = uniqueActivities.length;
      const missedDays = Math.max(0, totalDaysAvailable - recordedDays);
      const total = totalDaysAvailable;
      
      // Ensure completed count never exceeds total
      const safeCompleted = Math.min(completed, total);
      
      // For percentage calculation: only "completed" counts as success
      // Failed, empty, and missed days all count as incomplete
      const percentage = total > 0 ? Math.round((safeCompleted / total) * 100) : 0;
      
      // Automatic categorization based on completion percentage
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
        completed: safeCompleted,
        failed,
        empty: empty + missedDays, // Include missed days as "empty"
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
