import { saveOfflineData, getOfflineData } from "./offlineStorage";
import { supabase } from "@/integrations/supabase/client";

export interface HabitActivity {
  id: string;
  date: string; // ISO date string
  habitName: string; 
  status: "completed" | "failed" | "empty";
}

// Create or update habit in database when it's tracked
const ensureHabitExists = async (habitName: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if habit already exists
    const { data: existingHabit } = await supabase
      .from('habits')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('name', habitName)
      .maybeSingle();

    if (!existingHabit) {
      // Create new habit as active
      await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          name: habitName,
          status: 'active',
          category: getHabitCategory(habitName)
        });
      console.log(`Created new habit: ${habitName}`);
    } else if (existingHabit.status === 'archived') {
      // Reactivate archived habit when it's being tracked again
      await supabase
        .from('habits')
        .update({ status: 'active' })
        .eq('id', existingHabit.id);
      console.log(`Reactivated habit: ${habitName}`);
    }
  } catch (error) {
    console.error("Failed to ensure habit exists:", error);
  }
};

// Get category for default habits
const getHabitCategory = (habitName: string): string => {
  const categoryMap: Record<string, string> = {
    'WORKOUT': 'Health & Fitness',
    'DEVOTIONS': 'Spiritual',
    'READ': 'Personal Development',
    'Sleep 8 Hours': 'Health & Fitness',
    'Drink Water': 'Health & Fitness',
    'Meditate': 'Mindfulness'
  };
  return categoryMap[habitName] || 'Personal';
};

// Record a habit activity - backward compatibility wrapper for the new sync system
export const recordHabitActivity = async (habitName: string, status: "completed" | "failed" | "empty", date: Date = new Date()): Promise<void> => {
  try {
    // Ensure habit exists in database when it's first tracked or completed
    if (status === "completed") {
      await ensureHabitExists(habitName);
    }

    // Import here to avoid circular dependency
    const { recordHabitActivityWithSync } = await import('./habitSynchronization');
    
    // Use the new sync method which handles both local storage and server synchronization
    await recordHabitActivityWithSync(habitName, status, date);
    
    console.log(`Recorded habit: ${habitName} as ${status} on ${date.toISOString().split('T')[0]}`);
  } catch (error) {
    console.error("Failed to record habit activity:", error);
  }
};

// Get all habit activities - synchronous for backward compatibility
export const getHabitActivities = (): HabitActivity[] => {
  const offlineData = getOfflineData();
  return offlineData.habitActivities || [];
};

// Load habit activities from database and sync with local storage
export const loadHabitActivitiesFromDatabase = async (): Promise<HabitActivity[]> => {
  try {
    // Import the synchronization module
    const { forceSyncFromServer } = await import('./habitSynchronization');
    
    // Try to perform a full sync from server first
    const syncSuccess = await forceSyncFromServer();
    
    if (syncSuccess) {
      console.log("Successfully synced habit data from server");
    } else {
      console.log("Failed to sync from server, using local data");
    }
    
    // Return the current state from local storage (which will be updated if sync succeeded)
    return getHabitActivities();
  } catch (error) {
    console.error("Failed to load activities from database:", error);
    // Fallback to local storage
    return getHabitActivities();
  }
};

// Check if habit has been completed in the last 30 days
export const isHabitRecentlyActive = async (habitName: string): Promise<boolean> => {
  const activities = await loadHabitActivitiesFromDatabase();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
  
  return activities.some(activity => 
    activity.habitName === habitName && 
    activity.status === 'completed' && 
    activity.date >= thirtyDaysAgoStr
  );
};

// Synchronous version for backward compatibility
export const isHabitRecentlyActiveSync = (habitName: string): boolean => {
  const activities = getHabitActivities();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
  
  return activities.some(activity => 
    activity.habitName === habitName && 
    activity.status === 'completed' && 
    activity.date >= thirtyDaysAgoStr
  );
};

// Auto-activate habits that have been completed in the last 30 days
export const autoActivateRecentHabits = async (): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const activities = await loadHabitActivitiesFromDatabase();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
    
    // Get unique habit names that were completed in the last 30 days
    const recentlyActiveHabits = [...new Set(
      activities
        .filter(activity => 
          activity.status === 'completed' && 
          activity.date >= thirtyDaysAgoStr
        )
        .map(activity => activity.habitName)
    )];

    if (recentlyActiveHabits.length > 0) {
      // Update habits to active status if they were completed recently
      const { error } = await supabase
        .from('habits')
        .update({ status: 'active' })
        .eq('user_id', user.id)
        .in('name', recentlyActiveHabits)
        .eq('status', 'archived');

      if (error) {
        console.error("Failed to auto-activate recent habits:", error);
      } else {
        console.log(`Auto-activated recently completed habits: ${recentlyActiveHabits.join(', ')}`);
      }
    }
  } catch (error) {
    console.error("Failed to auto-activate recent habits:", error);
  }
};
