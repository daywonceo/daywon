
import React from "react";
import { getHabitStreakInfo } from "@/utils/habitTracking";
import StreakDisplay from "./StreakDisplay";

interface HabitGridHeaderProps {
  habits: string[];
}

const HabitGridHeader = ({ habits }: HabitGridHeaderProps) => {
  return (
    <>
      {/* Empty cell for day column */}
      <div></div>
      
      {/* Empty cell for activity text column */}
      <div></div>
      
      {/* Habit headers with streaks */}
      {habits.map((habit) => {
        const streakInfo = getHabitStreakInfo(habit);
        return (
          <div key={`header-${habit}`} className="text-center">
            <div className="font-bold text-gray-700 dark:text-gray-300 text-xs sm:text-sm mb-1">
              {habit}
            </div>
            <StreakDisplay 
              currentStreak={streakInfo.current}
              className="text-xs"
            />
          </div>
        );
      })}
    </>
  );
};

export default HabitGridHeader;
