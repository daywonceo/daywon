
import { getHabitActivities } from "./habitActivity";
import { hasRecentRecovery } from "./streakRecovery";

// Calculate streak for a specific habit on a specific date
export const calculateStreakForDate = (habitName: string, targetDate: Date): number => {
  try {
    const activities = getHabitActivities();
    const targetDateStr = targetDate.toISOString().split('T')[0];
    
    console.log(`Calculating streak for ${habitName} on ${targetDateStr}`);
    
    // Filter activities for this habit, sorted by date (newest first)
    const habitActivities = activities
      .filter(activity => activity.habitName === habitName)
      .sort((a, b) => b.date.localeCompare(a.date));
    
    console.log(`Found ${habitActivities.length} activities for ${habitName}:`, habitActivities);
    
    // Check if the target date was completed
    const targetActivity = habitActivities.find(activity => activity.date === targetDateStr);
    if (!targetActivity || targetActivity.status !== 'completed') {
      console.log(`Target date ${targetDateStr} not completed for ${habitName}`);
      return 0;
    }
    
    // Count consecutive days backwards from target date
    let streak = 0;
    let currentDate = new Date(targetDate);
    
    while (true) {
      const currentDateStr = currentDate.toISOString().split('T')[0];
      const activity = habitActivities.find(a => a.date === currentDateStr);
      
      console.log(`Checking date ${currentDateStr}:`, activity);
      
      if (activity && activity.status === 'completed') {
        streak++;
        console.log(`Day ${currentDateStr} completed, streak now: ${streak}`);
        // Move to previous day
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (activity && activity.status === 'failed') {
        // Check if there's a recovery for this failed day that should continue the streak
        if (hasRecentRecovery(habitName, currentDate)) {
          streak++;
          console.log(`Day ${currentDateStr} failed but recovered, streak now: ${streak}`);
          currentDate.setDate(currentDate.getDate() - 1);
          continue;
        }
        // Failed day breaks the streak (unless recovered)
        console.log(`Day ${currentDateStr} failed, breaking streak at: ${streak}`);
        break;
      } else {
        // No activity recorded (empty) - this breaks the streak
        console.log(`Day ${currentDateStr} has no activity, breaking streak at: ${streak}`);
        break;
      }
      
      // Safety check to prevent infinite loops
      const daysDiff = Math.floor((targetDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 365) {
        console.log(`Safety break at ${daysDiff} days`);
        break;
      }
    }
    
    console.log(`Final streak for ${habitName}: ${streak}`);
    return streak;
  } catch (error) {
    console.error("Error calculating streak for date:", error);
    return 0;
  }
};
