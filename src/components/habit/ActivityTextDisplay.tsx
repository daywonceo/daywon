
import React from "react";
import { Input } from "@/components/ui/input";
import { Edit } from "lucide-react";
import { DayActivity } from "@/hooks/useHabitActivities";

interface ActivityTextDisplayProps {
  activity: DayActivity;
  activityIndex: number;
  activities: DayActivity[];
  setActivities: React.Dispatch<React.SetStateAction<DayActivity[]>>;
  onToggleEditMode: (dayIndex: number) => void;
  onUpdateActivityText: (dayIndex: number, newText: string) => void;
}

const ActivityTextDisplay: React.FC<ActivityTextDisplayProps> = ({
  activity,
  activityIndex,
  activities,
  setActivities,
  onToggleEditMode,
  onUpdateActivityText,
}) => {
  if (activity.isEditing) {
    return (
      <Input
        value={activity.text.replace('\n', ' ')}
        onChange={(e) => {
          const newActivities = [...activities];
          newActivities[activityIndex].text = e.target.value;
          setActivities(newActivities);
        }}
        onBlur={() => onToggleEditMode(activityIndex)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onUpdateActivityText(activityIndex, activity.text);
          }
        }}
        autoFocus
        className="text-green-800 text-sm sm:text-lg font-semibold py-1"
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center group space-y-2">
      <div className="flex items-center">
        <p className="text-sm sm:text-base font-semibold text-green-800/90 tracking-wide">
          {activity.text}
        </p>
        <button
          onClick={() => onToggleEditMode(activityIndex)}
          className="ml-2 text-green-700 hover:text-green-900 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Edit size={12} className="sm:hidden" />
          <Edit size={14} className="hidden sm:block" />
        </button>
      </div>
    </div>
  );
};

export default ActivityTextDisplay;
