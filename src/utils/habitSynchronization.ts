import { supabase } from "@/integrations/supabase/client";
import { getOfflineData, saveOfflineData } from "@/utils/offlineStorage";
import { toast } from "@/hooks/use-toast";

// Streak cache management
export let streakCaches: Record<string, any> = {};

export const clearStreakCaches = () => {
  streakCaches = {};
};

// Define the HabitActivity interface for the V2 system
export interface HabitActivity {
  id: string;
  date: string; // YYYY-MM-DD format
  habitId: string;
  habitName: string;
  status: "completed" | "failed" | "empty";
}

// Synchronization state management
export interface SyncStats {
  lastSyncTime: number | null;
  pendingChanges: number;
  syncInProgress: boolean;
  lastSyncStatus: 'success' | 'error' | 'never';
}

let syncState: SyncStats = {
  lastSyncTime: null,
  pendingChanges: 0,
  syncInProgress: false,
  lastSyncStatus: 'never'
};

export const getSyncStatus = (): SyncStats => ({ ...syncState });

// Initialize habit synchronization system
export const initHabitSync = (): (() => void) => {
  // Listen for online status changes and sync when connection is restored
  const handleOnlineStatusChange = () => {
    if (navigator.onLine && syncState.pendingChanges > 0) {
      synchronizeHabits(true).catch(console.error);
    }
  };

  window.addEventListener('online', handleOnlineStatusChange);

  // Set up periodic sync every 30 seconds when online
  const syncInterval = setInterval(() => {
    if (navigator.onLine && syncState.pendingChanges > 0) {
      synchronizeHabits().catch(console.error);
    }
  }, 30000);

  // Cleanup function
  return () => {
    window.removeEventListener('online', handleOnlineStatusChange);
    clearInterval(syncInterval);
  };
};

// Enhanced online status handler
const handleOnlineStatusChangeV2 = () => {
  if (navigator.onLine && !syncState.syncInProgress && syncState.pendingChanges > 0) {
    console.log('📡 Back online! Syncing pending habit changes...');
    synchronizeHabits(true).catch(error => {
      console.error("Failed to sync on reconnect:", error);
    });
  }
};

