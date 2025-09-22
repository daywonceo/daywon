import { supabase } from "@/integrations/supabase/client";
import { saveOfflineData, getOfflineData } from "./offlineStorage";
import { toast } from "@/hooks/use-toast";
import { HabitActivityV2 } from "./habitActivityV2";
import { clearStreakCaches } from "./habitStreaksV2";

// Define constants for synchronization
const SYNC_INTERVAL = 60 * 1000; // 1 minute
const LAST_SYNC_KEY_V2 = 'last_habit_sync_v2';
const DAY_BOUNDARY_HOUR = 4; // 4 AM local time as day boundary

export interface SyncStatsV2 {
  lastSyncTime: Date | null;
  pendingChanges: number;
  syncInProgress: boolean;
  lastSyncStatus: 'success' | 'error' | 'none';
}

// Track synchronization state
let syncStateV2: SyncStatsV2 = {
  lastSyncTime: null,
  pendingChanges: 0,
  syncInProgress: false,
  lastSyncStatus: 'none'
};

// Get the current status of synchronization
export const getSyncStatusV2 = (): SyncStatsV2 => {
  return { ...syncStateV2 };
};

// Initialize the sync system
export const initHabitSyncV2 = () => {
  // Set up listeners for online status changes
  window.addEventListener('online', handleOnlineStatusChangeV2);
  
  // Start the sync interval
  const interval = setInterval(synchronizeHabitsV2, SYNC_INTERVAL);
  
  // Get last sync time from storage
  const lastSyncStr = localStorage.getItem(LAST_SYNC_KEY_V2);
  if (lastSyncStr) {
    try {
      syncStateV2.lastSyncTime = new Date(JSON.parse(lastSyncStr));
    } catch (e) {
      console.error("Failed to parse last sync time V2", e);
    }
  }
  
  // Run an initial sync
  synchronizeHabitsV2();
  
  // Return cleanup function
  return () => {
    clearInterval(interval);
    window.removeEventListener('online', handleOnlineStatusChangeV2);
  };
};

// Handle device coming back online
const handleOnlineStatusChangeV2 = () => {
  if (navigator.onLine) {
    console.log("Device is back online, triggering habit sync V2");
    synchronizeHabitsV2();
  }
};

