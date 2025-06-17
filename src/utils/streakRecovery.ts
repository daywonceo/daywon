
import { getOfflineData, saveOfflineData } from "./offlineStorage";

export interface StreakRecovery {
  habitName: string;
  option: "reflection" | "double" | "goal";
  data: string;
  date: string;
  streakRestored: number;
}

// Check if a habit has a recent recovery that should restore the streak
export const hasRecentRecovery = (habitName: string, date: Date): boolean => {
  try {
    const recoveries: StreakRecovery[] = JSON.parse(localStorage.getItem('streak_recoveries') || '[]');
    const dateStr = date.toISOString().split('T')[0];
    
    // Check if there's a recovery for this habit from today
    return recoveries.some(recovery => 
      recovery.habitName === habitName && 
      recovery.date.split('T')[0] === dateStr
    );
  } catch (error) {
    console.error("Error checking recent recovery:", error);
    return false;
  }
};

// Check if a habit should show the recovery dialog
export const shouldShowRecoveryDialog = (habitName: string, currentStreak: number): boolean => {
  // Only show recovery for streaks of 3 or more days
  return currentStreak >= 3;
};

// Get recovery data for a habit
export const getRecoveryData = (habitName: string, date: Date): StreakRecovery | null => {
  try {
    const recoveries: StreakRecovery[] = JSON.parse(localStorage.getItem('streak_recoveries') || '[]');
    const dateStr = date.toISOString().split('T')[0];
    
    return recoveries.find(recovery => 
      recovery.habitName === habitName && 
      recovery.date.split('T')[0] === dateStr
    ) || null;
  } catch (error) {
    console.error("Error getting recovery data:", error);
    return null;
  }
};

// Clear old recovery data (older than 30 days)
export const cleanupOldRecoveries = (): void => {
  try {
    const recoveries: StreakRecovery[] = JSON.parse(localStorage.getItem('streak_recoveries') || '[]');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const filtered = recoveries.filter(recovery => 
      new Date(recovery.date) > thirtyDaysAgo
    );
    
    localStorage.setItem('streak_recoveries', JSON.stringify(filtered));
  } catch (error) {
    console.error("Error cleaning up old recoveries:", error);
  }
};
