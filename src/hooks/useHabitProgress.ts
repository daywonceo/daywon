
import { useMemo } from 'react';
import { getHabitActivities } from '@/utils/habitActivity';
import { getUserTimeWindowSync } from '@/utils/userTimeWindow';

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
  const progressData = useMemo(() => {
    const activities = getHabitActivities();
    const now = new Date();
    
    // Helper function to get user-aware date range
    const getDateRange = (timeframe: "week" | "month" | "year", offsetDays: number = 0) => {
      // Get base time window for this timeframe
      const { startDate: baseStartDate, totalDaysAvailable } = getUserTimeWindowSync(timeframe);
      
      const endDate = new Date(now);
      endDate.setDate(now.getDate() - offsetDays);
      
      // Calculate actual start date for this specific period
      let daysInPeriod: number;
      switch (timeframe) {
        case "week": daysInPeriod = 7; break;
        case "month": daysInPeriod = 30; break;
        case "year": daysInPeriod = 365; break;
      }
      
      const startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - daysInPeriod + 1);
      
      // Ensure we don't go before user's account creation
      if (startDate < baseStartDate) {
        return { startDate: baseStartDate, endDate };
      }
      
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
          // NEW RULE: Only explicitly completed habits count as success
          // Missing check-ins (no activity) are treated as incomplete
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
          // Note: No activity found (empty) is treated as not completed (no increment)
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return { completed, totalPossible };
    };

    // Calculate progress for different periods
    const periods: ProgressPeriod[] = [];

    // This week vs last week
    const thisWeek = getDateRange("week", 0);
    const lastWeek = getDateRange("week", 7);
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
    const thisMonth = getDateRange("month", 0);
    const lastMonth = getDateRange("month", 30);
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
    const last6Months = getDateRange("year", 0); // Use year logic but limit to 6 months data
    const previous6Months = getDateRange("year", 180);
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
    const thisYear = getDateRange("year", 0);
    const lastYear = getDateRange("year", 365);
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
