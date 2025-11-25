
import React, { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActivityStatus } from "@/hooks/useHabitActivities";
import { calculateStreakForDate, formatStreakNumber } from "@/utils/habitStreaks";
import { getHabitActivities } from "@/utils/habitActivity";
import { hasRecentRecovery } from "@/utils/streakRecovery";
import { toast } from "@/hooks/use-toast";

interface HabitStatusBoxProps {
  category: string;
  status: ActivityStatus;
  activityIndex: number;
  activityDate: Date;
  activeHabit: string | null;
  onStatusToggle: (dayIndex: number, category: string) => void;
  habit?: { id: string; ended_at?: string | null }; // Add habit prop for end date
}

const HabitStatusBox: React.FC<HabitStatusBoxProps> = ({
  category,
  status,
  activityIndex,
  activityDate,
  activeHabit,
  onStatusToggle,
  habit
}) => {
  // Calculate streak only once on mount, memoize the result
  const streak = React.useMemo(() => {
    if (status !== "completed") {
      return 0;
    }

    try {
      const activities = getHabitActivities();
      const habitActivity = activities.find(a => a.habitName === category && a.habitId);
      
      if (habitActivity?.habitId) {
        let currentStreak = calculateStreakForDate(habitActivity.habitId, activityDate, habit?.ended_at);

        // Check for recovery that might restore the streak
        if (hasRecentRecovery(category, activityDate)) {
          const previousDayDate = new Date(activityDate);
          previousDayDate.setDate(previousDayDate.getDate() - 1);
          const previousStreak = calculateStreakForDate(habitActivity.habitId, previousDayDate, habit?.ended_at);
          if (previousStreak > currentStreak) {
            currentStreak = previousStreak + 1;
          }
        }

        return currentStreak;
      }
      return 0;
    } catch (error) {
      console.error("Error calculating streak:", error);
      return 0;
    }
  }, [category, activityDate, habit?.ended_at, status]);

  const showStreak = streak >= 3;
  const formattedStreak = formatStreakNumber(streak);

  return (
    <div
      className={cn(
        "w-16 h-16 sm:w-22 sm:h-22 border-2 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-150 relative",
        status === "completed" 
          ? "border-success hover:bg-success/10" 
          : status === "failed"
          ? "border-destructive hover:bg-destructive/10"
          : "border-border hover:bg-muted",
        activeHabit === category && activityIndex === 0
          ? "ring-2 ring-primary ring-offset-2"
          : ""
      )}
      onClick={() => onStatusToggle(activityIndex, category)}
      aria-label={`${category} habit ${status === "completed" ? "completed" : status === "failed" ? "failed" : "not completed"}`}
    >
      {status === "completed" && (
        <div className="w-4/5 h-4/5 bg-success rounded-md flex items-center justify-center relative">
          {showStreak ? (
            <span className="text-success-foreground font-bold text-sm sm:text-lg leading-none text-center">
              {formattedStreak}
            </span>
          ) : (
            <Check size={24} className="text-success-foreground sm:hidden" />
          )}
          {!showStreak && (
            <Check size={32} className="text-success-foreground hidden sm:block" />
          )}
        </div>
      )}
      {status === "failed" && (
        <div className="w-4/5 h-4/5 rounded-md border-2 border-destructive flex items-center justify-center">
          <X size={24} className="text-destructive sm:hidden" />
          <X size={32} className="text-destructive hidden sm:block" />
        </div>
      )}
    </div>
  );
};

export default HabitStatusBox;
