import { getHabitActivitiesV2, type HabitActivityV2 } from "./habitActivityV2";
import { hasRecentRecovery } from "./streakRecovery";

// Format large numbers with appropriate suffixes (e.g., 1.2k, 1.5M)
export const formatStreakNumber = (streak: number): string => {
  if (streak < 1000) return streak.toString();
  if (streak < 1000000) return `${(streak / 1000).toFixed(1).replace('.0', '')}k`;
  return `${(streak / 1000000).toFixed(1).replace('.0', '')}M`;
};

// Calculate streak for a specific habit_id on a specific date - V2 using habit_id
export const calculateStreakForDateV2 = (habitId: string, targetDate: Date): number => {
  try {
    const activities = getHabitActivitiesV2();
    const targetDateStr = targetDate.toISOString().split('T')[0];
    
    console.log(`Calculating streak for habit_id ${habitId} on ${targetDateStr}`);
    
    // Filter activities for this habit_id, sorted by date (newest first)
    const habitActivities = activities
      .filter(activity => activity.habitId === habitId)
      .sort((a, b) => b.date.localeCompare(a.date));
    
    // Check if the target date was completed
    const targetActivity = habitActivities.find(activity => activity.date === targetDateStr);
    if (!targetActivity || targetActivity.status !== 'completed') {
      console.log(`Target date ${targetDateStr} not completed for habit_id ${habitId}`);
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
        // Check if there's a recovery for this failed day using habitName for compatibility
        if (hasRecentRecovery(activity.habitName, currentDate)) {
          streak++;
          console.log(`Day ${currentDateStr} failed but recovered, streak now: ${streak}`);
          currentDate.setDate(currentDate.getDate() - 1);
          continue;
        }
        // Failed day breaks the streak (unless recovered)
        console.log(`Day ${currentDateStr} failed, breaking streak at: ${streak}`);
        break;
      } else {
        // Check if the date is in the future (this shouldn't break the streak)
        const now = new Date();
        if (currentDate > now) {
          console.log(`Date ${currentDateStr} is in the future, continuing streak check`);
          currentDate.setDate(currentDate.getDate() - 1);
          continue;
        }
        
        // NEW RULE: Any day without explicit completion breaks the streak
        // This includes both "empty" (no interaction) and "failed" (explicit fail)
        // Only allow grace for today if it's still early in the day
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const isToday = currentDateStr === todayStr;
        
        if (isToday) {
          // For today, only continue if it's still early (before end of day)
          // Otherwise, treat unchecked as incomplete
          const currentHour = now.getHours();
          if (currentHour < 23) { // Allow until 11 PM
            console.log(`Today (${todayStr}) has no activity yet but it's still early, continuing streak check`);
            currentDate.setDate(currentDate.getDate() - 1);
            continue;
          }
        }
        
        // No activity recorded (empty) or past day without completion - this breaks the streak
        console.log(`Day ${currentDateStr} has no completion, breaking streak at: ${streak}`);
        break;
      }
      
      // Safety check to prevent infinite loops - but allow for very long streaks
      const daysDiff = Math.floor((targetDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 3650) { // Allow up to 10 years of streaks
        console.log(`Safety break at ${daysDiff} days - very long streak detected`);
        break;
      }
    }
    
    console.log(`Final streak for habit_id ${habitId}: ${streak}`);
    return streak;
  } catch (error) {
    console.error("Error calculating streak for date:", error);
    return 0;
  }
};

// Calculate the longest streak ever achieved for a habit_id - V2 using habit_id
export const calculateLongestStreakV2 = (habitId: string): number => {
  try {
    const activities = getHabitActivitiesV2();
    
    // Filter and sort activities for this habit_id
    const habitActivities = activities
      .filter(activity => activity.habitId === habitId && activity.status === 'completed')
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
    
    console.log(`Longest streak for habit_id ${habitId}: ${longestStreak}`);
    return longestStreak;
  } catch (error) {
    console.error("Error calculating longest streak:", error);
    return 0;
  }
};

// Calculate the overall longest streak across all habits - V2 using habit_id
export const calculateOverallLongestStreakV2 = (): { streak: number; habitId: string; habitName: string } => {
  try {
    const activities = getHabitActivitiesV2();
    const habitIds = [...new Set(activities.map(a => a.habitId))];
    
    let overallLongest = 0;
    let longestHabitId = '';
    let longestHabitName = '';
    
    for (const habitId of habitIds) {
      const habitLongest = calculateLongestStreakV2(habitId);
      if (habitLongest > overallLongest) {
        overallLongest = habitLongest;
        longestHabitId = habitId;
        // Get the habit name from any activity with this habit_id
        const habitActivity = activities.find(a => a.habitId === habitId);
        longestHabitName = habitActivity?.habitName || '';
      }
    }
    
    return { streak: overallLongest, habitId: longestHabitId, habitName: longestHabitName };
  } catch (error) {
    console.error("Error calculating overall longest streak:", error);
    return { streak: 0, habitId: '', habitName: '' };
  }
};

// Backward compatibility wrapper that uses habit_id when available
export const calculateStreakForDate = (habitName: string, targetDate: Date): number => {
  try {
    const activities = getHabitActivitiesV2();
    
    // Find the habit_id for this habitName
    const habitActivity = activities.find(a => a.habitName === habitName);
    if (habitActivity?.habitId) {
      return calculateStreakForDateV2(habitActivity.habitId, targetDate);
    }
    
    // Fallback to name-based calculation if no habit_id found
    console.warn(`No habit_id found for ${habitName}, using legacy calculation`);
    return 0;
  } catch (error) {
    console.error("Error in calculateStreakForDate wrapper:", error);
    return 0;
  }
};

// Backward compatibility wrapper
export const calculateLongestStreak = (habitName: string): number => {
  try {
    const activities = getHabitActivitiesV2();
    
    // Find the habit_id for this habitName
    const habitActivity = activities.find(a => a.habitName === habitName);
    if (habitActivity?.habitId) {
      return calculateLongestStreakV2(habitActivity.habitId);
    }
    
    // Fallback to name-based calculation if no habit_id found
    console.warn(`No habit_id found for ${habitName}, using legacy calculation`);
    return 0;
  } catch (error) {
    console.error("Error in calculateLongestStreak wrapper:", error);
    return 0;
  }
};

// Backward compatibility wrapper
export const calculateOverallLongestStreak = (): { streak: number; habitName: string } => {
  try {
    const result = calculateOverallLongestStreakV2();
    return { streak: result.streak, habitName: result.habitName };
  } catch (error) {
    console.error("Error in calculateOverallLongestStreak wrapper:", error);
    return { streak: 0, habitName: '' };
  }
};