import { saveOfflineData, getOfflineData } from "./offlineStorage";

export interface HabitActivity {
  id: string;
  date: string; // ISO date string
  habitName: string; 
  status: "completed" | "failed" | "empty";
}

export interface HabitStats {
  habitName: string;
  completed: number;
  failed: number;
  empty: number;
  total: number;
  percentage: number;
}

// Record a habit activity
export const recordHabitActivity = (habitName: string, status: "completed" | "failed" | "empty", date: Date = new Date()): void => {
  try {
    const offlineData = getOfflineData();
    const habitActivities: HabitActivity[] = offlineData.habitActivities || [];
    
    // Format date as YYYY-MM-DD
    const dateStr = date.toISOString().split('T')[0];
    
    // Check if there's an existing entry for this habit and date
    const existingIndex = habitActivities.findIndex(
      activity => activity.habitName === habitName && activity.date === dateStr
    );
    
    // Create a new activity object
    const activity: HabitActivity = {
      id: existingIndex >= 0 ? habitActivities[existingIndex].id : `${habitName}-${dateStr}-${Date.now()}`,
      date: dateStr,
      habitName,
      status
    };
    
    // Update or add the activity
    if (existingIndex >= 0) {
      habitActivities[existingIndex] = activity;
    } else {
      habitActivities.push(activity);
    }
    
    // Save the updated activities
    saveOfflineData({
      habitActivities
    });
    
    console.log(`Recorded habit: ${habitName} as ${status} on ${dateStr}`);
  } catch (error) {
    console.error("Failed to record habit activity:", error);
  }
};

// Get all habit activities
export const getHabitActivities = (): HabitActivity[] => {
  const offlineData = getOfflineData();
  return offlineData.habitActivities || [];
};

// Calculate habit statistics for the specified timeframe
export const calculateHabitStats = (timeframe: "week" | "month" | "year"): { goodHabits: HabitStats[], badHabits: HabitStats[] } => {
  try {
    const activities = getHabitActivities();
    const now = new Date();
    
    // Determine the start date based on timeframe
    let startDate: Date;
    switch (timeframe) {
      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    // Filter activities by date
    const startDateStr = startDate.toISOString().split('T')[0];
    const filteredActivities = activities.filter(
      activity => activity.date >= startDateStr
    );
    
    // Group by habit name
    const habitGroups = filteredActivities.reduce<Record<string, HabitActivity[]>>((acc, activity) => {
      if (!acc[activity.habitName]) {
        acc[activity.habitName] = [];
      }
      acc[activity.habitName].push(activity);
      return acc;
    }, {});
    
    // Calculate statistics for each habit
    const allHabitStats: HabitStats[] = Object.keys(habitGroups).map(habitName => {
      const habitActivities = habitGroups[habitName];
      const completed = habitActivities.filter(a => a.status === "completed").length;
      const failed = habitActivities.filter(a => a.status === "failed").length;
      const empty = habitActivities.filter(a => a.status === "empty").length;
      const total = habitActivities.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return {
        habitName,
        completed,
        failed,
        empty,
        total,
        percentage
      };
    });
    
    // Sort by percentage and split into good and bad habits
    const sortedStats = [...allHabitStats].sort((a, b) => b.percentage - a.percentage);
    const halfIndex = Math.ceil(sortedStats.length / 2);
    
    return {
      goodHabits: sortedStats.slice(0, halfIndex),
      badHabits: sortedStats.slice(halfIndex).reverse() // Reverse to show worst first
    };
  } catch (error) {
    console.error("Error calculating habit stats:", error);
    return { goodHabits: [], badHabits: [] };
  }
};

// Calculate streak for a specific habit on a specific date
export const calculateStreakForDate = (habitName: string, targetDate: Date): number => {
  try {
    const activities = getHabitActivities();
    const targetDateStr = targetDate.toISOString().split('T')[0];
    
    // Filter activities for this habit, sorted by date (newest first)
    const habitActivities = activities
      .filter(activity => activity.habitName === habitName)
      .sort((a, b) => b.date.localeCompare(a.date));
    
    // Check if the target date was completed
    const targetActivity = habitActivities.find(activity => activity.date === targetDateStr);
    if (!targetActivity || targetActivity.status !== 'completed') {
      return 0;
    }
    
    // Count consecutive days backwards from target date
    let streak = 0;
    let currentDate = new Date(targetDate);
    
    while (true) {
      const currentDateStr = currentDate.toISOString().split('T')[0];
      const activity = habitActivities.find(a => a.date === currentDateStr);
      
      if (activity && activity.status === 'completed') {
        streak++;
        // Move to previous day
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (activity && activity.status === 'failed') {
        // Failed day breaks the streak
        break;
      } else {
        // No activity recorded (empty) - could be before tracking started
        // Only break if we're not at the very beginning of our data
        const hasAnyEarlierActivity = habitActivities.some(a => a.date < currentDateStr);
        if (hasAnyEarlierActivity) {
          break;
        }
        // Move to previous day to continue checking
        currentDate.setDate(currentDate.getDate() - 1);
      }
      
      // Safety check to prevent infinite loops
      const daysDiff = Math.floor((targetDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 365) {
        break;
      }
    }
    
    return streak;
  } catch (error) {
    console.error("Error calculating streak for date:", error);
    return 0;
  }
};

// Initialize specific habit categories
export const initializeDefaultHabits = (): string[] => {
  const offlineData = getOfflineData();
  
  // Set our fixed habits
  const defaultCategories = ["WORKOUT", "DEVOTIONS", "READ"];
  
  // Only save if no categories exist or they don't match our fixed ones
  if (!offlineData.habitCategories || 
      !Array.isArray(offlineData.habitCategories) || 
      offlineData.habitCategories.length !== defaultCategories.length) {
    
    // Save default categories
    saveOfflineData({
      habitCategories: defaultCategories
    });
  }
  
  return defaultCategories;
};

// Get all habit categories
export const getHabitCategories = (): string[] => {
  const offlineData = getOfflineData();
  return offlineData.habitCategories || initializeDefaultHabits();
};