// Main synchronization function with improved error handling
export const synchronizeHabits = async (forceSync: boolean = false): Promise<boolean> => {
  // Don't sync if already in progress
  if (syncState.syncInProgress && !forceSync) {
    console.log('⏸️ Sync already in progress, skipping...');
    return false;
  }

  // Don't sync if offline
  if (!navigator.onLine) {
    console.log('📡 Offline - cannot sync habits');
    return false;
  }

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.log('🔐 User not authenticated, skipping sync');
    return false;
  }

  try {
    syncState.syncInProgress = true;
    console.log('🔄 Starting habit synchronization (V2)...');

    // Get local data
    const offlineData = getOfflineData();
    const localActivities = offlineData.habitActivitiesV2 || [];
    
    // Filter activities that need to be synced (those with local IDs)
    const activitiesToSync = localActivities.filter(activity => 
      activity.id.startsWith('local-')
    );

    console.log(`📤 Found ${activitiesToSync.length} local activities to sync`);

    // Push local changes to server
    if (activitiesToSync.length > 0) {
      for (const activity of activitiesToSync) {
        try {
          // Check if this activity already exists on the server
          const { data: existingActivity } = await supabase
            .from('habit_activities')
            .select('id')
            .eq('user_id', user.id)
            .eq('habit_id', activity.habitId)
            .eq('activity_date', activity.date)
            .maybeSingle();

          if (existingActivity) {
            // Update existing activity
            const { error: updateError } = await supabase
              .from('habit_activities')
              .update({
                status: activity.status,
                habit_name: activity.habitName,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingActivity.id);

            if (updateError) {
              console.error(`❌ Failed to update activity for ${activity.habitName} on ${activity.date}:`, updateError);
              continue;
            }

            console.log(`✅ Updated activity for ${activity.habitName} on ${activity.date}`);
          } else {
            // Create new activity
            const { error: insertError } = await supabase
              .from('habit_activities')
              .insert({
                user_id: user.id,
                habit_id: activity.habitId,
                habit_name: activity.habitName,
                activity_date: activity.date,
                status: activity.status
              });

            if (insertError) {
              console.error(`❌ Failed to insert activity for ${activity.habitName} on ${activity.date}:`, insertError);
              continue;
            }

            console.log(`✅ Created activity for ${activity.habitName} on ${activity.date}`);
          }

          // Update local activity with server ID (remove local- prefix)
          const localIndex = localActivities.findIndex(a => a.id === activity.id);
          if (localIndex >= 0) {
            localActivities[localIndex].id = `${activity.habitId}-${activity.date}`;
          }

        } catch (error) {
          console.error(`❌ Failed to sync activity for ${activity.habitName}:`, error);
        }
      }

      // Save updated local data
      saveOfflineData({ habitActivitiesV2: localActivities });
      console.log('💾 Updated local storage with synced activities');
    }

    // Pull server changes
    const { data: serverActivities, error: fetchError } = await supabase
      .from('habit_activities')
      .select('id, habit_id, habit_name, activity_date, status')
      .eq('user_id', user.id)
      .gte('activity_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // Last 30 days

    if (fetchError) {
      console.error('❌ Failed to fetch server activities:', fetchError);
      syncState.lastSyncStatus = 'error';
      return false;
    }

    // Merge server data with local data
    if (serverActivities && serverActivities.length > 0) {
      console.log(`📥 Received ${serverActivities.length} activities from server`);
      
      // Convert server format to local format and merge
      const mergedActivities = [...localActivities];
      
      for (const serverActivity of serverActivities) {
        const existingIndex = mergedActivities.findIndex(local => 
          local.habitId === serverActivity.habit_id && 
          local.date === serverActivity.activity_date
        );
        
        const localActivity: HabitActivity = {
          id: `${serverActivity.habit_id}-${serverActivity.activity_date}`,
          date: serverActivity.activity_date,
          habitId: serverActivity.habit_id,
          habitName: serverActivity.habit_name,
          status: serverActivity.status as "completed" | "failed" | "empty"
        };
        
        if (existingIndex >= 0) {
          // Update existing local activity with server data (server is source of truth)
          mergedActivities[existingIndex] = localActivity;
        } else {
          // Add new activity from server
          mergedActivities.push(localActivity);
        }
      }
      
      // Save merged data
      saveOfflineData({ habitActivitiesV2: mergedActivities });
      console.log('💾 Merged server data with local storage');
    }

    // Update sync state
    syncState.lastSyncTime = Date.now();
    syncState.pendingChanges = 0;
    syncState.lastSyncStatus = 'success';
    
    console.log('✅ Habit synchronization completed successfully (V2)');
    
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('habitDataSyncedV2'));
    
    return true;
  } catch (error) {
    console.error("❌ Habit synchronization failed (V2):", error);
    syncState.lastSyncStatus = 'error';
    return false;
  } finally {
    syncState.syncInProgress = false;
  }
};

// Function to record a habit activity with improved error handling and sync
export const recordHabitActivityWithSyncV2 = async (
  habitId: string,
  habitName: string,
  status: "completed" | "failed" | "empty", 
  date: Date = new Date()
): Promise<boolean> => {
  try {
    const dateStr = date.toISOString().split('T')[0];
    const offlineData = getOfflineData();
    const activities = offlineData.habitActivitiesV2 || [];
    
    // Create a local ID that indicates it needs to be synced
    const localId = `local-${habitId}-${dateStr}-${Date.now()}`;
    
    // Check if there's an existing entry for this habit and date
    const existingIndex = activities.findIndex(
      activity => activity.habitId === habitId && activity.date === dateStr
    );
    
    // Create or update the activity
    const activity: HabitActivity = {
      id: localId,
      date: dateStr,
      habitId,
      habitName,
      status
    };
    
    // Update or add the activity in local storage
    if (existingIndex >= 0) {
      activities[existingIndex] = activity;
    } else {
      activities.push(activity);
    }
    
    // Save to local storage immediately
    saveOfflineData({ habitActivitiesV2: activities });
    
    // Clear streak caches when habit data is updated
    clearStreakCaches();
    
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('habitStatusChangedV2', { 
      detail: { habitId, habitName, status, date: dateStr } 
    }));
    
    // Try to sync immediately if online
    if (navigator.onLine) {
      // Attempt to sync with server in the background
      synchronizeHabits(true).catch(error => {
        console.error("Background sync failed (V2):", error);
      });
    } else {
      // Increase pending changes count
      syncState.pendingChanges++;
      
      // Show offline toast
      toast({
        title: "You're offline",
        description: "Habit changes will be saved when you reconnect.",
        duration: 3000,
      });
    }
    
    return true;
  } catch (error) {
    console.error("Failed to record habit activity (V2):", error);
    
    // Show error toast
    toast({
      title: "Failed to save",
      description: "There was an error saving your habit progress.",
      variant: "destructive",
    });
    
    return false;
  }
};