// Main synchronization function
export const synchronizeHabitsV2 = async (forceSync = false): Promise<boolean> => {
  // Skip if offline or sync already in progress
  if (!navigator.onLine || (syncStateV2.syncInProgress && !forceSync)) {
    return false;
  }
  
  try {
    syncStateV2.syncInProgress = true;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      syncStateV2.syncInProgress = false;
      return false;
    }
    
    // Get local habit activities (V2 format)
    const offlineData = getOfflineData();
    const localActivities = offlineData.habitActivitiesV2 || [];
    
    // Flag to check if any changes were made
    let changesDetected = false;
    
    // 1. Push local changes to server
    const pendingUploads = localActivities.filter(a => a.id.includes('local-'));
    
    if (pendingUploads.length > 0) {
      console.log(`Syncing ${pendingUploads.length} local activities to server (V2)`);
      
      for (const activity of pendingUploads) {
        const { error } = await supabase
          .from('habit_activities')
          .upsert({
            user_id: user.id,
            habit_id: activity.habitId,
            habit_name: activity.habitName,
            activity_date: activity.date,
            status: activity.status
          }, {
            onConflict: 'user_id,habit_id,activity_date'
          });
          
        if (error) {
          console.error("Failed to upload activity V2:", error);
        } else {
          // Mark as uploaded by removing the local- prefix from ID
          activity.id = activity.id.replace('local-', '');
          changesDetected = true;
        }
      }
    }
    
    // 2. Pull server changes
    // Only get activities since last sync or last 30 days if no previous sync
    const since = syncStateV2.lastSyncTime || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const { data: serverActivities, error } = await supabase
      .from('habit_activities')
      .select('*, habits!inner(name)')
      .eq('user_id', user.id)
      .gt('updated_at', since.toISOString());
      
    if (error) {
      console.error("Failed to fetch server activities V2:", error);
      syncStateV2.lastSyncStatus = 'error';
      return false;
    }
    
    if (serverActivities && serverActivities.length > 0) {
      console.log(`Retrieved ${serverActivities.length} activities from server (V2)`);
      
      // Convert server format to local format
      const convertedActivities: HabitActivityV2[] = serverActivities.map(a => ({
        id: a.id,
        date: a.activity_date,
        habitId: a.habit_id,
        habitName: a.habit_name || (a.habits as any)?.name || 'Unknown',
        status: a.status as "completed" | "failed" | "empty"
      }));
      
      // Merge with local activities, preferring server versions
      const mergedActivities = [...localActivities];
      
      convertedActivities.forEach(serverActivity => {
        const localIndex = mergedActivities.findIndex(
          local => local.habitId === serverActivity.habitId && 
                   local.date === serverActivity.date
        );
        
        if (localIndex >= 0) {
          // Update existing entry if different
          if (mergedActivities[localIndex].status !== serverActivity.status) {
            mergedActivities[localIndex] = serverActivity;
            changesDetected = true;
          }
        } else {
          // Add new entry
          mergedActivities.push(serverActivity);
          changesDetected = true;
        }
      });
      
      // If changes were made, update local storage
      if (changesDetected) {
        saveOfflineData({ habitActivitiesV2: mergedActivities });
        console.log("Updated local storage with synchronized activities (V2)");
        
        // Clear streak caches when data is synchronized
        clearStreakCaches();
        
        // Notify the application that data has changed
        window.dispatchEvent(new CustomEvent('habitDataSyncedV2', {
          detail: { count: serverActivities.length }
        }));
      }
    }
    
    // Update sync state
    syncStateV2.lastSyncTime = new Date();
    syncStateV2.lastSyncStatus = 'success';
    syncStateV2.pendingChanges = pendingUploads.length - pendingUploads.filter(a => !a.id.includes('local-')).length;
    
    // Save last sync time
    localStorage.setItem(LAST_SYNC_KEY_V2, JSON.stringify(syncStateV2.lastSyncTime));
    
    return true;
  } catch (error) {
    console.error("Habit synchronization failed (V2):", error);
    syncStateV2.lastSyncStatus = 'error';
    return false;
  } finally {
    syncStateV2.syncInProgress = false;
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
    const activity: HabitActivityV2 = {
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
      synchronizeHabitsV2(true).catch(error => {
        console.error("Background sync failed (V2):", error);
      });
    } else {
      // Increase pending changes count
      syncStateV2.pendingChanges++;
      
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

// Force a full synchronization from server (useful after login or for manual sync)
export const forceSyncFromServerV2 = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    // Get all habit activities from server with habit names
    const { data: serverActivities, error } = await supabase
      .from('habit_activities')
      .select('*, habits!inner(name)')
      .eq('user_id', user.id);
      
    if (error) {
      console.error("Failed to fetch all server activities (V2):", error);
      return false;
    }
    
    if (serverActivities) {
      // Convert server format to local format
      const convertedActivities: HabitActivityV2[] = serverActivities.map(a => ({
        id: a.id,
        date: a.activity_date,
        habitId: a.habit_id,
        habitName: a.habit_name || (a.habits as any)?.name || 'Unknown',
        status: a.status as "completed" | "failed" | "empty"
      }));
      
      // Save to local storage, completely replacing the existing data
      saveOfflineData({ habitActivitiesV2: convertedActivities });
      
      // Update sync state
      syncStateV2.lastSyncTime = new Date();
      syncStateV2.lastSyncStatus = 'success';
      syncStateV2.pendingChanges = 0;
      
      // Save last sync time
      localStorage.setItem(LAST_SYNC_KEY_V2, JSON.stringify(syncStateV2.lastSyncTime));
      
      // Notify the application that data has changed
      window.dispatchEvent(new CustomEvent('habitDataSyncedV2', {
        detail: { count: serverActivities.length, fullSync: true }
      }));
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Force sync failed (V2):", error);
    return false;
  }
};

// Mark uncompleted habits as failed at end of day - V2 version
export const processEndOfDayHabitsV2 = async (daysToProcess: number = 7): Promise<void> => {
  try {
    console.log(`🌙 Processing end-of-day habits for the last ${daysToProcess} days (V2)...`);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('❌ No user logged in, skipping end-of-day processing');
      return;
    }

    // Get the current date and time
    const now = new Date();
    
    // Process all days from yesterday going back the specified number of days
    const datesToProcess: string[] = [];
    for (let daysBack = 1; daysBack <= daysToProcess; daysBack++) {
      const date = new Date(now);
      date.setDate(now.getDate() - daysBack);
      
      // Skip future dates and today (we only process completed days)
      if (date >= now) continue;
      
      const dateStr = date.toISOString().split('T')[0];
      datesToProcess.push(dateStr);
    }
    
    if (datesToProcess.length === 0) {
      console.log('📅 No past dates to process');
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
        
        // If no activity or status is empty, mark as "failed"
        if (!existingActivity || existingActivity.status === "empty") {
          // Create a failed activity entry
          const newActivity: HabitActivityV2 = {
            id: `local-${habit.id}-${dateStr}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            date: dateStr,
            habitId: habit.id,
            habitName: habit.name,
            status: "failed"
          };
          
          // Remove any existing entry for this habit and date first
          const existingIndex = activities.findIndex(
            a => a.habitId === habit.id && a.date === dateStr
          );
          
          if (existingIndex >= 0) {
            activities[existingIndex] = newActivity;
          } else {
            activities.push(newActivity);
          }
          
          changesDetected = true;
          dateProcessedCount++;
          totalProcessedCount++;
          
          console.log(`❌ Marked habit "${habit.name}" (${habit.id}) as failed for ${dateStr}`);
        } else if (existingActivity.status === "completed") {
          console.log(`✅ Habit "${habit.name}" was already completed for ${dateStr}`);
        } else if (existingActivity.status === "failed") {
          console.log(`❌ Habit "${habit.name}" was already failed for ${dateStr}`);
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
        synchronizeHabitsV2(true).catch(error => {
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
      
      console.log(`✅ End-of-day processing complete: ${totalProcessedCount} habits marked as failed across ${datesToProcess.length} dates`);
      console.log('📊 Summary by date:', processedByDate);
    } else {
      console.log(`✨ No changes needed for end-of-day processing (${datesToProcess.join(', ')})`);
    }
  } catch (error) {
    console.error("❌ Failed to process end-of-day habits (V2):", error);
  }
};