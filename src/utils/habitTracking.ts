// Export core functionality
export { 
  recordHabitActivity, 
  getHabitActivities, 
  getHabitActivitiesByIdV2,
  getHabitActivitiesByNameV2,
  loadHabitActivitiesFromDatabase,
  migrateHabitActivitiesToV2,
  type HabitActivity,
  isHabitRecentlyActiveSyncV2 as isHabitRecentlyActiveSync
} from "./habitActivity";
export { calculateHabitStats, type HabitStats } from "./habitStats";
export { 
  calculateStreakForDateV2 as calculateStreakForDate, 
  calculateLongestStreakV2 as calculateLongestStreak, 
  calculateOverallLongestStreakV2 as calculateOverallLongestStreak,
  formatStreakNumber
} from "./habitStreaks";
export { initializeDefaultHabits, getHabitCategories } from "./habitCategories";
export { 
  initHabitSyncV2 as initHabitSync, 
  synchronizeHabitsV2 as synchronizeHabits,
  getSyncStatusV2 as getSyncStatus,
  type SyncStatsV2 as SyncStats 
} from "./habitSynchronization";