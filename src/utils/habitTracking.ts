// Export core functionality
export { 
  recordHabitActivityV2 as recordHabitActivity, 
  getHabitActivitiesV2 as getHabitActivities, 
  getHabitActivitiesByIdV2,
  getHabitActivitiesByNameV2,
  loadHabitActivitiesFromDatabaseV2 as loadHabitActivitiesFromDatabase,
  migrateHabitActivitiesToV2,
  type HabitActivityV2 as HabitActivity,
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