// Force sync from server - useful after login or when data seems inconsistent
export const forceSyncFromServerV2 = async (): Promise<boolean> => {
  try {
    console.log('🔄 Force syncing from server (V2)...');
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('🔐 User not authenticated, cannot force sync');
      return false;
    }

    // Fetch all habit activities from server (last 90 days)
    const { data: serverActivities, error: fetchError } = await supabase
      .from('habit_activities')
      .select('id, habit_id, habit_name, activity_date, status')
      .eq('user_id', user.id)
      .gte('activity_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    if (fetchError) {
      console.error('❌ Failed to fetch activities from server:', fetchError);
      return false;
    }

    // Convert to local format
    const localActivities: HabitActivity[] = (serverActivities || []).map(serverActivity => ({
      id: `${serverActivity.habit_id}-${serverActivity.activity_date}`,
      date: serverActivity.activity_date,
      habitId: serverActivity.habit_id,
      habitName: serverActivity.habit_name,
      status: serverActivity.status as "completed" | "failed" | "empty"
    }));

    // Replace local data with server data
    saveOfflineData({ habitActivitiesV2: localActivities });
    
    // Clear caches
    clearStreakCaches();
    
    // Update sync state
    syncState.lastSyncTime = Date.now();
    syncState.pendingChanges = 0;
    syncState.lastSyncStatus = 'success';
    
    console.log(`✅ Force sync complete: ${localActivities.length} activities loaded from server (V2)`);
    
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('habitDataSyncedV2'));
    
    return true;
    
  } catch (error) {
    console.error("Force sync failed (V2):", error);
    return false;
  }
};

