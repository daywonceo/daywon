
import { useMemo } from 'react';
import { getHabitActivities } from '@/utils/habitActivity';

export interface ProgressPeriod {
  period: string;
  percentage: string;
  trend: 'up' | 'down';
  completedCount: number;
  totalPossible: number;
  previousCompletedCount: number;
  previousTotalPossible: number;
}

export const useHabitProgress = (userHabits: string[] = ["WORKOUT", "DEVOTIONS", "READ"]) => {
  const progressData = useMemo(() => {
    const activities = getHabitActivitiesV2();
    const now = new Date();
    
    // Helper function to get date range
    const getDateRange = (daysBack: number, offsetDays: number = 0) => {
      const endDate = new Date(now);
      endDate.setDate(now.getDate() - offsetDays);
      const startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - daysBack + 1);
      return { startDate, endDate };
    };

    // Helper function to count completions in date range
    const countCompletions = (startDate: Date, endDate: Date) => {
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      
      let completed = 0;
      let totalPossible = 0;
      
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        userHabits.forEach(habit => {
          totalPossible++;
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
            completed++;
          }
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return { completed, totalPossible };
    };

    // Calculate progress for different periods
    const periods: ProgressPeriod[] = [];

    // This week vs last week
    const thisWeek = getDateRange(7, 0);
    const lastWeek = getDateRange(7, 7);
    const thisWeekData = countCompletions(thisWeek.startDate, thisWeek.endDate);
    const lastWeekData = countCompletions(lastWeek.startDate, lastWeek.endDate);
    
    const thisWeekPercentage = thisWeekData.totalPossible > 0 
      ? (thisWeekData.completed / thisWeekData.totalPossible) * 100 
      : 0;
    const lastWeekPercentage = lastWeekData.totalPossible > 0 
      ? (lastWeekData.completed / lastWeekData.totalPossible) * 100 
      : 0;
    const weeklyChange = thisWeekPercentage - lastWeekPercentage;

    periods.push({
      period: "FROM LAST WEEK",
      percentage: `${Math.abs(Math.round(weeklyChange))}%`,
      trend: weeklyChange >= 0 ? 'up' : 'down',
      completedCount: thisWeekData.completed,
      totalPossible: thisWeekData.totalPossible,
      previousCompletedCount: lastWeekData.completed,
      previousTotalPossible: lastWeekData.totalPossible
    });

    // This month vs last month
    const thisMonth = getDateRange(30, 0);
    const lastMonth = getDateRange(30, 30);
    const thisMonthData = countCompletions(thisMonth.startDate, thisMonth.endDate);
    const lastMonthData = countCompletions(lastMonth.startDate, lastMonth.endDate);
    
    const thisMonthPercentage = thisMonthData.totalPossible > 0 
      ? (thisMonthData.completed / thisMonthData.totalPossible) * 100 
      : 0;
    const lastMonthPercentage = lastMonthData.totalPossible > 0 
      ? (lastMonthData.completed / lastMonthData.totalPossible) * 100 
      : 0;
    const monthlyChange = thisMonthPercentage - lastMonthPercentage;

    periods.push({
      period: "FROM LAST MONTH",
      percentage: `${Math.abs(Math.round(monthlyChange))}%`,
      trend: monthlyChange >= 0 ? 'up' : 'down',
      completedCount: thisMonthData.completed,
      totalPossible: thisMonthData.totalPossible,
      previousCompletedCount: lastMonthData.completed,
      previousTotalPossible: lastMonthData.totalPossible
    });

    // Last 6 months vs previous 6 months
    const last6Months = getDateRange(180, 0);
    const previous6Months = getDateRange(180, 180);
    const last6MonthsData = countCompletions(last6Months.startDate, last6Months.endDate);
    const previous6MonthsData = countCompletions(previous6Months.startDate, previous6Months.endDate);
    
    const last6MonthsPercentage = last6MonthsData.totalPossible > 0 
      ? (last6MonthsData.completed / last6MonthsData.totalPossible) * 100 
      : 0;
    const previous6MonthsPercentage = previous6MonthsData.totalPossible > 0 
      ? (previous6MonthsData.completed / previous6MonthsData.totalPossible) * 100 
      : 0;
    const sixMonthChange = last6MonthsPercentage - previous6MonthsPercentage;

    periods.push({
      period: "FROM LAST 6 MONTHS",
      percentage: `${Math.abs(Math.round(sixMonthChange))}%`,
      trend: sixMonthChange >= 0 ? 'up' : 'down',
      completedCount: last6MonthsData.completed,
      totalPossible: last6MonthsData.totalPossible,
      previousCompletedCount: previous6MonthsData.completed,
      previousTotalPossible: previous6MonthsData.totalPossible
    });

    // This year vs last year
    const thisYear = getDateRange(365, 0);
    const lastYear = getDateRange(365, 365);
    const thisYearData = countCompletions(thisYear.startDate, thisYear.endDate);
    const lastYearData = countCompletions(lastYear.startDate, lastYear.endDate);
    
    const thisYearPercentage = thisYearData.totalPossible > 0 
      ? (thisYearData.completed / thisYearData.totalPossible) * 100 
      : 0;
    const lastYearPercentage = lastYearData.totalPossible > 0 
      ? (lastYearData.completed / lastYearData.totalPossible) * 100 
      : 0;
    const yearlyChange = thisYearPercentage - lastYearPercentage;

    periods.push({
      period: "FROM LAST YEAR",
      percentage: `${Math.abs(Math.round(yearlyChange))}%`,
      trend: yearlyChange >= 0 ? 'up' : 'down',
      completedCount: thisYearData.completed,
      totalPossible: thisYearData.totalPossible,
      previousCompletedCount: lastYearData.completed,
      previousTotalPossible: lastYearData.totalPossible
    });

    return periods;
  }, [userHabits.join(',')]);

  return progressData;
};
