
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
    <div className="flex flex-col items-center justify-center group space-y-1 min-w-0">
      <div className="flex items-center min-w-0 relative">
        <div 
          onClick={() => onToggleEditMode(activityIndex)}
          className="cursor-pointer hover:bg-muted/30 rounded px-2 py-1 border-b border-dotted border-muted-foreground/30 hover:border-muted-foreground/50 transition-all min-w-0 flex-1"
        >
          <p className="text-xs sm:text-sm font-semibold text-green-800/90 tracking-wide truncate">
            {isCustomText ? activity.text : displayText}
          </p>
          {!isCustomText && (
            <p className="text-[10px] sm:text-xs text-muted-foreground/60 mt-0.5">
              {placeholderText}
            </p>
          )}
        </div>
        <button
          onClick={() => onToggleEditMode(activityIndex)}
          className="ml-1 text-green-700/60 hover:text-green-900 transition-colors flex-shrink-0"
        >
          <Edit size={14} className="sm:hidden" />
          <Edit size={16} className="hidden sm:block" />
        </button>
      </div>
    </div>
  );
};

export default ActivityTextDisplay;
