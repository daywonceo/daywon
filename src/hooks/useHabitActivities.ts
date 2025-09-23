
import { useState, useEffect, useCallback } from "react";
import { recordHabitActivity, getHabitActivities, loadHabitActivitiesFromDatabase } from "@/utils/habitActivity";
import { toast } from "@/hooks/use-toast";
import { hapticSuccess } from "@/utils/haptics";

export type ActivityStatus = "completed" | "failed" | "empty";

export interface DayActivity {
  day: number;
  text: string;
  categories: string[];
  statuses: Record<string, ActivityStatus>;
  isEditing: boolean;
}

const DEFAULT_HABITS = ["Workout", "Devotions", "Read"];

export const useHabitActivities = (habitList?: string[]) => {
  const [activities, setActivities] = useState<DayActivity[]>([]);
  const [activeHabit, setActiveHabit] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const userHabits =
    habitList && habitList.length === 3
      ? habitList
      : DEFAULT_HABITS;

  const loadActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get recent dates (past 3 days including today)
      const today = new Date();
      const dates = [0, 1, 2].map(daysAgo => {
        const date = new Date(today);
        date.setDate(today.getDate() - daysAgo);
        return date;
      });
      
      // Format dates as YYYY-MM-DD strings
      const dateStrings = dates.map(date => date.toISOString().split('T')[0]);
      
      // Throttle sync to prevent excessive database calls
      const now = Date.now();
      const lastSync = parseInt(localStorage.getItem('lastHabitSync') || '0');
      const syncThreshold = 30000; // 30 seconds
      
      if (now - lastSync > syncThreshold) {
        try {
          // Dynamically import to avoid circular dependencies
          const { synchronizeHabits } = await import('@/utils/habitSynchronization');
          await synchronizeHabits();
          localStorage.setItem('lastHabitSync', now.toString());
        } catch (syncError) {
          console.error("Failed to sync habit data:", syncError);
          // Continue with local data even if sync fails
        }
      }
      
      // Get all habit activities from V2 system (uses habit_id)
      const storedActivities = getHabitActivities();
      
      // Create activities for the past 3 days
      const newActivities = dates.map((date, index) => {
        const day = date.getDate();
        const dateStr = dateStrings[index];
        
        let text = "";
        if (index === 0) {
          text = "TODAY";
        } else if (index === 1) {
          text = "YESTERDAY";
        } else {
          text = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
        }
        
        // Initialize statuses map
        const statuses: Record<string, ActivityStatus> = {};
        
        // Populate statuses from stored activities using habit_id when available
        userHabits.forEach(category => {
          // Find by habit_id if available, otherwise fallback to name
          const activity = storedActivities.find(a => {
            if (a.habitId) {
              // Find the habit_id for this habit name
              const referenceActivity = storedActivities.find(ref => ref.habitName === category && ref.habitId);
              if (referenceActivity) {
                return a.habitId === referenceActivity.habitId && a.date === dateStr;
              }
            }
            return a.habitName === category && a.date === dateStr;
          });
          statuses[category] = activity ? activity.status : "empty";
        });
        
        return {
          day,
          text,
          categories: userHabits,
          statuses,
          isEditing: false
        };
      });
      
      setActivities(newActivities);
    } catch (error) {
      console.error("Failed to load activities:", error);
      toast({
        title: "Error",
        description: "Failed to load your recent activities.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [userHabits.join(',')]);

  const refreshActivities = useCallback(async () => {
    const now = Date.now();
    const lastRefresh = parseInt(localStorage.getItem('lastHabitRefresh') || '0');
    const refreshThreshold = 5000; // 5 seconds
    
    if (now - lastRefresh < refreshThreshold) {
      console.log('Skipping refresh - too recent');
      return;
    }
    
    console.log('Refreshing activities and streak data...');
    localStorage.setItem('lastHabitRefresh', now.toString());
    await loadActivities();
  }, [loadActivities]);

  const toggleStatus = useCallback((dayIndex: number, category: string) => {
    console.log(`Toggle status called: ${category} at day ${dayIndex}`);
    
    setActivities(prevActivities => {
      const newActivities = [...prevActivities];
      const currentStatus = newActivities[dayIndex].statuses[category];
      
      // Cycle through statuses: empty -> completed -> failed -> empty
      let newStatus: ActivityStatus;
      if (currentStatus === "empty") {
        newStatus = "completed";
        // Start the habit and show playlists
        if (dayIndex === 0) { // Only for today's activities
          setActiveHabit(category);
        }
      } else if (currentStatus === "completed") {
        newStatus = "failed";
        // Stop the habit
        if (dayIndex === 0 && activeHabit === category) {
          setActiveHabit(null);
        }
      } else {
        newStatus = "empty";
        // Stop the habit
        if (dayIndex === 0 && activeHabit === category) {
          setActiveHabit(null);
        }
      }
      
      // Update the status immediately - this is the ONLY state change
      newActivities[dayIndex].statuses[category] = newStatus;
      
      console.log(`Status updated: ${category} -> ${newStatus}`);
      
      // Calculate the date for this activity
      const today = new Date();
      const date = new Date(today);
      date.setDate(today.getDate() - dayIndex);
      
      // Dispatch event immediately after state update for real-time UI updates
      window.dispatchEvent(new CustomEvent('habitStatusChanged', { 
        detail: { category, status: newStatus, date: date.toISOString().split('T')[0] } 
      }));
      
      // Handle background operations asynchronously without affecting UI using V2 system
      Promise.resolve().then(() => {
        recordHabitActivity(category, newStatus, date);
        hapticSuccess();
      });
      
      return newActivities;
    });
  }, [activeHabit]);

  const toggleEditMode = useCallback((dayIndex: number) => {
    setActivities(prevActivities => {
      const newActivities = [...prevActivities];
      newActivities[dayIndex].isEditing = !newActivities[dayIndex].isEditing;
      return newActivities;
    });
  }, []);

  const updateActivityText = useCallback((dayIndex: number, newText: string) => {
    setActivities(prevActivities => {
      const newActivities = [...prevActivities];
      newActivities[dayIndex].text = newText;
      newActivities[dayIndex].isEditing = false;
      return newActivities;
    });
  }, []);

  // Load activities only on mount and when user habits change
  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  // Listen for habit data updates and refresh
  useEffect(() => {
    const handleDataUpdate = () => {
      console.log('Habit data updated, refreshing activities...');
      loadActivities();
    };
    
    // Listen for both V2 specific events and general data updates
    window.addEventListener('habitEndOfDayProcessedV2', handleDataUpdate);
    window.addEventListener('habitDataUpdatedV2', handleDataUpdate);
    window.addEventListener('habitDataSyncedV2', handleDataUpdate);
    
    return () => {
      window.removeEventListener('habitEndOfDayProcessedV2', handleDataUpdate);
      window.removeEventListener('habitDataUpdatedV2', handleDataUpdate);
      window.removeEventListener('habitDataSyncedV2', handleDataUpdate);
    };
  }, [loadActivities]);

  return {
    activities,
    setActivities,
    activeHabit,
    setActiveHabit,
    userHabits,
    toggleStatus,
    toggleEditMode,
    updateActivityText,
    refreshActivities,
    isLoading,
  };
};
