
import React, { useState, useCallback } from "react";
import { DayActivity } from "@/hooks/useHabitActivities";
import { calculateStreakForDateV2 } from "@/utils/habitStreaksV2";
import { shouldShowRecoveryDialog } from "@/utils/streakRecovery";
import StreakRecoveryDialog from "./StreakRecoveryDialog";
import ClickableDate from "./ClickableDate";
import HabitStatusBox from "./HabitStatusBox";
import ActivityTextDisplay from "./ActivityTextDisplay";
import { useHabits } from "@/hooks/useHabits";

interface HabitActivityRowProps {
  activity: DayActivity;
  activityIndex: number;
  activities: DayActivity[];
  setActivities: React.Dispatch<React.SetStateAction<DayActivity[]>>;
  activeHabit: string | null;
  setActiveHabit: (habit: string | null) => void;
  toggleStatus: (dayIndex: number, category: string) => void;
  toggleEditMode: (dayIndex: number) => void;
  updateActivityText: (dayIndex: number, newText: string) => void;
}

const HabitActivityRow: React.FC<HabitActivityRowProps> = ({
  activity,
  activityIndex,
  activities,
  setActivities,
  activeHabit,
  setActiveHabit,
  toggleStatus,
  toggleEditMode,
  updateActivityText,
}) => {
  const { habits } = useHabits();
  const [recoveryDialog, setRecoveryDialog] = useState<{
    isOpen: boolean;
    habitName: string;
    streakCount: number;
  }>({
    isOpen: false,
    habitName: "",
    streakCount: 0
  });

  // Calculate the date for this activity row
  const getDateForActivity = (dayIndex: number) => {
    const today = new Date();
    const date = new Date(today);
    date.setDate(today.getDate() - dayIndex);
    return date;
  };

  const activityDate = getDateForActivity(activityIndex);

  const handleStatusToggle = useCallback((dayIndex: number, category: string) => {
    const currentStatus = activities[dayIndex].statuses[category];
    
    console.log(`HabitActivityRow: Handling toggle for ${category}, current status: ${currentStatus}`);
    
    // ALWAYS call toggleStatus first - this updates the UI immediately
    toggleStatus(dayIndex, category);
    
    // Handle recovery dialog only for today's activities and only after UI update
    if (dayIndex === 0) {
      // Use setTimeout to ensure the UI update completes first
      setTimeout(() => {
        // Handle recovery dialog for completed -> failed transition
        if (currentStatus === "completed") {
          // Use V2 system to calculate streak using habit_id
          const { getHabitActivitiesV2 } = require('@/utils/habitActivityV2');
          const activities = getHabitActivitiesV2();
          const habitActivity = activities.find(a => a.habitName === category && a.habitId);
          
          let currentStreak = 0;
          if (habitActivity?.habitId) {
            currentStreak = calculateStreakForDateV2(habitActivity.habitId, activityDate);
          }
          
          if (shouldShowRecoveryDialog(category, currentStreak)) {
            setRecoveryDialog({
              isOpen: true,
              habitName: category,
              streakCount: currentStreak
            });
          }
        }
      }, 50);
    }
  }, [activities, activityIndex, activityDate, toggleStatus]);

  const handleRecoveryComplete = useCallback(() => {
    setRecoveryDialog({
      isOpen: false,
      habitName: "",
      streakCount: 0
    });
  }, []);

  const closeRecoveryDialog = useCallback(() => {
    const habitName = recoveryDialog.habitName;
    setRecoveryDialog({
      isOpen: false,
      habitName: "",
      streakCount: 0
    });
    
    // If user closes without recovery, toggle status back to failed
    if (habitName) {
      setTimeout(() => {
        toggleStatus(0, habitName);
      }, 50);
    }
  }, [recoveryDialog.habitName, toggleStatus]);

  return (
    <React.Fragment key={`activity-row-${activityIndex}`}>
      {/* Day number - simplified without photo upload capability */}
      <div className="flex items-center justify-center w-full">
        <ClickableDate
          day={activity.day}
          date={activityDate}
        />
      </div>
      
      {/* Activity description */}
      <div className="flex items-center justify-center text-center min-w-0">
        <ActivityTextDisplay
          activity={activity}
          activityIndex={activityIndex}
          activities={activities}
          setActivities={setActivities}
          onToggleEditMode={toggleEditMode}
          onUpdateActivityText={updateActivityText}
        />
      </div>
      
      {/* Habit status boxes */}
      {activity.categories.map((category) => {
        // Find the habit data for this category
        const habit = habits?.find(h => h.name.toLowerCase() === category.toLowerCase());
        
        return (
          <HabitStatusBox
            key={`${activityIndex}-${category}`}
            category={category}
            status={activity.statuses[category]}
            activityIndex={activityIndex}
            activityDate={activityDate}
            activeHabit={activeHabit}
            onStatusToggle={handleStatusToggle}
            habit={habit ? { id: habit.id, ended_at: habit.ended_at } : undefined}
          />
        );
      })}

      {/* Streak Recovery Dialog */}
      <StreakRecoveryDialog
        isOpen={recoveryDialog.isOpen}
        onClose={closeRecoveryDialog}
        habitName={recoveryDialog.habitName}
        streakCount={recoveryDialog.streakCount}
        onRecoveryComplete={handleRecoveryComplete}
      />
    </React.Fragment>
  );
};

export default HabitActivityRow;
