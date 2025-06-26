
// Re-export all functionality to maintain backward compatibility
export { recordHabitActivity, getHabitActivities, type HabitActivity } from "./habitActivity";
export { calculateHabitStats, type HabitStats } from "./habitStats";
export { 
  calculateStreakForDate, 
  calculateCurrentStreak, 
  calculateBestStreak, 
  formatStreakDisplay 
} from "./habitStreaks";
export { initializeDefaultHabits, getHabitCategories } from "./habitCategories";
