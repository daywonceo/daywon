import React, { useState, useCallback } from "react";
import { DayActivity } from "@/hooks/useHabitActivities";
import { calculateStreakForDate } from "@/utils/habitTracking";
import { shouldShowRecoveryDialog } from "@/utils/streakRecovery";
import StreakRecoveryDialog from "./StreakRecoveryDialog";
import PhotoUploadPrompt from "./PhotoUploadPrompt";
import ClickableDate from "./ClickableDate";
import HabitStatusBox from "./HabitStatusBox";
import ActivityTextDisplay from "./ActivityTextDisplay";

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
  const [recoveryDialog, setRecoveryDialog] = useState<{
    isOpen: boolean;
    habitName: string;
    streakCount: number;
  }>({
    isOpen: false,
    habitName: "",
    streakCount: 0
  });

  const [photoPrompt, setPhotoPrompt] = useState<{
    isOpen: boolean;
    habitName: string;
  }>({
    isOpen: false,
    habitName: ""
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
    
    // If changing from completed to failed and it's today, check for recovery
    if (currentStatus === "completed" && dayIndex === 0) {
      const currentStreak = calculateStreakForDate(category, activityDate);
      
      if (shouldShowRecoveryDialog(category, currentStreak)) {
        setRecoveryDialog({
          isOpen: true,
          habitName: category,
          streakCount: currentStreak
        });
        return; // Don't toggle status yet, wait for recovery dialog
      }
    }
    
    // Toggle the status immediately
    toggleStatus(dayIndex, category);

    // Show photo prompt for newly completed habits (today only)
    if (currentStatus === "empty" && dayIndex === 0) {
      const hidePrompt = localStorage.getItem('hidePhotoPrompt') === 'true';
      if (!hidePrompt) {
        // Small delay to ensure status change is rendered
        setTimeout(() => {
          setPhotoPrompt({
            isOpen: true,
            habitName: category
          });
        }, 100);
      }
    }
  }, [activities, activityIndex, activityDate, toggleStatus]);

  const handleRecoveryComplete = useCallback(() => {
    // Keep the status as completed since streak was recovered
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
    // If user closes dialog without recovery, proceed with status change
    if (habitName) {
      toggleStatus(0, habitName);
    }
  }, [recoveryDialog.habitName, toggleStatus]);

  const closePhotoPrompt = useCallback(() => {
    setPhotoPrompt({ isOpen: false, habitName: "" });
  }, []);

  return (
    <>
      {/* Day number - now clickable for photo upload with better spacing */}
      <div className="flex items-center justify-center w-full">
        <ClickableDate
          day={activity.day}
          date={activityDate}
          habitName={activity.categories[0]} // Use first habit for simplicity
          onPhotoUpdate={() => {}} // Could trigger refresh if needed
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
      {activity.categories.map((category) => (
        <HabitStatusBox
          key={`${activityIndex}-${category}`}
          category={category}
          status={activity.statuses[category]}
          activityIndex={activityIndex}
          activityDate={activityDate}
          activeHabit={activeHabit}
          onStatusToggle={handleStatusToggle}
        />
      ))}

      {/* Photo Upload Prompt */}
      <PhotoUploadPrompt
        isOpen={photoPrompt.isOpen}
        onClose={closePhotoPrompt}
        habitName={photoPrompt.habitName}
        activityDate={activityDate}
      />

      {/* Streak Recovery Dialog */}
      <StreakRecoveryDialog
        isOpen={recoveryDialog.isOpen}
        onClose={closeRecoveryDialog}
        habitName={recoveryDialog.habitName}
        streakCount={recoveryDialog.streakCount}
        onRecoveryComplete={handleRecoveryComplete}
      />
    </>
  );
};

export default HabitActivityRow;
