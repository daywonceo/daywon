
import { useState, useEffect, useCallback } from "react";
import { recordHabitActivity, getHabitActivities, autoActivateRecentHabits } from "@/utils/habitActivity";
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

const DEFAULT_HABITS = ["WORKOUT", "DEVOTIONS", "READ"];

export const useHabitActivities = (habitList?: string[]) => {
  const [activities, setActivities] = useState<DayActivity[]>([]);
  const [activeHabit, setActiveHabit] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const userHabits =
    habitList && habitList.length === 3
      ? habitList
      : DEFAULT_HABITS;

  const loadActivities = useCallback(() => {
    try {
      // Auto-activate habits that have been completed recently
      autoActivateRecentHabits();
      
      // Get recent dates (past 3 days including today)
      const today = new Date();
      const dates = [0, 1, 2].map(daysAgo => {
        const date = new Date(today);
        date.setDate(today.getDate() - daysAgo);
        return date;
      });
      
      // Format dates as YYYY-MM-DD strings
      const dateStrings = dates.map(date => date.toISOString().split('T')[0]);
      
      // Get all habit activities from storage
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
        
        // Populate statuses from stored activities
        userHabits.forEach(category => {
          const activity = storedActivities.find(
            a => a.habitName === category && a.date === dateStr
          );
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
    }
  }, [userHabits.join(','), refreshTrigger]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const toggleStatus = useCallback(async (dayIndex: number, category: string) => {
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
      
      newActivities[dayIndex].statuses[category] = newStatus;
      
      // Get the date for this activity
      const today = new Date();
      const date = new Date(today);
      date.setDate(today.getDate() - dayIndex);
      
      // Use setTimeout to ensure the state update completes before calling external functions
      setTimeout(() => {
        // Record the habit status change
        recordHabitActivity(category, newStatus, date);
        
        // Provide haptic feedback on status change
        hapticSuccess();
        
        // Trigger refresh of stats when habits are updated
        setRefreshTrigger(prev => prev + 1);
      }, 0);
      
      return newActivities;
    });
  }, [activeHabit]);

  const toggleEditMode = (dayIndex: number) => {
    setActivities(prevActivities => {
      const newActivities = [...prevActivities];
      newActivities[dayIndex].isEditing = !newActivities[dayIndex].isEditing;
      return newActivities;
    });
  };

  const updateActivityText = (dayIndex: number, newText: string) => {
    setActivities(prevActivities => {
      const newActivities = [...prevActivities];
      newActivities[dayIndex].text = newText;
      newActivities[dayIndex].isEditing = false;
      return newActivities;
    });
  };

  return {
    activities,
    setActivities,
    activeHabit,
    setActiveHabit,
    userHabits,
    toggleStatus,
    toggleEditMode,
    updateActivityText,
  };
};
