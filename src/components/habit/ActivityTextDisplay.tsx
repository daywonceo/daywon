
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
  // Get mobile-friendly text based on activity index
  const getMobileText = (originalText: string, index: number) => {
    if (index === 0) return "Today";
    if (index === 1) return "Yesterday";
    // For older dates, show just the day (e.g., "Dec 22")
    const today = new Date();
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

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
        className="text-green-800 text-sm font-semibold py-1 min-w-0"
      />
    );
  }

  const displayText = getMobileText(activity.text, activityIndex);
  const isCustomText = activity.text !== displayText;
  const placeholderText = activityIndex === 0 ? "Tap to add notes..." : "Add notes...";

  return (
    <div className="flex flex-col items-center justify-center min-w-0 w-full">
      <div 
        onClick={() => onToggleEditMode(activityIndex)}
        className="cursor-pointer hover:bg-muted/20 active:bg-muted/30 rounded px-2 py-2 transition-all min-w-0 w-full touch-manipulation group"
      >
        <p className="text-xs font-semibold text-foreground text-center leading-tight">
          {isCustomText ? activity.text : displayText}
        </p>
        {!isCustomText && (
          <p className="text-[9px] text-muted-foreground/50 mt-0.5 text-center">
            {placeholderText}
          </p>
        )}
        <Edit size={10} className="mx-auto mt-1 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
};

export default ActivityTextDisplay;
