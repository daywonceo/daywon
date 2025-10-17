
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
  const [streak, setStreak] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate streak and listen for updates using habit_id
  useEffect(() => {
    const calculateCurrentStreak = () => {
      if (isCalculating) return; // Prevent multiple calculations
      
      setIsCalculating(true);
      
      if (status !== "completed") {
        setStreak(0);
        setIsCalculating(false);
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
      } finally {
        setIsCalculating(false);
      }
    };

    // Calculate initial streak with debounce
    const timeoutId = setTimeout(calculateCurrentStreak, 50);

    // Listen for habit updates to recalculate streak
    const handleHabitUpdate = (event: CustomEvent) => {
      const { habitName, date } = event.detail;
      // Re-calculate if this update affects our habit or date
      if ((habitName === category || date === activityDate.toISOString().split('T')[0]) && !isCalculating) {
        // Debounced recalculation to prevent rapid state changes
        setTimeout(calculateCurrentStreak, 200);
      }
    };

    // Listen for status changes to recalculate streak immediately
    const handleStatusChange = (event: CustomEvent) => {
      const { category: updatedCategory } = event.detail;
      if (updatedCategory === category && !isCalculating) {
        // Debounced recalculation for UI stability
        setTimeout(calculateCurrentStreak, 100);
      }
    };

    window.addEventListener('habitUpdated', handleHabitUpdate as EventListener);
    window.addEventListener('habitStatusChanged', handleStatusChange as EventListener);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('habitUpdated', handleHabitUpdate as EventListener);
      window.removeEventListener('habitStatusChanged', handleStatusChange as EventListener);
    };
  }, [category, status, activityDate, isCalculating, habit?.ended_at]);

  const showStreak = streak >= 3;
  const formattedStreak = formatStreakNumber(streak);

  return (
    <div
      className={cn(
        "w-16 h-16 sm:w-22 sm:h-22 border-2 rounded-lg flex items-center justify-center cursor-pointer transition-colors relative",
        status === "completed" 
          ? "border-success hover:bg-success/10" 
          : status === "failed"
          ? "border-destructive hover:bg-destructive/10"
          : "border-border hover:bg-muted",
        activeHabit === category && activityIndex === 0
          ? "ring-2 ring-primary ring-offset-2"
          : ""
      )}
      onClick={async () => {
        try {
          onStatusToggle(activityIndex, category);
        } catch (error) {
          console.error('Error toggling habit status:', error);
          toast({
            title: "Unable to update habit",
            description: "Your progress is saved locally and will sync when connection is restored.",
            variant: "destructive",
            duration: 4000,
          });
        }
      }}
      aria-label={`${category} habit ${status === "completed" ? "completed" : status === "failed" ? "failed" : "not completed"}`}
    >
      {status === "completed" && (
        <div className="w-4/5 h-4/5 bg-success rounded-md flex items-center justify-center animate-checkmark relative">
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
