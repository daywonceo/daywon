import { saveOfflineData, getOfflineData } from "./offlineStorage";
import { supabase } from "@/integrations/supabase/client";

export interface HabitActivity {
  id: string;
  date: string; // ISO date string
  habitName: string; 
  habitId?: string; // V2 field - will become required
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

// Record a habit activity - migrated to use V2 system with habit_id
export const recordHabitActivity = async (habitName: string, status: "completed" | "failed" | "empty", date: Date = new Date()): Promise<void> => {
  try {
    // Use the V2 system which handles habit_id properly
    const { recordHabitActivityV2 } = await import('./habitActivityV2');
    await recordHabitActivityV2(habitName, status, date);
    
    console.log(`Recorded habit: ${habitName} as ${status} on ${date.toISOString().split('T')[0]}`);
  } catch (error) {
    console.error("Failed to record habit activity:", error);
  }
};

// Get all habit activities - migrated to use V2 system
export const getHabitActivities = (): HabitActivity[] => {
  try {
    // Import V2 function and convert to V1 format for backward compatibility
    const { getHabitActivitiesV2 } = require('./habitActivityV2');
    const v2Activities = getHabitActivitiesV2();
    
    // Convert V2 format to V1 format for backward compatibility
    return v2Activities.map(v2Activity => ({
      id: v2Activity.id,
      date: v2Activity.date,
      habitName: v2Activity.habitName,
      habitId: v2Activity.habitId,
      status: v2Activity.status
    }));
  } catch (error) {
    console.error("Failed to get V2 activities, falling back to V1:", error);
    // Fallback to old system
    const offlineData = getOfflineData();
    return offlineData.habitActivities || [];
  }
};

// Load habit activities from database and sync - migrated to V2 system
export const loadHabitActivitiesFromDatabase = async (): Promise<HabitActivity[]> => {
  try {
    // Use V2 loading system which handles habit_id properly
    const { loadHabitActivitiesFromDatabaseV2 } = await import('./habitActivityV2');
    const v2Activities = await loadHabitActivitiesFromDatabaseV2();
    
    // Convert to V1 format for backward compatibility
    return v2Activities.map(v2Activity => ({
      id: v2Activity.id,
      date: v2Activity.date,
      habitName: v2Activity.habitName,
      habitId: v2Activity.habitId,
      status: v2Activity.status
    }));
  } catch (error) {
    console.error("Failed to load V2 activities from database:", error);
    // Fallback to local data
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
