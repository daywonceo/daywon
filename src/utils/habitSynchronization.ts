import { supabase } from "@/integrations/supabase/client";
import { saveOfflineData, getOfflineData } from "./offlineStorage";
import { toast } from "@/hooks/use-toast";

// Define constants for synchronization
const SYNC_INTERVAL = 60 * 1000; // 1 minute
const LAST_SYNC_KEY = 'last_habit_sync';
const DAY_BOUNDARY_HOUR = 4; // 4 AM local time as day boundary

export interface SyncStats {
  lastSyncTime: Date | null;
  pendingChanges: number;
  syncInProgress: boolean;
  lastSyncStatus: 'success' | 'error' | 'none';
}

// Track synchronization state
let syncState: SyncStats = {
  lastSyncTime: null,
  pendingChanges: 0,
  syncInProgress: false,
  lastSyncStatus: 'none'
};

// Get the current status of synchronization
export const getSyncStatus = (): SyncStats => {
  // Return a copy to prevent external modification
  return { ...syncState };
};

// Initialize the sync system
export const initHabitSync = () => {
  // Set up listeners for online status changes
  window.addEventListener('online', handleOnlineStatusChange);
  
  // Start the sync interval
  const interval = setInterval(synchronizeHabits, SYNC_INTERVAL);
  
  // Get last sync time from storage
  const lastSyncStr = localStorage.getItem(LAST_SYNC_KEY);
  if (lastSyncStr) {
    try {
      syncState.lastSyncTime = new Date(JSON.parse(lastSyncStr));
    } catch (e) {
      console.error("Failed to parse last sync time", e);
    }
  }
  
  // Run an initial sync
  synchronizeHabits();
  
  // Return cleanup function
  return () => {
    clearInterval(interval);
    window.removeEventListener('online', handleOnlineStatusChange);
  };
};

// Handle device coming back online
const handleOnlineStatusChange = () => {
  if (navigator.onLine) {
    console.log("Device is back online, triggering habit sync");
    synchronizeHabits();
  }
};

