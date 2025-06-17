
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DayActivity, ActivityStatus } from "@/hooks/useHabitActivities";
import { getHabitStreakInfo } from "@/utils/habitTracking";
import StreakDisplay from "./StreakDisplay";

interface HabitActivityRowProps {
  activity: DayActivity;
  activityIndex: number;
  activities: DayActivity[];
  setActivities: React.Dispatch<React.SetStateAction<DayActivity[]>>;
  activeHabit: string | null;
  setActiveHabit: React.Dispatch<React.SetStateAction<string | null>>;
  toggleStatus: (dayIndex: number, category: string) => void;
  toggleEditMode: (dayIndex: number) => void;
  updateActivityText: (dayIndex: number, newText: string) => void;
}

const HabitActivityRow = ({
  activity,
  activityIndex,
  activities,
  setActivities,
  activeHabit,
  setActiveHabit,
  toggleStatus,
  toggleEditMode,
  updateActivityText,
}: HabitActivityRowProps) => {
  const [editText, setEditText] = useState(activity.text);

  const handleSaveEdit = () => {
    updateActivityText(activityIndex, editText);
  };

  const handleCancelEdit = () => {
    setEditText(activity.text);
    toggleEditMode(activityIndex);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const getStatusButtonClass = (status: ActivityStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-500 text-white";
      case "failed":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300";
    }
  };

  const getStatusSymbol = (status: ActivityStatus) => {
    switch (status) {
      case "completed":
        return "✓";
      case "failed":
        return "✗";
      default:
        return "";
    }
  };

  return (
    <>
      {/* Day number */}
      <div className="text-center font-bold text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
        {activity.day}
      </div>

      {/* Activity text and streak */}
      <div className="flex flex-col space-y-1">
        {activity.isEditing ? (
          <div className="flex items-center space-x-1">
            <Input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyPress}
              className="text-xs sm:text-sm h-6 sm:h-8"
              autoFocus
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSaveEdit}
              className="h-6 w-6 sm:h-8 sm:w-8 p-0"
            >
              <Check className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancelEdit}
              className="h-6 w-6 sm:h-8 sm:w-8 p-0"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center space-x-1 group">
            <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 flex-1">
              {activity.text}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => toggleEditMode(activityIndex)}
              className="h-6 w-6 sm:h-8 sm:w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        )}
        
        {/* Show streak for today's activity */}
        {activityIndex === 0 && (
          <div className="flex flex-wrap gap-1">
            {activity.categories.map(category => {
              const streakInfo = getHabitStreakInfo(category);
              return (
                <StreakDisplay 
                  key={`${category}-streak`}
                  currentStreak={streakInfo.current}
                  className="text-xs"
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Habit status buttons */}
      {activity.categories.map((category) => (
        <Button
          key={`${activityIndex}-${category}`}
          onClick={() => toggleStatus(activityIndex, category)}
          className={cn(
            "h-8 w-8 sm:h-12 sm:w-12 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 hover:scale-105",
            getStatusButtonClass(activity.statuses[category]),
            activeHabit === category && activityIndex === 0
              ? "ring-2 ring-blue-400 ring-offset-2"
              : ""
          )}
        >
          {getStatusSymbol(activity.statuses[category])}
        </Button>
      ))}
    </>
  );
};

export default HabitActivityRow;
