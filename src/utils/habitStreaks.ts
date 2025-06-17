
import { getHabitActivities } from "./habitActivity";
import { hasRecentRecovery } from "./streakRecovery";

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
        // Check if there's a recovery for this failed day that should continue the streak
        if (hasRecentRecovery(habitName, currentDate)) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
          continue;
        }
        // Failed day breaks the streak (unless recovered)
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
