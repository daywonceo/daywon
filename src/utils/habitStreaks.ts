import { getHabitActivities, type HabitActivity } from "./habitActivity";
import { hasRecentRecovery } from "./streakRecovery";

// Format large numbers with appropriate suffixes (e.g., 1.2k, 1.5M)
export const formatStreakNumber = (streak: number): string => {
  if (streak < 1000) return streak.toString();
  if (streak < 1000000) return `${(streak / 1000).toFixed(1).replace('.0', '')}k`;
  return `${(streak / 1000000).toFixed(1).replace('.0', '')}M`;
};

// Simple cache to avoid redundant calculations
const streakCache = new Map<string, { result: number; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

// Clear caches when data is updated
export const clearStreakCaches = () => {
  streakCache.clear();
  longestStreakCache.clear();
};

// Calculate streak for a specific habit_id on a specific date - V2 using habit_id
export const calculateStreakForDate = (habitId: string, targetDate: Date, habitEndDate?: string | null): number => {
  try {
    const targetDateStr = targetDate.toISOString().split('T')[0];
    const cacheKey = `${habitId}-${targetDateStr}-${habitEndDate || 'no-end'}`;
    
    // Check cache first
    const cached = streakCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.result;
    }
    
    // Only log in development mode to reduce production noise
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      console.log(`Calculating streak for habit_id ${habitId} on ${targetDateStr}`);
    }
    
    const activities = getHabitActivities();
    
    // Filter activities for this habit_id, sorted by date (newest first)
    const habitActivities = activities
      .filter(activity => activity.habitId === habitId)
      .sort((a, b) => b.date.localeCompare(a.date));
    
    // Check if the target date was completed
    const targetActivity = habitActivities.find(activity => activity.date === targetDateStr);
    if (!targetActivity || targetActivity.status !== 'completed') {
      if (isDev) {
        console.log(`Target date ${targetDateStr} not completed for habit_id ${habitId}`);
      }
      const result = 0;
      streakCache.set(cacheKey, { result, timestamp: Date.now() });
      return result;
    }
    
    // Count consecutive days backwards from target date
    let streak = 0;
    let currentDate = new Date(targetDate);
    
    // If habit has ended, cap the streak calculation at the end date
    const endDate = habitEndDate ? new Date(habitEndDate) : null;
    
    while (true) {
      const currentDateStr = currentDate.toISOString().split('T')[0];
      
      // Stop counting if we've gone before the habit's end date
      if (endDate && currentDate < endDate) {
        if (isDev) {
          console.log(`Reached habit end date ${habitEndDate}, stopping streak count at: ${streak}`);
        }
        break;
      }
      
      const activity = habitActivities.find(a => a.date === currentDateStr);
      
      if (activity && activity.status === 'completed') {
        streak++;
        // Move to previous day
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (activity && activity.status === 'failed') {
        // Check if there's a recovery for this failed day using habitName for compatibility
        if (hasRecentRecovery(activity.habitName, currentDate)) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
          continue;
        }
        // Failed day breaks the streak (unless recovered)
        if (isDev) {
          console.log(`Day ${currentDateStr} failed, breaking streak at: ${streak}`);
        }
        break;
      } else {
        // Check if the date is in the future (this shouldn't break the streak)
        const now = new Date();
        if (currentDate > now) {
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
            if (isDev) {
              console.log(`Today (${todayStr}) has no activity yet but it's still early, continuing streak check`);
            }
            currentDate.setDate(currentDate.getDate() - 1);
            continue;
          }
        }
        
        // No activity recorded (empty) or past day without completion - this breaks the streak
        if (isDev) {
          console.log(`Day ${currentDateStr} has no completion, breaking streak at: ${streak}`);
        }
        break;
      }
      
      // Safety check to prevent infinite loops - but allow for very long streaks
      const daysDiff = Math.floor((targetDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 3650) { // Allow up to 10 years of streaks
        if (isDev) {
          console.log(`Safety break at ${daysDiff} days - very long streak detected`);
        }
        break;
      }
    }
    
    // Cache the result
    streakCache.set(cacheKey, { result: streak, timestamp: Date.now() });
    
    if (isDev) {
      console.log(`Final streak for habit_id ${habitId}: ${streak}`);
    }
    return streak;
  } catch (error) {
    console.error("Error calculating streak for date:", error);
    return 0;
  }
};

// Cache for longest streaks to avoid repeated calculations
const longestStreakCache = new Map<string, { result: number; timestamp: number }>();

// Calculate the longest streak ever achieved for a habit_id - V2 using habit_id
export const calculateLongestStreakV2 = (habitId: string): number => {
  try {
    // Check cache first
    const cached = longestStreakCache.get(habitId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.result;
    }

    const activities = getHabitActivities();
    
    // Filter and sort activities for this habit_id
    const habitActivities = activities
      .filter(activity => activity.habitId === habitId && activity.status === 'completed')
      .sort((a, b) => a.date.localeCompare(b.date));
    
    if (habitActivities.length === 0) {
      longestStreakCache.set(habitId, { result: 0, timestamp: Date.now() });
      return 0;
    }
    
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
    
    // Cache the result
    longestStreakCache.set(habitId, { result: longestStreak, timestamp: Date.now() });
    
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      console.log(`Longest streak for habit_id ${habitId}: ${longestStreak}`);
    }
    return longestStreak;
  } catch (error) {
    console.error("Error calculating longest streak:", error);
    return 0;
  }
};

// Calculate the overall longest streak across all habits - V2 using habit_id
export const calculateOverallLongestStreakV2 = (): { streak: number; habitId: string; habitName: string } => {
  try {
    const activities = getHabitActivities();
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
export const calculateStreakForDateByName = (habitName: string, targetDate: Date): number => {
  try {
    const activities = getHabitActivities();
    
    // Find the habit_id for this habitName
    const habitActivity = activities.find(a => a.habitName === habitName);
    if (habitActivity?.habitId) {
      return calculateStreakForDate(habitActivity.habitId, targetDate);
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
    const activities = getHabitActivities();
    
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