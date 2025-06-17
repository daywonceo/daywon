
import { saveOfflineData, getOfflineData } from "./offlineStorage";

export interface HabitActivity {
  id: string;
  date: string; // ISO date string
  habitName: string; 
  status: "completed" | "failed" | "empty";
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
