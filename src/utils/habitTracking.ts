
// Re-export all functionality to maintain backward compatibility
export { recordHabitActivity, getHabitActivities, type HabitActivity } from "./habitActivity";
export { calculateHabitStats, type HabitStats } from "./habitStats";
export { 
  calculateStreakForDate, 
  calculateLongestStreak, 
  calculateOverallLongestStreak,
  formatStreakNumber 
} from "./habitStreaks";
export { initializeDefaultHabits, getHabitCategories } from "./habitCategories";

// Export V2 functionality for gradual migration
export { 
  recordHabitActivityV2, 
  getHabitActivitiesV2, 
  getHabitActivitiesByIdV2,
  getHabitActivitiesByNameV2,
  migrateHabitActivitiesToV2,
  type HabitActivityV2 
} from "./habitActivityV2";
export { 
  initHabitSyncV2, 
  synchronizeHabitsV2,
  getSyncStatusV2,
  type SyncStatsV2 
} from "./habitSynchronizationV2";
