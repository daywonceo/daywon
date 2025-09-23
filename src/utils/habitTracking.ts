// Export core functionality
export { 
  recordHabitActivity, 
  getHabitActivities, 
  getHabitActivitiesById,
  getHabitActivitiesByName,
  loadHabitActivitiesFromDatabase,
  // migrateHabitActivitiesToV2 no longer needed,
  type HabitActivity,
  isHabitRecentlyActiveSync
} from "./habitActivity";
export { calculateHabitStats, type HabitStats } from "./habitStats";
export { 
  calculateStreakForDate, 
  calculateLongestStreak, 
  calculateOverallLongestStreak,
  formatStreakNumber
} from "./habitStreaks";
export { initializeDefaultHabits, getHabitCategories } from "./habitCategories";
export { 
  initHabitSync, 
  synchronizeHabits,
  getSyncStatus,
  type SyncStats 
} from "./habitSynchronization";