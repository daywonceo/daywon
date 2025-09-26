
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

    // Helper function to count completions in date range with consistent total possible
    const countCompletions = (startDate: Date, endDate: Date, referenceHabits: string[]) => {
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      
      let completed = 0;
      let totalPossible = 0;
      
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        referenceHabits.forEach(habit => {
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

    // This week vs last week (using current habits for both periods)
    const thisWeek = getDateRange("week", 0);
    const lastWeek = getDateRange("week", 7);
    const thisWeekData = countCompletions(thisWeek.startDate, thisWeek.endDate, userHabits);
    const lastWeekData = countCompletions(lastWeek.startDate, lastWeek.endDate, userHabits);
    
    // Calculate consistent total possible for fair comparison
    const weekDays = Math.ceil((thisWeek.endDate.getTime() - thisWeek.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const weekTotalPossible = userHabits.length * weekDays;
    
    const thisWeekPercentage = weekTotalPossible > 0 
      ? (thisWeekData.completed / weekTotalPossible) * 100 
      : 0;
    const lastWeekPercentage = weekTotalPossible > 0 
      ? (lastWeekData.completed / weekTotalPossible) * 100 
      : 0;
    const weeklyChange = thisWeekPercentage - lastWeekPercentage;

    periods.push({
      period: "FROM LAST WEEK",
      percentage: `${Math.abs(Math.round(weeklyChange))}%`,
      trend: weeklyChange >= 0 ? 'up' : 'down',
      completedCount: thisWeekData.completed,
      totalPossible: weekTotalPossible,
      previousCompletedCount: lastWeekData.completed,
      previousTotalPossible: weekTotalPossible
    });

    // This month vs last month (using current habits for both periods)
    const thisMonth = getDateRange("month", 0);
    const lastMonth = getDateRange("month", 30);
    const thisMonthData = countCompletions(thisMonth.startDate, thisMonth.endDate, userHabits);
    const lastMonthData = countCompletions(lastMonth.startDate, lastMonth.endDate, userHabits);
    
    // Calculate consistent total possible for fair comparison
    const monthDays = Math.ceil((thisMonth.endDate.getTime() - thisMonth.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const monthTotalPossible = userHabits.length * monthDays;
    
    const thisMonthPercentage = monthTotalPossible > 0 
      ? (thisMonthData.completed / monthTotalPossible) * 100 
      : 0;
    const lastMonthPercentage = monthTotalPossible > 0 
      ? (lastMonthData.completed / monthTotalPossible) * 100 
      : 0;
    const monthlyChange = thisMonthPercentage - lastMonthPercentage;

    periods.push({
      period: "FROM LAST MONTH",
      percentage: `${Math.abs(Math.round(monthlyChange))}%`,
      trend: monthlyChange >= 0 ? 'up' : 'down',
      completedCount: thisMonthData.completed,
      totalPossible: monthTotalPossible,
      previousCompletedCount: lastMonthData.completed,
      previousTotalPossible: monthTotalPossible
    });

    // Last 6 months vs previous 6 months (using current habits for both periods)
    const last6Months = getDateRange("year", 0); // Use year logic but limit to 6 months data
    const previous6Months = getDateRange("year", 180);
    const last6MonthsData = countCompletions(last6Months.startDate, last6Months.endDate, userHabits);
    const previous6MonthsData = countCompletions(previous6Months.startDate, previous6Months.endDate, userHabits);
    
    // Calculate consistent total possible for fair comparison (6 months = ~180 days)
    const sixMonthsDays = Math.ceil((last6Months.endDate.getTime() - last6Months.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const sixMonthsTotalPossible = userHabits.length * sixMonthsDays;
    
    const last6MonthsPercentage = sixMonthsTotalPossible > 0 
      ? (last6MonthsData.completed / sixMonthsTotalPossible) * 100 
      : 0;
    const previous6MonthsPercentage = sixMonthsTotalPossible > 0 
      ? (previous6MonthsData.completed / sixMonthsTotalPossible) * 100 
      : 0;
    const sixMonthChange = last6MonthsPercentage - previous6MonthsPercentage;

    periods.push({
      period: "FROM LAST 6 MONTHS",
      percentage: `${Math.abs(Math.round(sixMonthChange))}%`,
      trend: sixMonthChange >= 0 ? 'up' : 'down',
      completedCount: last6MonthsData.completed,
      totalPossible: sixMonthsTotalPossible,
      previousCompletedCount: previous6MonthsData.completed,
      previousTotalPossible: sixMonthsTotalPossible
    });

    // This year vs last year (using current habits for both periods)
    const thisYear = getDateRange("year", 0);
    const lastYear = getDateRange("year", 365);
    const thisYearData = countCompletions(thisYear.startDate, thisYear.endDate, userHabits);
    const lastYearData = countCompletions(lastYear.startDate, lastYear.endDate, userHabits);
    
    // Calculate consistent total possible for fair comparison
    const yearDays = Math.ceil((thisYear.endDate.getTime() - thisYear.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const yearTotalPossible = userHabits.length * yearDays;
    
    const thisYearPercentage = yearTotalPossible > 0 
      ? (thisYearData.completed / yearTotalPossible) * 100 
      : 0;
    const lastYearPercentage = yearTotalPossible > 0 
      ? (lastYearData.completed / yearTotalPossible) * 100 
      : 0;
    const yearlyChange = thisYearPercentage - lastYearPercentage;

    periods.push({
      period: "FROM LAST YEAR",
      percentage: `${Math.abs(Math.round(yearlyChange))}%`,
      trend: yearlyChange >= 0 ? 'up' : 'down',
      completedCount: thisYearData.completed,
      totalPossible: yearTotalPossible,
      previousCompletedCount: lastYearData.completed,
      previousTotalPossible: yearTotalPossible
    });

    return periods;
  }, [userHabits.join(',')]);

  return progressData;
};
