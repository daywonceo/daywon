
import React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActivityStatus } from "@/hooks/useHabitActivities";
import { calculateCurrentStreak, calculateStreakForDate, formatStreakDisplay } from "@/utils/habitStreaks";
import { hasRecentRecovery } from "@/utils/streakRecovery";

interface HabitStatusBoxProps {
  category: string;
  status: ActivityStatus;
  activityIndex: number;
  activityDate: Date;
  activeHabit: string | null;
  onStatusToggle: (dayIndex: number, category: string) => void;
}

const HabitStatusBox: React.FC<HabitStatusBoxProps> = ({
  category,
  status,
  activityIndex,
  activityDate,
  activeHabit,
  onStatusToggle,
}) => {
  // For today's activities (index 0), show current streak
  // For past activities, show streak as of that date
  let streak = 0;
  
  if (status === "completed") {
    if (activityIndex === 0) {
      // Today - show current streak
      streak = calculateCurrentStreak(category);
    } else {
      // Past date - show streak as of that date
      streak = calculateStreakForDate(category, activityDate);
    }
  }

  // Check for recovery that might restore the streak
  if (status === "completed" && hasRecentRecovery(category, activityDate)) {
    const previousDayDate = new Date(activityDate);
    previousDayDate.setDate(previousDayDate.getDate() - 1);
    const previousStreak = calculateStreakForDate(category, previousDayDate);
    if (previousStreak > streak) {
      streak = previousStreak + 1; // Restore the streak
    }
  }

  const showStreak = streak >= 3;
  const formattedStreak = formatStreakDisplay(streak);

  return (
    <div
      className={cn(
        "aspect-square w-full border-2 border-green-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-green-200/50 transition-colors relative",
        activeHabit === category && activityIndex === 0
          ? "ring-2 ring-blue-500 ring-offset-2"
          : ""
      )}
      onClick={() => onStatusToggle(activityIndex, category)}
    >
      {status === "completed" && (
        <div className="w-4/5 h-4/5 bg-green-800 rounded-md flex items-center justify-center animate-checkmark relative">
          {showStreak ? (
            <span className="text-white font-bold text-xs sm:text-sm">
              {formattedStreak}
            </span>
          ) : (
            <>
              <Check size={20} className="sm:hidden text-white" />
              <Check size={24} className="hidden sm:block text-white" />
            </>
          )}
        </div>
      )}
      {status === "failed" && (
        <div className="w-4/5 h-4/5 rounded-md border-2 border-red-500 flex items-center justify-center">
          <X size={20} className="sm:hidden text-red-500" />
          <X size={24} className="hidden sm:block text-red-500" />
        </div>
      )}
    </div>
  );
};

export default HabitStatusBox;
