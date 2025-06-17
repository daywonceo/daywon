
import { useMemo } from 'react';
import { getHabitActivities } from '@/utils/habitActivity';
import { calculateStreakForDate } from '@/utils/habitStreaks';
import { useHabitActivities } from './useHabitActivities';

export const useHabitStats = () => {
  const { userHabits } = useHabitActivities();

  const stats = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
    
    const activities = getHabitActivities();
    
    // Calculate weekly completion stats
    let completedCount = 0;
    let totalPossible = 0;
    
    // Check each day of the current week (up to today)
    for (let dayOffset = 0; dayOffset <= now.getDay(); dayOffset++) {
      const checkDate = new Date(startOfWeek);
      checkDate.setDate(startOfWeek.getDate() + dayOffset);
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
        currentStreaks
      },
      todayStats: {
        completedCount: todayCompletedCount,
        totalHabits: userHabits.length
      }
    };
  }, [userHabits]);

  return stats;
};