// MUCH MORE CONSERVATIVE end-of-day processing - only processes truly missing habits
export const processEndOfDayHabits = async (daysToProcess: number = 3): Promise<void> => {
  try {
    console.log(`🌙 Processing end-of-day habits for the last ${daysToProcess} days (V2 - Conservative Mode)...`);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('❌ No user logged in, skipping end-of-day processing');
      return;
    }

    // Get the current date and time
    const now = new Date();
    
    // Only process days that are at least 6 hours old to give users time
    const datesToProcess: string[] = [];
    for (let daysBack = 1; daysBack <= daysToProcess; daysBack++) {
      const date = new Date(now);
      date.setDate(now.getDate() - daysBack);
      
      // Skip if the date is less than 6 hours old
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      const hoursSinceEndOfDay = (now.getTime() - endOfDay.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceEndOfDay < 6) {
        console.log(`⏭️ Skipping ${date.toISOString().split('T')[0]} (only ${hoursSinceEndOfDay.toFixed(1)} hours old, waiting for 6h grace period)`);
        continue;
      }
      
      const dateStr = date.toISOString().split('T')[0];
      datesToProcess.push(dateStr);
    }
    
    if (datesToProcess.length === 0) {
      console.log('📅 No dates old enough to process (6 hour grace period)');
      return;
    }
    
    console.log(`📅 Processing habits for dates: ${datesToProcess.join(', ')}`);
    
    // Get all active habits from the database
    const { data: activeHabits, error: habitsError } = await supabase
      .from('habits')
      .select('id, name, created_at')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .is('ended_at', null)
      .is('archived_at', null);

    if (habitsError) {
      console.error('❌ Failed to fetch active habits:', habitsError);
      return;
    }

    if (!activeHabits || activeHabits.length === 0) {
      console.log('📝 No active habits found');
      return;
    }

    console.log(`📋 Found ${activeHabits.length} active habits:`, activeHabits.map(h => h.name).join(', '));

    const offlineData = getOfflineData();
    const activities = offlineData.habitActivitiesV2 || [];
    
    console.log(`💾 Current local activities count: ${activities.length}`);
    
    let changesDetected = false;
    let totalProcessedCount = 0;
    const processedByDate: Record<string, number> = {};
    
    // Process each date
    for (const dateStr of datesToProcess) {
      let dateProcessedCount = 0;
      
      // For each active habit, check if there's an activity for this date
      for (const habit of activeHabits) {
        // Check if the habit existed on this date (don't mark habits as failed before they were created)
        const habitCreatedDate = new Date(habit.created_at);
        const processDate = new Date(dateStr);
        
        if (processDate < habitCreatedDate) {
          console.log(`⏭️ Skipping habit "${habit.name}" for ${dateStr} (habit created later: ${habit.created_at})`);
          continue;
        }
        
        const existingActivity = activities.find(
          a => a.habitId === habit.id && a.date === dateStr
        );
        
        console.log(`🔍 Checking habit "${habit.name}" (${habit.id}) for ${dateStr}:`, 
          existingActivity ? `Found: ${existingActivity.status}` : 'Not found');
        
        // CONSERVATIVE APPROACH: Only mark as failed if there's absolutely no record
        // and don't touch anything that already has a status (completed, failed, or even empty)
        if (!existingActivity) {
          // Only create failed entry if no record exists at all
          const newActivity: HabitActivity = {
            id: `local-${habit.id}-${dateStr}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            date: dateStr,
            habitId: habit.id,
            habitName: habit.name,
            status: "failed"
          };
          
          activities.push(newActivity);
          changesDetected = true;
          dateProcessedCount++;
          totalProcessedCount++;
          
          console.log(`❌ Marked habit "${habit.name}" (${habit.id}) as failed for ${dateStr} (no activity record found after grace period)`);
        } else if (existingActivity.status === "completed") {
          console.log(`✅ Habit "${habit.name}" was already completed for ${dateStr}`);
        } else if (existingActivity.status === "failed") {
          console.log(`❌ Habit "${habit.name}" was already failed for ${dateStr}`);
        } else if (existingActivity.status === "empty") {
          console.log(`⭕ Habit "${habit.name}" was marked empty for ${dateStr} - respecting user's choice`);
        }
      }
      
      processedByDate[dateStr] = dateProcessedCount;
      if (dateProcessedCount > 0) {
        console.log(`📅 ${dateStr}: Marked ${dateProcessedCount} habits as failed`);
      }
    }
    
    // Save changes if any were made
    if (changesDetected) {
      console.log(`💾 Saving ${totalProcessedCount} habit changes across ${Object.keys(processedByDate).filter(date => processedByDate[date] > 0).length} dates to local storage...`);
      saveOfflineData({ habitActivitiesV2: activities });
      
      // Clear streak caches since we've updated data
      clearStreakCaches();
      
      // Try to sync the failed activities to the server
      if (navigator.onLine) {
        console.log('🔄 Syncing end-of-day changes to server...');
        synchronizeHabits(true).catch(error => {
          console.error('❌ Failed to sync end-of-day changes:', error);
        });
      } else {
        console.log('📡 Offline - changes will sync when connection is restored');
      }
      
      // Notify the application that data has changed
      window.dispatchEvent(new CustomEvent('habitEndOfDayProcessedV2', {
        detail: { 
          datesProcessed: datesToProcess,
          habitsProcessed: totalProcessedCount, 
          totalHabits: activeHabits.length,
          processedByDate 
        }
      }));
      
      // Also dispatch a general data update event for UI refresh
      window.dispatchEvent(new CustomEvent('habitDataUpdatedV2'));
      
      console.log(`✅ Conservative end-of-day processing complete: ${totalProcessedCount} habits marked as failed across ${datesToProcess.length} dates`);
      console.log('📊 Summary by date:', processedByDate);
    } else {
      console.log(`✨ No changes needed for end-of-day processing (${datesToProcess.join(', ')}) - all habits already logged`);
    }
  } catch (error) {
    console.error("❌ Failed to process end-of-day habits (V2):", error);
  }
};