// Main synchronization function
export const synchronizeHabits = async (forceSync = false): Promise<boolean> => {
  // Skip if offline or sync already in progress
  if (!navigator.onLine || (syncState.syncInProgress && !forceSync)) {
    return false;
  }
  
  try {
    syncState.syncInProgress = true;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      syncState.syncInProgress = false;
      return false;
    }
    
    // Get local habit activities
    const offlineData = getOfflineData();
    const localActivities = offlineData.habitActivities || [];
    
    // Flag to check if any changes were made
    let changesDetected = false;
    
    // 1. Push local changes to server
    const pendingUploads = localActivities.filter(a => a.id.includes('local-'));
    
    if (pendingUploads.length > 0) {
      console.log(`Syncing ${pendingUploads.length} local activities to server`);
      
      for (const activity of pendingUploads) {
        const { error } = await supabase
          .from('habit_activities')
          .upsert({
            user_id: user.id,
            habit_name: activity.habitName,
            activity_date: activity.date,
            status: activity.status
          }, {
            onConflict: 'user_id,habit_name,activity_date'
          });
          
        if (error) {
          console.error("Failed to upload activity:", error);
        } else {
          // Mark as uploaded by removing the local- prefix from ID
          activity.id = activity.id.replace('local-', '');
          changesDetected = true;
        }
      }
    }
    
    // 2. Pull server changes
    // Only get activities since last sync or last 30 days if no previous sync
    const since = syncState.lastSyncTime || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const { data: serverActivities, error } = await supabase
      .from('habit_activities')
      .select('*')
      .eq('user_id', user.id)
      .gt('updated_at', since.toISOString());
      
    if (error) {
      console.error("Failed to fetch server activities:", error);
      syncState.lastSyncStatus = 'error';
      return false;
    }
    
    if (serverActivities && serverActivities.length > 0) {
      console.log(`Retrieved ${serverActivities.length} activities from server`);
      
      // Convert server format to local format
      const convertedActivities = serverActivities.map(a => ({
        id: a.id,
        date: a.activity_date,
        habitName: a.habit_name,
        status: a.status as "completed" | "failed" | "empty"
      }));
      
      // Merge with local activities, preferring server versions
      const mergedActivities = [...localActivities];
      
      convertedActivities.forEach(serverActivity => {
        const localIndex = mergedActivities.findIndex(
          local => local.habitName === serverActivity.habitName && 
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
        saveOfflineData({ habitActivities: mergedActivities });
        console.log("Updated local storage with synchronized activities");
        
        // Notify the application that data has changed
        window.dispatchEvent(new CustomEvent('habitDataSynced', {
          detail: { count: serverActivities.length }
        }));
      }
    }
    
    // Update sync state
    syncState.lastSyncTime = new Date();
    syncState.lastSyncStatus = 'success';
    syncState.pendingChanges = pendingUploads.length - pendingUploads.filter(a => !a.id.includes('local-')).length;
    
    // Save last sync time
    localStorage.setItem(LAST_SYNC_KEY, JSON.stringify(syncState.lastSyncTime));
    
    return true;
  } catch (error) {
    console.error("Habit synchronization failed:", error);
    syncState.lastSyncStatus = 'error';
    return false;
  } finally {
    syncState.syncInProgress = false;
  }
};

// Mark habits as incomplete at day end
export const processEndOfDayHabits = (): void => {
  try {
    // Get the current date in YYYY-MM-DD format
    const today = new Date();
    
    // Check if we need to process yesterday's habits
    // If it's after midnight but before the day boundary (e.g., 4 AM),
    // we consider it part of the previous day
    const processDate = new Date(today);
    if (today.getHours() < DAY_BOUNDARY_HOUR) {
      processDate.setDate(processDate.getDate() - 1);
    }
    
    // Process habits for date that just ended
    const yesterday = new Date(processDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const offlineData = getOfflineData();
    const activities = offlineData.habitActivities || [];
    
    // Get all active habits (this requires loading from another source, like the habits list)
    // For this implementation, we'll just consider the default habits
    const activeHabits = ["WORKOUT", "DEVOTIONS", "READ"];
    
    // For each active habit, check if there's an activity for yesterday
    let changesDetected = false;
    activeHabits.forEach(habitName => {
      const yesterdayActivity = activities.find(
        a => a.habitName === habitName && a.date === yesterdayStr
      );
      
      // If no activity or status is empty, mark as "failed"
      if (!yesterdayActivity || yesterdayActivity.status === "empty") {
        // Create a failed activity entry
        const newActivity = {
          id: `local-${habitName}-${yesterdayStr}-${Date.now()}`,
          date: yesterdayStr,
          habitName,
          status: "failed" as const
        };
        
        // Add to activities list
        activities.push(newActivity);
        changesDetected = true;
        
        console.log(`Marked habit "${habitName}" as failed for ${yesterdayStr} due to day end`);
      }
    });
    
    // Save changes if any were made
    if (changesDetected) {
      saveOfflineData({ habitActivities: activities });
      
      // Notify the application that data has changed
      window.dispatchEvent(new CustomEvent('habitEndOfDayProcessed', {
        detail: { date: yesterdayStr }
      }));
    }
  } catch (error) {
    console.error("Failed to process end-of-day habits:", error);
  }
};

// Function to record a habit activity with improved error handling and sync
export const recordHabitActivityWithSync = async (
  habitName: string, 
  status: "completed" | "failed" | "empty", 
  date: Date = new Date()
): Promise<boolean> => {
  try {
    const dateStr = date.toISOString().split('T')[0];
    const offlineData = getOfflineData();
    const activities = offlineData.habitActivities || [];
    
    // Create a local ID that indicates it needs to be synced
    const localId = `local-${habitName}-${dateStr}-${Date.now()}`;
    
    // Check if there's an existing entry for this habit and date
    const existingIndex = activities.findIndex(
      activity => activity.habitName === habitName && activity.date === dateStr
    );
    
    // Create or update the activity
    const activity = {
      id: localId,
      date: dateStr,
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
    saveOfflineData({ habitActivities: activities });
    
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('habitStatusChanged', { 
      detail: { category: habitName, status, date: dateStr } 
    }));
    
    // Try to sync immediately if online
    if (navigator.onLine) {
      // Attempt to sync with server in the background
      synchronizeHabits(true).catch(error => {
        console.error("Background sync failed:", error);
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
    console.error("Failed to record habit activity:", error);
    
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
export const forceSyncFromServer = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    // Get all habit activities from server
    const { data: serverActivities, error } = await supabase
      .from('habit_activities')
      .select('*')
      .eq('user_id', user.id);
      
    if (error) {
      console.error("Failed to fetch all server activities:", error);
      return false;
    }
    
    if (serverActivities) {
      // Convert server format to local format
      const convertedActivities = serverActivities.map(a => ({
        id: a.id,
        date: a.activity_date,
        habitName: a.habit_name,
        status: a.status as "completed" | "failed" | "empty"
      }));
      
      // Save to local storage, completely replacing the existing data
      saveOfflineData({ habitActivities: convertedActivities });
      
      // Update sync state
      syncState.lastSyncTime = new Date();
      syncState.lastSyncStatus = 'success';
      syncState.pendingChanges = 0;
      
      // Save last sync time
      localStorage.setItem(LAST_SYNC_KEY, JSON.stringify(syncState.lastSyncTime));
      
      // Notify the application that data has changed
      window.dispatchEvent(new CustomEvent('habitDataSynced', {
        detail: { count: serverActivities.length, fullSync: true }
      }));
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Force sync failed:", error);
    return false;
  }
};