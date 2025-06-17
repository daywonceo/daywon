
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Edit, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DayActivity } from "@/hooks/useHabitActivities";
import { calculateStreakForDate } from "@/utils/habitTracking";
import { shouldShowRecoveryDialog, hasRecentRecovery } from "@/utils/streakRecovery";
import StreakRecoveryDialog from "./StreakRecoveryDialog";
import PhotoUploadPrompt from "./PhotoUploadPrompt";
import ClickableDate from "./ClickableDate";

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

  const handleStatusToggle = (dayIndex: number, category: string) => {
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
        return; // Don't toggle status yet
      }
    }
    
    toggleStatus(dayIndex, category);

    // Show photo prompt for newly completed habits (today only)
    if (currentStatus === "empty" && dayIndex === 0) {
      const hidePrompt = localStorage.getItem('hidePhotoPrompt') === 'true';
      if (!hidePrompt) {
        setPhotoPrompt({
          isOpen: true,
          habitName: category
        });
      }
    }
  };

  const handleRecoveryComplete = () => {
    // Keep the status as completed since streak was recovered
    // The recovery system will handle maintaining the streak
  };

  const closeRecoveryDialog = () => {
    setRecoveryDialog({
      isOpen: false,
      habitName: "",
      streakCount: 0
    });
    // If user closes dialog without recovery, proceed with status change
    toggleStatus(0, recoveryDialog.habitName);
  };

  return (
    <>
      {/* Day number - now clickable for photo upload */}
      <div className="flex items-center justify-center">
        <ClickableDate
          day={activity.day}
          date={activityDate}
          habitName={activity.categories[0]} // Use first habit for simplicity
          onPhotoUpdate={() => {}} // Could trigger refresh if needed
        />
      </div>
      
      {/* Activity description */}
      <div className="flex items-center justify-center text-center">
        {activity.isEditing ? (
          <Input
            value={activity.text.replace('\n', ' ')}
            onChange={(e) => {
              const newActivities = [...activities];
              newActivities[activityIndex].text = e.target.value;
              setActivities(newActivities);
            }}
            onBlur={() => toggleEditMode(activityIndex)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateActivityText(activityIndex, activity.text);
              }
            }}
            autoFocus
            className="text-green-800 text-sm sm:text-lg font-semibold py-1"
          />
        ) : (
          <div className="flex flex-col items-center justify-center group space-y-2">
            <div className="flex items-center">
              <p className="text-sm sm:text-base font-semibold text-green-800/90 tracking-wide">
                {activity.text}
              </p>
              <button
                onClick={() => toggleEditMode(activityIndex)}
                className="ml-2 text-green-700 hover:text-green-900 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Edit size={12} className="sm:hidden" />
                <Edit size={14} className="hidden sm:block" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Habit status boxes */}
      {activity.categories.map((category) => {
        let streak = activity.statuses[category] === "completed" 
          ? calculateStreakForDate(category, activityDate) 
          : 0;

        // Check for recovery that might restore the streak
        if (activity.statuses[category] === "completed" && hasRecentRecovery(category, activityDate)) {
          const previousDayDate = new Date(activityDate);
          previousDayDate.setDate(previousDayDate.getDate() - 1);
          const previousStreak = calculateStreakForDate(category, previousDayDate);
          if (previousStreak > streak) {
            streak = previousStreak + 1; // Restore the streak
          }
        }

        const showStreak = streak >= 3;

        return (
          <div
            key={`${activityIndex}-${category}`}
            className={cn(
              "aspect-square w-full border-2 border-green-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-green-200/50 transition-colors relative",
              activeHabit === category && activityIndex === 0
                ? "ring-2 ring-blue-500 ring-offset-2"
                : ""
            )}
            onClick={() => handleStatusToggle(activityIndex, category)}
          >
            {activity.statuses[category] === "completed" && (
              <div className="w-4/5 h-4/5 bg-green-800 rounded-md flex items-center justify-center animate-checkmark relative">
                {showStreak ? (
                  <span className="text-white font-bold text-xs sm:text-sm">
                    {streak}
                  </span>
                ) : (
                  <>
                    <Check size={20} className="sm:hidden text-white" />
                    <Check size={24} className="hidden sm:block text-white" />
                  </>
                )}
              </div>
            )}
            {activity.statuses[category] === "failed" && (
              <div className="w-4/5 h-4/5 rounded-md border-2 border-red-500 flex items-center justify-center">
                <X size={20} className="sm:hidden text-red-500" />
                <X size={24} className="hidden sm:block text-red-500" />
              </div>
            )}
          </div>
        );
      })}

      {/* Photo Upload Prompt */}
      <PhotoUploadPrompt
        isOpen={photoPrompt.isOpen}
        onClose={() => setPhotoPrompt({ isOpen: false, habitName: "" })}
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
