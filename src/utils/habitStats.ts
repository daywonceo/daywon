
import { getHabitActivities, HabitActivity } from "./habitActivity";

export interface HabitStats {
  habitName: string;
  completed: number;
  failed: number;
  empty: number;
  total: number;
  percentage: number;
}

// Calculate habit statistics for the specified timeframe
export const calculateHabitStats = (timeframe: "week" | "month" | "year"): { goodHabits: HabitStats[], badHabits: HabitStats[] } => {
  try {
    const activities = getHabitActivities();
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
    
    // Group by habit name
    const habitGroups = filteredActivities.reduce<Record<string, HabitActivity[]>>((acc, activity) => {
      if (!acc[activity.habitName]) {
        acc[activity.habitName] = [];
      }
      acc[activity.habitName].push(activity);
      return acc;
    }, {});
    
    // Calculate statistics for each habit
    const allHabitStats: HabitStats[] = Object.keys(habitGroups).map(habitName => {
      const habitActivities = habitGroups[habitName];
      const completed = habitActivities.filter(a => a.status === "completed").length;
      const failed = habitActivities.filter(a => a.status === "failed").length;
      const empty = habitActivities.filter(a => a.status === "empty").length;
      const total = habitActivities.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return {
        habitName,
        completed,
        failed,
        empty,
        total,
        percentage
      };
    });
    
    // Sort by percentage and split into good and bad habits
    const sortedStats = [...allHabitStats].sort((a, b) => b.percentage - a.percentage);
    const halfIndex = Math.ceil(sortedStats.length / 2);
    
    return {
      goodHabits: sortedStats.slice(0, halfIndex),
      badHabits: sortedStats.slice(halfIndex).reverse() // Reverse to show worst first
    };
  } catch (error) {
    console.error("Error calculating habit stats:", error);
    return { goodHabits: [], badHabits: [] };
  }
};
