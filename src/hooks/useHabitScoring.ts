
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getHabitActivitiesV2 } from '@/utils/habitActivityV2';
import { calculateStreakForDateV2 } from '@/utils/habitStreaksV2';

export interface HabitScore {
  userId: string;
  scorePeriod: 'weekly' | 'monthly' | 'yearly';
  periodStart: string;
  periodEnd: string;
  consistencyRate: number;
  streakScore: number;
  varietyScore: number;
  recencyScore: number;
  totalScore: number;
  rankPosition?: number;
}

interface HabitDifficulty {
  habitName: string;
  difficultyLevel: 'high' | 'medium' | 'low';
  multiplier: number;
}

export const useHabitScoring = () => {
  const { user } = useAuth();
  const [habitDifficulties, setHabitDifficulties] = useState<HabitDifficulty[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch habit difficulties from database
  useEffect(() => {
    const fetchHabitDifficulties = async () => {
      const { data, error } = await supabase
        .from('habit_difficulty')
        .select('habit_name, difficulty_level, multiplier');
      
      if (error) {
        console.error('Error fetching habit difficulties:', error);
        return;
      }

      setHabitDifficulties(data.map(d => ({
        habitName: d.habit_name,
        difficultyLevel: d.difficulty_level as 'high' | 'medium' | 'low',
        multiplier: d.multiplier
      })));
    };

    fetchHabitDifficulties();
  }, []);

  const getHabitMultiplier = (habitName: string): number => {
    const difficulty = habitDifficulties.find(d => d.habitName === habitName);
    return difficulty?.multiplier || 1.0;
  };

  const calculateConsistencyRate = (period: 'weekly' | 'monthly' | 'yearly'): number => {
    const activities = getHabitActivitiesV2();
    const now = new Date();
    
    let startDate: Date;
    let daysInPeriod: number;
    
    switch (period) {
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        daysInPeriod = 7;
        break;
      case 'monthly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        daysInPeriod = 30;
        break;
      case 'yearly':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        daysInPeriod = 365;
        break;
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = now.toISOString().split('T')[0];

    // Get all completed activities in the period
    const completedActivities = activities.filter(
      activity => activity.status === 'completed' && 
                 activity.date >= startDateStr && 
                 activity.date <= endDateStr
    );

    // Calculate weighted completion rate using habit_id-first approach
    let totalWeightedCompletions = 0;
    let totalPossibleWeighted = 0;

    // Group by habit_id when available, fallback to habit_name (same pattern as streak calculation)
    const habitGroups = new Map<string, { habitName: string; habitId?: string }>();
    activities.forEach(activity => {
      const key = activity.habitId || activity.habitName;
      if (!habitGroups.has(key)) {
        habitGroups.set(key, { 
          habitName: activity.habitName, 
          habitId: activity.habitId 
        });
      }
    });

    habitGroups.forEach(({ habitName, habitId }) => {
      const multiplier = getHabitMultiplier(habitName);
      // Count completions for this habit group
      const habitCompletions = completedActivities.filter(a => {
        const activityKey = a.habitId || a.habitName;
        const groupKey = habitId || habitName;
        return activityKey === groupKey;
      }).length;
      
      totalWeightedCompletions += habitCompletions * multiplier;
      totalPossibleWeighted += daysInPeriod * multiplier;
    });

    return totalPossibleWeighted > 0 ? (totalWeightedCompletions / totalPossibleWeighted) * 100 : 0;
  };

  const calculateStreakScore = (): number => {
    const activities = getHabitActivitiesV2();
    const now = new Date();

    let maxWeightedStreak = 0;

    // Group by habit_id when available, fallback to habit_name
    const habitGroups = new Map<string, { habitName: string; habitId?: string }>();
    activities.forEach(activity => {
      const key = activity.habitId || activity.habitName;
      if (!habitGroups.has(key)) {
        habitGroups.set(key, { 
          habitName: activity.habitName, 
          habitId: activity.habitId 
        });
      }
    });

    habitGroups.forEach(({ habitName, habitId }) => {
      const streak = habitId 
        ? calculateStreakForDateV2(habitId, now)
        : 0; // Fallback for legacy data without habit_id
      const multiplier = getHabitMultiplier(habitName);
      const weightedStreak = streak * multiplier;
      
      if (weightedStreak > maxWeightedStreak) {
        maxWeightedStreak = weightedStreak;
      }
    });

    // Normalize to 100 (assuming 100 days as max streak)
    return Math.min((maxWeightedStreak / 100) * 100, 100);
  };

  const calculateVarietyScore = (): number => {
    const activities = getHabitActivitiesV2();
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);

    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    const nowStr = now.toISOString().split('T')[0];

    // Get completed activities this week
    const weeklyCompleted = activities
      .filter(a => 
        a.date >= weekAgoStr && 
        a.date <= nowStr && 
        a.status === 'completed'
      );
    
    // Count unique habits using habit_id when available, fallback to habit_name
    const uniqueHabits = new Set();
    weeklyCompleted.forEach(activity => {
      const key = activity.habitId || activity.habitName;
      uniqueHabits.add(key);
    });
    const uniqueHabitsCount = uniqueHabits.size;

    // Normalize variety to 100 (assuming 10 different habits as max variety)
    const maxVariety = 10;
    return Math.min((uniqueHabitsCount / maxVariety) * 100, 100);
  };

  const calculateRecencyScore = (): number => {
    const activities = getHabitActivitiesV2();
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);

    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    const nowStr = now.toISOString().split('T')[0];

    // Check if user completed at least 1 habit in the last 7 days
    const hasRecentActivity = activities.some(activity => 
      activity.status === 'completed' && 
      activity.date >= weekAgoStr && 
      activity.date <= nowStr
    );

    return hasRecentActivity ? 100 : 0;
  };

  const calculateHabitScore = (period: 'weekly' | 'monthly' | 'yearly'): HabitScore => {
    const consistencyRate = calculateConsistencyRate(period);
    const streakScore = calculateStreakScore();
    const varietyScore = calculateVarietyScore();
    const recencyScore = calculateRecencyScore();

    // Apply the formula: (Consistency × 45) + (Streak × 25) + (Variety × 20) + (Recency × 10)
    const totalScore = 
      (consistencyRate * 0.45) + 
      (streakScore * 0.25) + 
      (varietyScore * 0.20) + 
      (recencyScore * 0.10);

    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date = now;

    switch (period) {
      case 'weekly':
        periodStart = new Date(now);
        periodStart.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        periodStart = new Date(now);
        periodStart.setDate(now.getDate() - 30);
        break;
      case 'yearly':
        periodStart = new Date(now);
        periodStart.setFullYear(now.getFullYear() - 1);
        break;
    }

    return {
      userId: user?.id || '',
      scorePeriod: period,
      periodStart: periodStart.toISOString().split('T')[0],
      periodEnd: periodEnd.toISOString().split('T')[0],
      consistencyRate: Math.round(consistencyRate * 100) / 100,
      streakScore: Math.round(streakScore * 100) / 100,
      varietyScore: Math.round(varietyScore * 100) / 100,
      recencyScore: Math.round(recencyScore * 100) / 100,
      totalScore: Math.round(totalScore * 100) / 100
    };
  };

  const saveHabitScore = async (habitScore: HabitScore) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_habit_scores')
        .upsert({
          user_id: user.id,
          score_period: habitScore.scorePeriod,
          period_start: habitScore.periodStart,
          period_end: habitScore.periodEnd,
          consistency_rate: habitScore.consistencyRate,
          streak_score: habitScore.streakScore,
          variety_score: habitScore.varietyScore,
          recency_score: habitScore.recencyScore,
          total_score: habitScore.totalScore
        }, {
          onConflict: 'user_id,score_period,period_start'
        });

      if (error) {
        console.error('Error saving habit score:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAndSaveAllScores = async () => {
    if (!user) return;

    const weeklyScore = calculateHabitScore('weekly');
    const monthlyScore = calculateHabitScore('monthly');
    const yearlyScore = calculateHabitScore('yearly');

    await Promise.all([
      saveHabitScore(weeklyScore),
      saveHabitScore(monthlyScore),
      saveHabitScore(yearlyScore)
    ]);
  };

  return {
    calculateHabitScore,
    saveHabitScore,
    calculateAndSaveAllScores,
    isLoading,
    habitDifficulties
  };
};
