
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
