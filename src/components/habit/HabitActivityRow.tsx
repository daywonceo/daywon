import React from "react";
import { Input } from "@/components/ui/input";
import { Edit, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ActivityStatus = "completed" | "failed" | "empty";

interface HabitActivityRowProps {
  activity: {
    day: number;
    text: string;
    categories: string[];
    statuses: Record<string, ActivityStatus>;
    isEditing: boolean;
  };
  activityIndex: number;
  activities: any[];
  setActivities: React.Dispatch<React.SetStateAction<any[]>>;
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
  return (
    <>
      {/* Day number */}
      <div className="flex items-center justify-center">
        <div className="text-center text-3xl sm:text-4xl font-bold text-green-800">
          {activity.day}
        </div>
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
          <div className="flex items-center group">
            <p className="whitespace-pre-line text-xs sm:text-sm font-bold text-green-800/90 tracking-wider leading-tight">
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
        )}
      </div>
      {/* Habit status boxes */}
      {activity.categories.map((category) => (
        <div
          key={`${activityIndex}-${category}`}
          className={cn(
            "aspect-square w-full border-2 border-green-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-green-200/50 transition-colors",
            activeHabit === category && activityIndex === 0
              ? "ring-2 ring-blue-500 ring-offset-2"
              : ""
          )}
          onClick={() => toggleStatus(activityIndex, category)}
        >
          {activity.statuses[category] === "completed" && (
            <div className="w-4/5 h-4/5 bg-green-800 rounded-md flex items-center justify-center animate-checkmark">
              <Check size={20} className="sm:hidden text-white" />
              <Check size={24} className="hidden sm:block text-white" />
            </div>
          )}
          {activity.statuses[category] === "failed" && (
            <div className="w-4/5 h-4/5 rounded-md border-2 border-red-500 flex items-center justify-center">
              <X size={20} className="sm:hidden text-red-500" />
              <X size={24} className="hidden sm:block text-red-500" />
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export default HabitActivityRow;
