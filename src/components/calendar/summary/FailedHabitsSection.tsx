import { Target, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { capitalizeHabitName } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HabitData } from "./useDailySummaryData";

interface FailedHabitsSectionProps {
  habits: HabitData[];
  canEdit?: boolean;
  onToggle?: (habitName: string, currentStatus: 'completed' | 'failed', date: Date) => void;
  date?: Date;
}

export const FailedHabitsSection = ({ habits, canEdit = false, onToggle, date }: FailedHabitsSectionProps) => {
  if (habits.length === 0) return null;

  return (
    <div>
      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
        <Target className="h-5 w-5 text-warning" />
        Habits to Improve
      </h3>
      <div className="space-y-2">
        {habits.map((habit, index) => (
          <div 
            key={index} 
            className={`flex items-center justify-between bg-warning/10 p-3 rounded-lg border border-warning/20 ${
              canEdit ? 'hover:bg-warning/20 transition-colors' : ''
            }`}
          >
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm font-medium">{capitalizeHabitName(habit.name)}</span>
              <Badge variant="outline" className="text-xs">
                Try again tomorrow
              </Badge>
            </div>
            {canEdit && onToggle && date && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggle(habit.name, 'failed', date)}
                className="h-8 w-8 p-0 hover:bg-success/20"
                title="Mark as complete"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
