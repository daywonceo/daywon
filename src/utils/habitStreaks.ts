
import { getHabitActivities } from "./habitActivity";
import { hasRecentRecovery } from "./streakRecovery";

// Format large numbers with appropriate suffixes (e.g., 1.2k, 1.5M)
export const formatStreakNumber = (streak: number): string => {
  if (streak < 1000) return streak.toString();
  if (streak < 1000000) return `${(streak / 1000).toFixed(1).replace('.0', '')}k`;
  return `${(streak / 1000000).toFixed(1).replace('.0', '')}M`;
};

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
      
      // Safety check to prevent infinite loops - but allow for very long streaks
      const daysDiff = Math.floor((targetDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 3650) { // Allow up to 10 years of streaks
        console.log(`Safety break at ${daysDiff} days - very long streak detected`);
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

// Calculate the longest streak ever achieved for a habit
export const calculateLongestStreak = (habitName: string): number => {
  try {
    const activities = getHabitActivities();
    
    // Filter and sort activities for this habit
    const habitActivities = activities
      .filter(activity => activity.habitName === habitName && activity.status === 'completed')
      .sort((a, b) => a.date.localeCompare(b.date));
    
    if (habitActivities.length === 0) return 0;
    
    let longestStreak = 0;
    let currentStreak = 0;
    let lastDate: Date | null = null;
    
    for (const activity of habitActivities) {
      const activityDate = new Date(activity.date);
      
      if (lastDate === null) {
        // First activity
        currentStreak = 1;
      } else {
        const daysDiff = Math.floor((activityDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          // Consecutive day
          currentStreak++;
        } else {
          // Gap in streak, start new streak
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
        }
      }
      
      lastDate = activityDate;
    }
    
    // Don't forget to check the final streak
    longestStreak = Math.max(longestStreak, currentStreak);
    
    console.log(`Longest streak for ${habitName}: ${longestStreak}`);
    return longestStreak;
  } catch (error) {
    console.error("Error calculating longest streak:", error);
    return 0;
  }
};

// Calculate the overall longest streak across all habits
export const calculateOverallLongestStreak = (): { streak: number; habitName: string } => {
  try {
    const activities = getHabitActivities();
    const habitNames = [...new Set(activities.map(a => a.habitName))];
    
    let overallLongest = 0;
    let longestHabit = '';
    
    for (const habitName of habitNames) {
      const habitLongest = calculateLongestStreak(habitName);
      if (habitLongest > overallLongest) {
        overallLongest = habitLongest;
        longestHabit = habitName;
      }
    }
    
    return { streak: overallLongest, habitName: longestHabit };
  } catch (error) {
    console.error("Error calculating overall longest streak:", error);
    return { streak: 0, habitName: '' };
  }
};
