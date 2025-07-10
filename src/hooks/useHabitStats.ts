
import { useMemo } from 'react';
import { getHabitActivities } from '@/utils/habitActivity';
import { calculateStreakForDate, calculateOverallLongestStreak } from '@/utils/habitStreaks';

export const useHabitStats = (userHabits: string[] = ["WORKOUT", "DEVOTIONS", "READ"]) => {
  const stats = useMemo(() => {
    const now = new Date();
    const activities = getHabitActivities();
    
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
        const activity = activities.find(
          a => a.habitName === habit && a.date === dateStr && a.status === 'completed'
        );
        if (activity) {
          completedCount++;
        }
      });
    }
    
    const weeklyCompletionRate = totalPossible > 0 ? Math.round((completedCount / totalPossible) * 100) : 0;
    
    // Calculate current streaks for all habits
    const currentStreaks = userHabits.map(habit => ({
      habit,
      streak: calculateStreakForDate(habit, now)
    }));
    
    // Find the best (longest) current streak
    const bestStreak = Math.max(...currentStreaks.map(s => s.streak), 0);
    const bestStreakHabit = currentStreaks.find(s => s.streak === bestStreak)?.habit || '';
    
    // Calculate overall longest streak ever achieved
    const { streak: longestStreak, habitName: longestStreakHabit } = calculateOverallLongestStreak();
    
    // Calculate total completed habits for today
    const todayStr = now.toISOString().split('T')[0];
    const todayCompletedCount = userHabits.filter(habit => {
      const activity = activities.find(
        a => a.habitName === habit && a.date === todayStr && a.status === 'completed'
      );
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
