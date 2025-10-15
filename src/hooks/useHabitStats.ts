
import { useMemo } from 'react';
import { getHabitActivities } from '@/utils/habitActivity';
import { calculateStreakForDate, calculateOverallLongestStreak } from '@/utils/habitStreaks';
import { useHabits } from '@/hooks/useHabits';
import { getUserTimeWindowSync } from '@/utils/userTimeWindow';

export const useHabitStats = (userHabits: string[] = ["Workout", "Devotions", "Read"]) => {
  const { habits } = useHabits();
  const stats = useMemo(() => {
    try {
    const now = new Date();
    const activities = getHabitActivities();
  
    // Get user-aware time window for weekly stats (7 days or since account creation)
    const { startDate: weekStartDate } = getUserTimeWindowSync("week");
    
    // Calculate completion stats considering habit creation dates
    let completedCount = 0;
    let totalPossible = 0;
    
    // For each habit, calculate expected days from creation date
    userHabits.forEach(habit => {
      const habitRecord = habits?.find(h => h.name.toLowerCase() === habit.toLowerCase());
      const habitCreated = habitRecord?.created_at ? new Date(habitRecord.created_at) : null;
      
      // Determine the effective start date for this habit (later of week start or habit creation)
      const effectiveStart = habitCreated && habitCreated > weekStartDate ? habitCreated : weekStartDate;
      
      // Calculate how many days this habit should have been tracked
      const daysSinceStart = Math.floor((now.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const expectedDays = Math.min(daysSinceStart, 7); // Cap at 7 days for weekly
      
      totalPossible += expectedDays;
      
      // Count completed days within the expected period
      for (let dayOffset = 0; dayOffset < expectedDays; dayOffset++) {
        const checkDate = new Date(now);
        checkDate.setDate(now.getDate() - dayOffset);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        // Only count explicitly completed activities
        const activity = activities.find(a => {
          if (a.habitId) {
            // Find the habit_id for this habit name
            const referenceActivity = activities.find(ref => ref.habitName === habit && ref.habitId);
            if (referenceActivity) {
              return a.habitId === referenceActivity.habitId && a.date === dateStr && a.status === 'completed';
            }
          }
          return a.habitName === habit && a.date === dateStr && a.status === 'completed';
        });
        if (activity) {
          completedCount++;
        }
      }
    });
    
    const weeklyCompletionRate = totalPossible > 0 ? Math.round((completedCount / totalPossible) * 100) : 0;
    
    // Calculate current streaks for all habits using habit_id when available
    const currentStreaks = userHabits.map(habit => {
      // Find the habit_id for this habit name
      const habitRecord = habits?.find(h => h.name.toLowerCase() === habit.toLowerCase());
      const habitActivity = activities.find(a => a.habitName === habit && a.habitId);
      if (habitActivity?.habitId) {
        return {
          habit,
          streak: calculateStreakForDate(habitActivity.habitId, now, habitRecord?.ended_at)
        };
      }
      // Fallback to name-based calculation
      return {
        habit,
        streak: 0
      };
    });
    
    // Find the best (longest) current streak
    const bestStreak = Math.max(...currentStreaks.map(s => s.streak), 0);
    const bestStreakHabit = currentStreaks.find(s => s.streak === bestStreak)?.habit || '';
    
    // Calculate overall longest streak ever achieved using V2 system
    const { streak: longestStreak, habitName: longestStreakHabit } = calculateOverallLongestStreak();
    
    // Calculate total completed habits for today using habit_id when available
    const todayStr = now.toISOString().split('T')[0];
    const todayCompletedCount = userHabits.filter(habit => {
      // Find by habit_id if available, otherwise fallback to name
      const activity = activities.find(a => {
        if (a.habitId) {
          // Find the habit_id for this habit name
          const referenceActivity = activities.find(ref => ref.habitName === habit && ref.habitId);
          if (referenceActivity) {
            return a.habitId === referenceActivity.habitId && a.date === todayStr && a.status === 'completed';
          }
        }
        return a.habitName === habit && a.date === todayStr && a.status === 'completed';
      });
      return !!activity;
    }).length;
    
      return {
        weeklyStats: {
          completedCount,
          totalPossible,
          percentage: weeklyCompletionRate
        },
        streakStats: {
          bestStreak,
          bestStreakHabit,
          currentStreaks,
          longestStreak,
          longestStreakHabit
        },
        todayStats: {
          completedCount: todayCompletedCount,
          totalHabits: userHabits.length
        }
      };
    } catch (error) {
      console.error('Error calculating habit stats:', error);
      // Return default stats on error
      return {
        weeklyStats: {
          completedCount: 0,
          totalPossible: 0,
          percentage: 0
        },
        streakStats: {
          bestStreak: 0,
          bestStreakHabit: '',
          currentStreaks: [],
          longestStreak: 0,
          longestStreakHabit: ''
        },
        todayStats: {
          completedCount: 0,
          totalHabits: userHabits.length
        }
      };
    }
  }, [userHabits.join(','), habits]);

  return stats;
};
