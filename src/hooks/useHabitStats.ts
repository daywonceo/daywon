
import { useMemo } from 'react';
import { getHabitActivitiesV2 } from '@/utils/habitActivityV2';
import { calculateStreakForDateV2, calculateOverallLongestStreakV2 } from '@/utils/habitStreaksV2';

export const useHabitStats = (userHabits: string[] = ["WORKOUT", "DEVOTIONS", "READ"]) => {
  const stats = useMemo(() => {
    const now = new Date();
    const activities = getHabitActivitiesV2();
    
    // Calculate completion stats for the last 7 days
    let completedCount = 0;
    let totalPossible = 0;
    
    // Check each of the last 7 days (including today)
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const checkDate = new Date(now);
      checkDate.setDate(now.getDate() - dayOffset);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      userHabits.forEach(habit => {
        totalPossible++;
        // Find by habit_id if available, otherwise fallback to name
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
      });
    }
    
    const weeklyCompletionRate = totalPossible > 0 ? Math.round((completedCount / totalPossible) * 100) : 0;
    
    // Calculate current streaks for all habits using habit_id when available
    const currentStreaks = userHabits.map(habit => {
      // Find the habit_id for this habit name
      const habitActivity = activities.find(a => a.habitName === habit && a.habitId);
      if (habitActivity?.habitId) {
        return {
          habit,
          streak: calculateStreakForDateV2(habitActivity.habitId, now)
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
    const { streak: longestStreak, habitName: longestStreakHabit } = calculateOverallLongestStreakV2();
    
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
  }, [userHabits.join(',')]);

  return stats;
};
