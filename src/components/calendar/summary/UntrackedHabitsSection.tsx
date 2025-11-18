import { Circle, Plus } from "lucide-react";
import { capitalizeHabitName } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HabitData } from "./useDailySummaryData";

interface UntrackedHabitsSectionProps {
  habits: HabitData[];
  canEdit?: boolean;
  onToggle?: (habitName: string, currentStatus: 'completed' | 'failed', date: Date) => void;
  date?: Date;
}

export const UntrackedHabitsSection = ({ habits, canEdit = false, onToggle, date }: UntrackedHabitsSectionProps) => {
  if (habits.length === 0) return null;

  return (
    <div>
      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
        <Circle className="h-5 w-5 text-muted-foreground" />
        Not Yet Tracked
      </h3>
      <div className="space-y-2">
        {habits.map((habit, index) => (
          <div 
            key={`${habit.habitId}-${index}`} 
            className={`flex items-center justify-between bg-muted/30 p-3 rounded-lg border border-border ${
              canEdit ? 'hover:bg-muted/50 transition-colors cursor-pointer' : ''
            }`}
            onClick={canEdit && onToggle && date ? () => onToggle(habit.name, 'failed', date) : undefined}
          >
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm font-medium text-muted-foreground">{capitalizeHabitName(habit.name)}</span>
            </div>
            {canEdit && onToggle && date && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(habit.name, 'failed', date);
                }}
                className="h-8 w-8 p-0 hover:bg-success/20"
                title="Mark as complete"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
