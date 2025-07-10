
import React, { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActivityStatus } from "@/hooks/useHabitActivities";
import { calculateStreakForDate, formatStreakNumber } from "@/utils/habitStreaks";
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
  const [streak, setStreak] = useState(0);

  // Calculate streak and listen for updates
  useEffect(() => {
    const calculateCurrentStreak = () => {
      let currentStreak = status === "completed" 
        ? calculateStreakForDate(category, activityDate) 
        : 0;

      // Check for recovery that might restore the streak
      if (status === "completed" && hasRecentRecovery(category, activityDate)) {
        const previousDayDate = new Date(activityDate);
        previousDayDate.setDate(previousDayDate.getDate() - 1);
        const previousStreak = calculateStreakForDate(category, previousDayDate);
        if (previousStreak > currentStreak) {
          currentStreak = previousStreak + 1; // Restore the streak
        }
      }

      setStreak(currentStreak);
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
            <span className="text-white font-bold text-xs sm:text-sm leading-none">
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
