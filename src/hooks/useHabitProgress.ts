
import { useMemo } from 'react';
import { getHabitActivities } from '@/utils/habitActivity';
import { getUserTimeWindowSync } from '@/utils/userTimeWindow';
import { useHabits } from '@/hooks/useHabits';

export interface ProgressPeriod {
  period: string;
  percentage: string;
  trend: 'up' | 'down';
  completedCount: number;
  totalPossible: number;
  previousCompletedCount: number;
  previousTotalPossible: number;
}

export const useHabitProgress = (userHabits: string[] = ["Workout", "Devotions", "Read"]) => {
  const { habits } = useHabits();
  
  const progressData = useMemo(() => {
    // Safety check: return empty array if habits not loaded yet
    if (!habits || habits.length === 0) {
      return [];
    }
    
    const activities = getHabitActivities();
    const now = new Date();
    
    // Helper to calculate total possible tracking opportunities
    const calculatePossibleTracking = (startDate: Date, endDate: Date, activeHabits: any[]) => {
      let totalPossible = 0;
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        // Count each habit that existed on this day
        activeHabits.forEach(habit => {
          const habitCreatedAt = new Date(habit.created_at);
          if (habitCreatedAt <= currentDate) {
            totalPossible++;
          }
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return totalPossible;
    };

    // Helper to count completions in a date range
    const countCompletions = (startDate: Date, endDate: Date) => {
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      
      const periodActivities = activities.filter(a => {
        return a.date >= startStr && a.date <= endStr && a.status === 'completed';
      });
      
      return periodActivities.length;
    };

    // Get date range for a period
    const getDateRange = (days: number, offset: number = 0) => {
      const endDate = new Date(now);
      endDate.setDate(now.getDate() - offset);
      
      const startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - days + 1);
      
      return { startDate, endDate };
    };

    // Filter active habits that exist in the timeframe
    const getActiveHabitsInRange = (startDate: Date) => {
      return habits.filter(habit => {
        const habitCreatedAt = new Date(habit.created_at);
        return habit.status === 'active' && habitCreatedAt <= now;
      });
    };

    // Calculate progress for different periods
    const periods: ProgressPeriod[] = [];

    // This week vs last week
    const thisWeek = getDateRange(7, 0);
    const lastWeek = getDateRange(7, 7);
    
    const thisWeekHabits = getActiveHabitsInRange(thisWeek.startDate);
    const lastWeekHabits = getActiveHabitsInRange(lastWeek.startDate);
    
    const thisWeekCompleted = countCompletions(thisWeek.startDate, thisWeek.endDate);
    const thisWeekPossible = calculatePossibleTracking(thisWeek.startDate, thisWeek.endDate, thisWeekHabits);
    
    const lastWeekCompleted = countCompletions(lastWeek.startDate, lastWeek.endDate);
    const lastWeekPossible = calculatePossibleTracking(lastWeek.startDate, lastWeek.endDate, lastWeekHabits);
    
    const thisWeekPercentage = thisWeekPossible > 0 ? (thisWeekCompleted / thisWeekPossible) * 100 : 0;
    const lastWeekPercentage = lastWeekPossible > 0 ? (lastWeekCompleted / lastWeekPossible) * 100 : 0;
    const weeklyChange = thisWeekPercentage - lastWeekPercentage;

    periods.push({
      period: "FROM LAST WEEK",
      percentage: `${Math.abs(Math.round(weeklyChange))}%`,
      trend: weeklyChange >= 0 ? 'up' : 'down',
      completedCount: thisWeekCompleted,
      totalPossible: thisWeekPossible,
      previousCompletedCount: lastWeekCompleted,
      previousTotalPossible: lastWeekPossible
    });

    // This month vs last month
    const thisMonth = getDateRange(30, 0);
    const lastMonth = getDateRange(30, 30);
    
    const thisMonthHabits = getActiveHabitsInRange(thisMonth.startDate);
    const lastMonthHabits = getActiveHabitsInRange(lastMonth.startDate);
    
    const thisMonthCompleted = countCompletions(thisMonth.startDate, thisMonth.endDate);
    const thisMonthPossible = calculatePossibleTracking(thisMonth.startDate, thisMonth.endDate, thisMonthHabits);
    
    const lastMonthCompleted = countCompletions(lastMonth.startDate, lastMonth.endDate);
    const lastMonthPossible = calculatePossibleTracking(lastMonth.startDate, lastMonth.endDate, lastMonthHabits);
    
    const thisMonthPercentage = thisMonthPossible > 0 ? (thisMonthCompleted / thisMonthPossible) * 100 : 0;
    const lastMonthPercentage = lastMonthPossible > 0 ? (lastMonthCompleted / lastMonthPossible) * 100 : 0;
    const monthlyChange = thisMonthPercentage - lastMonthPercentage;

    periods.push({
      period: "FROM LAST MONTH",
      percentage: `${Math.abs(Math.round(monthlyChange))}%`,
      trend: monthlyChange >= 0 ? 'up' : 'down',
      completedCount: thisMonthCompleted,
      totalPossible: thisMonthPossible,
      previousCompletedCount: lastMonthCompleted,
      previousTotalPossible: lastMonthPossible
    });

    // Last 6 months vs previous 6 months
    const last6Months = getDateRange(180, 0);
    const previous6Months = getDateRange(180, 180);
    
    const last6MonthsHabits = getActiveHabitsInRange(last6Months.startDate);
    const previous6MonthsHabits = getActiveHabitsInRange(previous6Months.startDate);
    
    const last6MonthsCompleted = countCompletions(last6Months.startDate, last6Months.endDate);
    const last6MonthsPossible = calculatePossibleTracking(last6Months.startDate, last6Months.endDate, last6MonthsHabits);
    
    const previous6MonthsCompleted = countCompletions(previous6Months.startDate, previous6Months.endDate);
    const previous6MonthsPossible = calculatePossibleTracking(previous6Months.startDate, previous6Months.endDate, previous6MonthsHabits);
    
    const last6MonthsPercentage = last6MonthsPossible > 0 ? (last6MonthsCompleted / last6MonthsPossible) * 100 : 0;
    const previous6MonthsPercentage = previous6MonthsPossible > 0 ? (previous6MonthsCompleted / previous6MonthsPossible) * 100 : 0;
    const sixMonthChange = last6MonthsPercentage - previous6MonthsPercentage;

    periods.push({
      period: "FROM LAST 6 MONTHS",
      percentage: `${Math.abs(Math.round(sixMonthChange))}%`,
      trend: sixMonthChange >= 0 ? 'up' : 'down',
      completedCount: last6MonthsCompleted,
      totalPossible: last6MonthsPossible,
      previousCompletedCount: previous6MonthsCompleted,
      previousTotalPossible: previous6MonthsPossible
    });

    // This year vs last year
    const thisYear = getDateRange(365, 0);
    const lastYear = getDateRange(365, 365);
    
    const thisYearHabits = getActiveHabitsInRange(thisYear.startDate);
    const lastYearHabits = getActiveHabitsInRange(lastYear.startDate);
    
    const thisYearCompleted = countCompletions(thisYear.startDate, thisYear.endDate);
    const thisYearPossible = calculatePossibleTracking(thisYear.startDate, thisYear.endDate, thisYearHabits);
    
    const lastYearCompleted = countCompletions(lastYear.startDate, lastYear.endDate);
    const lastYearPossible = calculatePossibleTracking(lastYear.startDate, lastYear.endDate, lastYearHabits);
    
    const thisYearPercentage = thisYearPossible > 0 ? (thisYearCompleted / thisYearPossible) * 100 : 0;
    const lastYearPercentage = lastYearPossible > 0 ? (lastYearCompleted / lastYearPossible) * 100 : 0;
    const yearlyChange = thisYearPercentage - lastYearPercentage;

    periods.push({
      period: "FROM LAST YEAR",
      percentage: `${Math.abs(Math.round(yearlyChange))}%`,
      trend: yearlyChange >= 0 ? 'up' : 'down',
      completedCount: thisYearCompleted,
      totalPossible: thisYearPossible,
      previousCompletedCount: lastYearCompleted,
      previousTotalPossible: lastYearPossible
    });

    return periods;
  }, [userHabits.join(','), habits]);

  return progressData;
};
