import { saveOfflineData, getOfflineData } from "./offlineStorage";
import { supabase } from "@/integrations/supabase/client";

export interface HabitActivityV2 {
  id: string;
  date: string; // ISO date string
  habitId: string; // UUID reference to habits table
  habitName: string; // Keep for UI display, but don't rely on for logic
  status: "completed" | "failed" | "empty";
}

// Create or get habit ID using smart matching
const findOrCreateHabitId = async (habitName: string): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Use the smart matching function
    const { data: habitId, error } = await supabase
      .rpc('find_or_create_habit', {
        p_user_id: user.id,
        p_name: habitName,
        p_description: null,
        p_category: getHabitCategory(habitName)
      });

    if (error) {
      console.error("Failed to find or create habit:", error);
      return null;
    }

    return habitId;
  } catch (error) {
    console.error("Failed to find or create habit ID:", error);
    return null;
  }
};

// Get category for default habits
const getHabitCategory = (habitName: string): string => {
  const categoryMap: Record<string, string> = {
    'Workout': 'Health & Fitness',
    'Devotions': 'Spiritual',
    'Read': 'Personal Development',
    'Sleep 8 Hours': 'Health & Fitness',
    'Drink Water': 'Health & Fitness',
    'Meditate': 'Mindfulness'
  };
  return categoryMap[habitName] || 'Personal';
};

// Record a habit activity using habit ID
export const recordHabitActivityV2 = async (
  habitName: string, 
  status: "completed" | "failed" | "empty", 
  date: Date = new Date()
): Promise<void> => {
  try {
    // Get or create habit ID
    const habitId = await findOrCreateHabitId(habitName);
    if (!habitId) {
      throw new Error("Failed to get habit ID");
    }

    // Import here to avoid circular dependency
    const { recordHabitActivityWithSyncV2 } = await import('./habitSynchronization');
    
    // Use the new sync method which handles both local storage and server synchronization
    await recordHabitActivityWithSyncV2(habitId, habitName, status, date);
    
    console.log(`Recorded habit: ${habitName} (ID: ${habitId}) as ${status} on ${date.toISOString().split('T')[0]}`);
  } catch (error) {
    console.error("Failed to record habit activity:", error);
  }
};

// Get all habit activities - updated format
export const getHabitActivitiesV2 = (): HabitActivityV2[] => {
  const offlineData = getOfflineData();
  return offlineData.habitActivitiesV2 || [];
};

// Migrate existing habit activities to new format
export const migrateHabitActivitiesToV2 = async (): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const offlineData = getOfflineData();
    const oldActivities = offlineData.habitActivities || [];
    const existingV2Activities = offlineData.habitActivitiesV2 || [];

    // Skip if already migrated
    if (existingV2Activities.length > 0 || oldActivities.length === 0) {
      return;
    }

    console.log(`Migrating ${oldActivities.length} habit activities to V2 format...`);

    // Get all habits to map names to IDs
    const { data: habits, error } = await supabase
      .from('habits')
      .select('id, name')
      .eq('user_id', user.id);

    if (error) {
      console.error("Failed to fetch habits for migration:", error);
      return;
    }

    const habitNameToId = new Map(habits?.map(h => [h.name.toLowerCase().trim(), h.id]) || []);

    // Convert old activities to new format
    const migratedActivities: HabitActivityV2[] = [];

    for (const oldActivity of oldActivities) {
      // Find habit ID using normalized name matching
      const normalizedName = oldActivity.habitName.toLowerCase().trim();
      let habitId = habitNameToId.get(normalizedName);

      // If not found, try to create it
      if (!habitId) {
        habitId = await findOrCreateHabitId(oldActivity.habitName);
      }

      if (habitId) {
        migratedActivities.push({
          id: oldActivity.id,
          date: oldActivity.date,
          habitId,
          habitName: oldActivity.habitName,
          status: oldActivity.status
        });
      }
    }

    // Save migrated activities
    saveOfflineData({ 
      habitActivitiesV2: migratedActivities,
      // Keep old activities for rollback if needed
      habitActivities: oldActivities 
    });

    console.log(`Successfully migrated ${migratedActivities.length} habit activities to V2 format`);
  } catch (error) {
    console.error("Failed to migrate habit activities:", error);
  }
};

// Load habit activities from database and sync with local storage
export const loadHabitActivitiesFromDatabaseV2 = async (): Promise<HabitActivityV2[]> => {
  try {
    // First migrate old data if needed
    await migrateHabitActivitiesToV2();

    // Import the synchronization module
    const { forceSyncFromServerV2 } = await import('./habitSynchronization');
    
    // Try to perform a full sync from server first
    const syncSuccess = await forceSyncFromServerV2();
    
    if (syncSuccess) {
      console.log("Successfully synced habit data from server (V2)");
    } else {
      console.log("Failed to sync from server, using local data (V2)");
    }
    
    // Return the current state from local storage (which will be updated if sync succeeded)
    return getHabitActivitiesV2();
  } catch (error) {
    console.error("Failed to load activities from database (V2):", error);
    // Fallback to local storage
    return getHabitActivitiesV2();
  }
};

// Check if habit has been completed in the last 30 days (using habit ID)
export const isHabitRecentlyActiveV2 = async (habitId: string): Promise<boolean> => {
  const activities = await loadHabitActivitiesFromDatabaseV2();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
  
  return activities.some(activity => 
    activity.habitId === habitId && 
    activity.status === 'completed' && 
    activity.date >= thirtyDaysAgoStr
  );
};

// Synchronous version for backward compatibility (using habit ID)
export const isHabitRecentlyActiveSyncV2 = (habitId: string): boolean => {
  const activities = getHabitActivitiesV2();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
  
  return activities.some(activity => 
    activity.habitId === habitId && 
    activity.status === 'completed' && 
    activity.date >= thirtyDaysAgoStr
  );
};

// Get activities for a specific habit by ID
export const getHabitActivitiesByIdV2 = (habitId: string): HabitActivityV2[] => {
  return getHabitActivitiesV2().filter(activity => activity.habitId === habitId);
};

// Get activities for a specific habit by name (for backward compatibility)
export const getHabitActivitiesByNameV2 = (habitName: string): HabitActivityV2[] => {
  const normalizedName = habitName.toLowerCase().trim();
  return getHabitActivitiesV2().filter(activity => 
    activity.habitName.toLowerCase().trim() === normalizedName
  );
};
