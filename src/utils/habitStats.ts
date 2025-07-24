
import { getHabitActivitiesV2, HabitActivityV2 } from "./habitActivityV2";

export interface HabitStats {
  habitName: string;
  completed: number;
  failed: number;
  empty: number;
  total: number;
  percentage: number;
  category: 'good' | 'bad' | 'in-progress';
}

// Calculate habit statistics for the specified timeframe with automatic categorization using habit_id
export const calculateHabitStats = (timeframe: "week" | "month" | "year"): { goodHabits: HabitStats[], badHabits: HabitStats[], inProgressHabits: HabitStats[] } => {
  try {
    const activities = getHabitActivitiesV2();
    const now = new Date();
    
    // Determine the start date based on timeframe
    let startDate: Date;
    switch (timeframe) {
      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    // Filter activities by date
    const startDateStr = startDate.toISOString().split('T')[0];
    const filteredActivities = activities.filter(
      activity => activity.date >= startDateStr
    );
    
    // Group by habit_id (primary) or habit_name (fallback for legacy data)
    const habitGroups = filteredActivities.reduce<Record<string, HabitActivityV2[]>>((acc, activity) => {
      // Use habit_id as primary key, fallback to habit_name for legacy data
      const groupKey = activity.habitId || activity.habitName;
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(activity);
      return acc;
    }, {});
    
    // Calculate statistics for each habit with automatic categorization
    const allHabitStats: HabitStats[] = Object.keys(habitGroups).map(groupKey => {
      const habitActivities = habitGroups[groupKey];
      const completed = habitActivities.filter(a => a.status === "completed").length;
      const failed = habitActivities.filter(a => a.status === "failed").length;
      const empty = habitActivities.filter(a => a.status === "empty").length;
      const total = habitActivities.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      // Automatic categorization based on completion percentage
      let category: 'good' | 'bad' | 'in-progress';
      if (percentage >= 70) {
        category = 'good';
      } else if (percentage < 40) {
        category = 'bad';
      } else {
        category = 'in-progress';
      }
      
      // Use the habit name from the first activity in the group (for display purposes)
      const habitName = habitActivities[0]?.habitName || groupKey;
      
      return {
        habitName,
        completed,
        failed,
        empty,
        total,
        percentage,
        category
      };
    });
    
    // Separate habits by category and sort by percentage
    const goodHabits = allHabitStats
      .filter(habit => habit.category === 'good')
      .sort((a, b) => b.percentage - a.percentage);
    
    const badHabits = allHabitStats
      .filter(habit => habit.category === 'bad')
      .sort((a, b) => a.percentage - b.percentage);
    
    const inProgressHabits = allHabitStats
      .filter(habit => habit.category === 'in-progress')
      .sort((a, b) => b.percentage - a.percentage);
    
    return {
      goodHabits,
      badHabits,
      inProgressHabits
    };
  } catch (error) {
    console.error("Error calculating habit stats:", error);
    return { goodHabits: [], badHabits: [], inProgressHabits: [] };
  }
};
