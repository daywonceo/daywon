
import { getHabitActivities } from "./habitActivity";
import { hasRecentRecovery } from "./streakRecovery";

// Calculate current streak for a specific habit (from today backwards)
export const calculateCurrentStreak = (habitName: string): number => {
  try {
    const activities = getHabitActivities();
    const today = new Date();
    
    console.log(`Calculating current streak for ${habitName}`);
    
    // Filter activities for this habit, sorted by date (newest first)
    const habitActivities = activities
      .filter(activity => activity.habitName === habitName)
      .sort((a, b) => b.date.localeCompare(a.date));
    
    console.log(`Found ${habitActivities.length} activities for ${habitName}`);
    
    // Count consecutive days backwards from today
    let streak = 0;
    let currentDate = new Date(today);
    
    // Remove time component for accurate date comparison
    currentDate.setHours(0, 0, 0, 0);
    
    while (true) {
      const currentDateStr = currentDate.toISOString().split('T')[0];
      const activity = habitActivities.find(a => a.date === currentDateStr);
      
      console.log(`Checking date ${currentDateStr}:`, activity?.status || 'no activity');
      
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
      
      // Safety check to prevent infinite loops (allow up to 10 years of streak)
      if (streak > 3650) {
        console.log(`Safety break at ${streak} days (10+ years)`);
        break;
      }
    }
    
    console.log(`Final current streak for ${habitName}: ${streak}`);
    return streak;
  } catch (error) {
    console.error("Error calculating current streak:", error);
    return 0;
  }
};

// Calculate streak for a specific habit on a specific date (backwards from that date)
export const calculateStreakForDate = (habitName: string, targetDate: Date): number => {
  try {
    const activities = getHabitActivities();
    const targetDateStr = targetDate.toISOString().split('T')[0];
    
    console.log(`Calculating streak for ${habitName} on ${targetDateStr}`);
    
    // Filter activities for this habit, sorted by date (newest first)
    const habitActivities = activities
      .filter(activity => activity.habitName === habitName)
      .sort((a, b) => b.date.localeCompare(a.date));
    
    console.log(`Found ${habitActivities.length} activities for ${habitName}`);
    
    // Check if the target date was completed
    const targetActivity = habitActivities.find(activity => activity.date === targetDateStr);
    if (!targetActivity || targetActivity.status !== 'completed') {
      console.log(`Target date ${targetDateStr} not completed for ${habitName}`);
      return 0;
    }
    
    // Count consecutive days backwards from target date
    let streak = 0;
    let currentDate = new Date(targetDate);
    currentDate.setHours(0, 0, 0, 0); // Remove time component
    
    while (true) {
      const currentDateStr = currentDate.toISOString().split('T')[0];
      const activity = habitActivities.find(a => a.date === currentDateStr);
      
      console.log(`Checking date ${currentDateStr}:`, activity?.status || 'no activity');
      
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
      
      // Safety check to prevent infinite loops (allow up to 10 years of streak)
      if (streak > 3650) {
        console.log(`Safety break at ${streak} days (10+ years)`);
        break;
      }
    }
    
    console.log(`Final streak for ${habitName} on ${targetDateStr}: ${streak}`);
    return streak;
  } catch (error) {
    console.error("Error calculating streak for date:", error);
    return 0;
  }
};

// Get the best streak for a habit across all time
export const calculateBestStreak = (habitName: string): number => {
  try {
    const activities = getHabitActivities();
    
    // Filter activities for this habit, sorted by date (oldest first)
    const habitActivities = activities
      .filter(activity => activity.habitName === habitName && activity.status === 'completed')
      .sort((a, b) => a.date.localeCompare(b.date));
    
    if (habitActivities.length === 0) return 0;
    
    let bestStreak = 0;
    let currentStreak = 0;
    let previousDate: Date | null = null;
    
    for (const activity of habitActivities) {
      const currentDate = new Date(activity.date);
      
      if (previousDate === null) {
        // First activity
        currentStreak = 1;
      } else {
        // Check if this date is consecutive to the previous date
        const expectedDate = new Date(previousDate);
        expectedDate.setDate(expectedDate.getDate() + 1);
        
        if (currentDate.getTime() === expectedDate.getTime()) {
          // Consecutive day
          currentStreak++;
        } else {
          // Gap in dates, reset streak
          currentStreak = 1;
        }
      }
      
      // Update best streak if current is better
      bestStreak = Math.max(bestStreak, currentStreak);
      previousDate = currentDate;
    }
    
    console.log(`Best streak for ${habitName}: ${bestStreak}`);
    return bestStreak;
  } catch (error) {
    console.error("Error calculating best streak:", error);
    return 0;
  }
};

// Format streak display for large numbers
export const formatStreakDisplay = (streak: number): string => {
  if (streak < 1000) {
    return streak.toString();
  } else if (streak < 10000) {
    // Show as 1.2k for numbers like 1,234
    return `${(streak / 1000).toFixed(1)}k`;
  } else {
    // Show as 12k for numbers like 12,345
    return `${Math.floor(streak / 1000)}k`;
  }
};
