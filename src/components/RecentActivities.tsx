
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Check, X, Edit } from "lucide-react";
import { recordHabitActivity, getHabitActivities, getHabitCategories, HabitActivity } from "@/utils/habitTracking";
import { toast } from "@/hooks/use-toast";
import { hapticSuccess } from "@/utils/haptics";
import { Input } from "@/components/ui/input";
import PlaylistRecommendations from "./habit/PlaylistRecommendations";
import HabitGridHeader from "./habit/HabitGridHeader";
import HabitActivityRow from "./habit/HabitActivityRow";

// REMOVED: month prop
type RecentActivitiesProps = {
  habitList?: string[]; // array of 3 habits to show for this user
};

type ActivityStatus = "completed" | "failed" | "empty";

interface DayActivity {
  day: number;
  text: string;
  categories: string[];
  statuses: Record<string, ActivityStatus>;
  isEditing: boolean;
}

const DEFAULT_HABITS = ["WORKOUT", "DEVOTIONS", "READ"];

// CHANGE: use `habitList` prop if provided, else fall back
const RecentActivities = ({ habitList }: RecentActivitiesProps) => {
  const isMobile = useIsMobile();
  const [activities, setActivities] = useState<DayActivity[]>([]);
  const [activeHabit, setActiveHabit] = useState<string | null>(null);

  // Determine which habits to use (user-selected for month or fallback)
  const userHabits =
    habitList && habitList.length === 3
      ? habitList
      : DEFAULT_HABITS;

  useEffect(() => {
    loadActivities();
    // eslint-disable-next-line
  }, [habitList?.join(",")]); // re-calculate if user changes top 3

  const loadActivities = () => {
    try {
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
        
        // Create default text description based on date
        let text = "";
        if (index === 0) {
          text = "TODAY'S ACTIVITIES";
        } else if (index === 1) {
          text = "YESTERDAY'S ACTIVITIES";
        } else {
          text = `ACTIVITIES FROM ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}`;
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
  };

  const toggleStatus = (dayIndex: number, category: string) => {
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
      
      // Record the habit status change
      recordHabitActivity(category, newStatus, date);
      
      // Provide haptic feedback on status change
      hapticSuccess();
      
      return newActivities;
    });
  };

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

  return (
    <div className="mb-6 sm:mb-16">
      <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-gray-200 tracking-tight">Recent Activity</h2>
      <div className="flex flex-col bg-green-50 rounded-xl p-3 sm:p-6 shadow-md overflow-hidden">
        {/* Table-like grid for header and items */}
        <div
          className={cn(
            "grid",
            "grid-cols-[40px_1fr_repeat(3,minmax(58px,85px))]",
            "sm:grid-cols-[60px_1fr_repeat(3,minmax(85px,120px))]",
            "gap-2 sm:gap-4 mb-4 sm:mb-6 items-end"
          )}
        >
          <HabitGridHeader habits={userHabits} />
        </div>
        {/* Activity rows */}
        {activities.map((activity, activityIndex) => (
          <div
            key={`activity-${activityIndex}`}
            className={cn(
              "grid",
              "grid-cols-[40px_1fr_repeat(3,minmax(58px,85px))]",
              "sm:grid-cols-[60px_1fr_repeat(3,minmax(85px,120px))]",
              "gap-2 sm:gap-4 mb-6 sm:mb-8 last:mb-0 items-center"
            )}
          >
            <HabitActivityRow
              activity={activity}
              activityIndex={activityIndex}
              activities={activities}
              setActivities={setActivities}
              activeHabit={activeHabit}
              setActiveHabit={setActiveHabit}
              toggleStatus={toggleStatus}
              toggleEditMode={toggleEditMode}
              updateActivityText={updateActivityText}
            />
          </div>
        ))}
      </div>
      {/* Show playlist recommendations when a habit is active */}
      {activeHabit && (
        <PlaylistRecommendations
          habitName={activeHabit}
          isHabitActive={true}
        />
      )}
    </div>
  );
};

export default RecentActivities;
