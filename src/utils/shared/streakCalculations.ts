import { differenceInDays, startOfDay } from "date-fns";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
}

export interface ActivityRecord {
  date: string | Date;
  status?: 'completed' | 'failed' | string;
}

/**
 * Calculate current and longest streak from activity records
 */
export function calculateStreaks(activities: ActivityRecord[]): StreakData {
  if (activities.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastActivityDate: null };
  }

  // Sort activities by date descending
  const sortedActivities = [...activities]
    .filter(a => !a.status || a.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sortedActivities.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastActivityDate: null };
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  const today = startOfDay(new Date());
  const mostRecentDate = startOfDay(new Date(sortedActivities[0].date));
  const lastActivityDate = new Date(sortedActivities[0].date);
  
  // Check if most recent activity is today or yesterday
  const daysSinceLastActivity = differenceInDays(today, mostRecentDate);
  
  if (daysSinceLastActivity <= 1) {
    currentStreak = 1;
    tempStreak = 1;
    
    // Calculate current streak
    for (let i = 1; i < sortedActivities.length; i++) {
      const currentDate = startOfDay(new Date(sortedActivities[i].date));
      const previousDate = startOfDay(new Date(sortedActivities[i - 1].date));
      const dayDiff = differenceInDays(previousDate, currentDate);
      
      if (dayDiff === 1) {
        currentStreak++;
        tempStreak++;
      } else {
        break;
      }
    }
  }
  
  // Calculate longest streak
  longestStreak = currentStreak;
  tempStreak = 1;
  
  for (let i = 1; i < sortedActivities.length; i++) {
    const currentDate = startOfDay(new Date(sortedActivities[i].date));
    const previousDate = startOfDay(new Date(sortedActivities[i - 1].date));
    const dayDiff = differenceInDays(previousDate, currentDate);
    
    if (dayDiff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }
  
  return { currentStreak, longestStreak, lastActivityDate };
}

/**
 * Calculate streak for a specific date
 */
export function calculateStreakForDate(activities: ActivityRecord[], targetDate: Date): number {
  const sortedActivities = [...activities]
    .filter(a => !a.status || a.status === 'completed')
    .filter(a => new Date(a.date) <= targetDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sortedActivities.length === 0) return 0;

  let streak = 1;
  const target = startOfDay(targetDate);
  
  for (let i = 1; i < sortedActivities.length; i++) {
    const currentDate = startOfDay(new Date(sortedActivities[i].date));
    const previousDate = startOfDay(new Date(sortedActivities[i - 1].date));
    const dayDiff = differenceInDays(previousDate, currentDate);
    
    if (dayDiff === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

/**
 * Check if streak is active (not broken)
 */
export function isStreakActive(lastActivityDate: Date | null): boolean {
  if (!lastActivityDate) return false;
  
  const today = startOfDay(new Date());
  const lastActivity = startOfDay(lastActivityDate);
  const daysSince = differenceInDays(today, lastActivity);
  
  return daysSince <= 1;
}

/**
 * Get next required activity date to maintain streak
 */
export function getNextRequiredDate(lastActivityDate: Date | null): Date {
  if (!lastActivityDate) return new Date();
  
  const nextDate = new Date(lastActivityDate);
  nextDate.setDate(nextDate.getDate() + 1);
  return nextDate;
}
