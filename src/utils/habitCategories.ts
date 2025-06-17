
import { saveOfflineData, getOfflineData } from "./offlineStorage";

// Initialize specific habit categories
export const initializeDefaultHabits = (): string[] => {
  const offlineData = getOfflineData();
  
  // Set our fixed habits
  const defaultCategories = ["WORKOUT", "DEVOTIONS", "READ"];
  
  // Only save if no categories exist or they don't match our fixed ones
  if (!offlineData.habitCategories || 
      !Array.isArray(offlineData.habitCategories) || 
      offlineData.habitCategories.length !== defaultCategories.length) {
    
    // Save default categories
    saveOfflineData({
      habitCategories: defaultCategories
    });
  }
  
  return defaultCategories;
};

// Get all habit categories
export const getHabitCategories = (): string[] => {
  const offlineData = getOfflineData();
  return offlineData.habitCategories || initializeDefaultHabits();
};
