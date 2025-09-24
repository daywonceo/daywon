
import React, { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActivityStatus } from "@/hooks/useHabitActivities";
import { calculateStreakForDate, formatStreakNumber } from "@/utils/habitStreaks";
import { getHabitActivities } from "@/utils/habitActivity";
import { hasRecentRecovery } from "@/utils/streakRecovery";

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
  const [streak, setStreak] = useState(0);

  // Calculate streak and listen for updates using habit_id
  useEffect(() => {
    const calculateCurrentStreak = () => {
      if (status !== "completed") {
        setStreak(0);
        return;
      }

      try {
        const activities = getHabitActivities();
        // Find the habit_id for this habit name
        const habitActivity = activities.find(a => a.habitName === category && a.habitId);
        
        if (habitActivity?.habitId) {
          let currentStreak = calculateStreakForDate(habitActivity.habitId, activityDate, habit?.ended_at);

          // Check for recovery that might restore the streak
          if (hasRecentRecovery(category, activityDate)) {
            const previousDayDate = new Date(activityDate);
            previousDayDate.setDate(previousDayDate.getDate() - 1);
            const previousStreak = calculateStreakForDate(habitActivity.habitId, previousDayDate, habit?.ended_at);
            if (previousStreak > currentStreak) {
              currentStreak = previousStreak + 1; // Restore the streak
            }
          }

          setStreak(currentStreak);
        } else {
          console.warn(`No habit_id found for ${category}, setting streak to 0`);
          setStreak(0);
        }
      } catch (error) {
        console.error("Error calculating streak:", error);
        setStreak(0);
      }
    };

    // Calculate initial streak
    calculateCurrentStreak();

    // Listen for habit updates to recalculate streak
    const handleHabitUpdate = (event: CustomEvent) => {
      const { habitName, date } = event.detail;
      // Re-calculate if this update affects our habit or date
      if (habitName === category || date === activityDate.toISOString().split('T')[0]) {
        // Small delay to ensure data is saved
        setTimeout(calculateCurrentStreak, 100);
      }
    };

    // Listen for status changes to recalculate streak immediately
    const handleStatusChange = (event: CustomEvent) => {
      const { category: updatedCategory } = event.detail;
      if (updatedCategory === category) {
        // Immediate recalculation for UI responsiveness
        calculateCurrentStreak();
      }
    };

    window.addEventListener('habitUpdated', handleHabitUpdate as EventListener);
    window.addEventListener('habitStatusChanged', handleStatusChange as EventListener);

    return () => {
      window.removeEventListener('habitUpdated', handleHabitUpdate as EventListener);
      window.removeEventListener('habitStatusChanged', handleStatusChange as EventListener);
    };
  }, [category, status, activityDate]);

  const showStreak = streak >= 3;
  const formattedStreak = formatStreakNumber(streak);

  return (
    <div
      className={cn(
        "w-10 h-10 sm:w-14 sm:h-14 border border-border bg-card rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30",
        activeHabit === category && activityIndex === 0
          ? "ring-2 ring-primary/50 ring-offset-1 ring-offset-background"
          : ""
      )}
      onClick={() => onStatusToggle(activityIndex, category)}
    >
      {status === "completed" && (
        <div className="w-full h-full bg-primary rounded-md flex items-center justify-center animate-scale-in relative shadow-sm">
          {showStreak ? (
            <span className="text-primary-foreground font-bold text-xs sm:text-sm leading-none text-center">
              {formattedStreak}
            </span>
          ) : (
            <Check size={16} className="text-primary-foreground sm:hidden" />
          )}
          {!showStreak && (
            <Check size={20} className="text-primary-foreground hidden sm:block" />
          )}
        </div>
      )}
      {status === "failed" && (
        <div className="w-full h-full bg-destructive/10 border border-destructive/30 rounded-md flex items-center justify-center animate-scale-in">
          <X size={16} className="text-destructive sm:hidden" />
          <X size={20} className="text-destructive hidden sm:block" />
        </div>
      )}
    </div>
  );
};

export default HabitStatusBox;
