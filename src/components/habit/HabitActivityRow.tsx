
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
        <div className="text-center text-3xl sm:text-5xl font-black text-green-800">
          {activity.day}
        </div>
      </div>
      {/* Activity description */}
      <div className="flex items-center">
        {activity.isEditing ? (
          <Input
            value={activity.text}
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
          <div className="flex items-center">
            <p className="text-green-800 text-sm sm:text-lg font-semibold leading-tight">{activity.text}</p>
            <button
              onClick={() => toggleEditMode(activityIndex)}
              className="ml-2 text-green-700 hover:text-green-900 transition-colors"
            >
              <Edit size={12} className="sm:hidden" />
              <Edit size={14} className="hidden sm:block" />
            </button>
          </div>
        )}
      </div>
      {/* Habit status boxes */}
      {activity.categories.map((category, categoryIndex) => (
        <div
          key={`${activityIndex}-${category}`}
          className={cn(
            "h-[45px] w-[45px] sm:h-[60px] sm:w-[85px] border-2 border-green-800 rounded-md flex items-center justify-center cursor-pointer hover:bg-green-100 transition-colors",
            activeHabit === category && activityIndex === 0
              ? "ring-2 ring-blue-500 ring-offset-2"
              : ""
          )}
          onClick={() => toggleStatus(activityIndex, category)}
        >
          {activity.statuses[category] === "completed" && (
            <div className="w-4/5 h-4/5 bg-green-800 rounded-sm flex items-center justify-center animate-checkmark">
              <Check size={16} className="sm:hidden text-white" />
              <Check size={20} className="hidden sm:block text-white" />
            </div>
          )}
          {activity.statuses[category] === "failed" && (
            <div className="w-4/5 h-4/5 rounded-sm border-2 border-red-500 flex items-center justify-center">
              <X size={16} className="sm:hidden text-red-500" />
              <X size={20} className="hidden sm:block text-red-500" />
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export default HabitActivityRow;
