// Re-export V1 functionality for backward compatibility - habit_name based (legacy)
export { recordHabitActivity, getHabitActivities, type HabitActivity } from "./habitActivity";
export { calculateHabitStats, type HabitStats } from "./habitStats";
export { 
  calculateStreakForDate, 
  calculateLongestStreak, 
  calculateOverallLongestStreak
} from "./habitStreaks";
export { initializeDefaultHabits, getHabitCategories } from "./habitCategories";

// Export V2 functionality as primary - habit_id based system
export { 
  recordHabitActivityV2, 
  getHabitActivitiesV2, 
  getHabitActivitiesByIdV2,
  getHabitActivitiesByNameV2,
  loadHabitActivitiesFromDatabaseV2,
  migrateHabitActivitiesToV2,
  type HabitActivityV2 
} from "./habitActivityV2";
export { 
  initHabitSyncV2, 
  synchronizeHabitsV2,
  getSyncStatusV2,
  type SyncStatsV2 
} from "./habitSynchronizationV2";

// Export V2 streak functions as primary
export {
  calculateStreakForDateV2,
  calculateLongestStreakV2,
  calculateOverallLongestStreakV2,
  formatStreakNumber
} from "./habitStreaksV2";