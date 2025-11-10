import { CheckCircle, Trophy, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { capitalizeHabitName } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HabitData } from "./useDailySummaryData";

interface CompletedHabitsSectionProps {
  habits: HabitData[];
  canEdit?: boolean;
  onToggle?: (habitName: string, currentStatus: 'completed' | 'failed', date: Date) => void;
  date?: Date;
}

export const CompletedHabitsSection = ({ habits, canEdit = false, onToggle, date }: CompletedHabitsSectionProps) => {
  return (
    <div>
      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-success" />
        Habits Completed
      </h3>
      {habits.length > 0 ? (
        <div className="space-y-2">
          {habits.map((habit, index) => (
            <div 
              key={`${habit.habitId}-${index}`} 
              className={`flex items-center justify-between bg-success/10 p-3 rounded-lg border border-success/20 ${
                canEdit ? 'hover:bg-success/20 transition-colors' : ''
              }`}
            >
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm font-medium">{capitalizeHabitName(habit.name)}</span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  <span>{habit.streak} day{habit.streak !== 1 ? 's' : ''}</span>
                </Badge>
              </div>
              {canEdit && onToggle && date && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggle(habit.name, 'completed', date)}
                  className="h-8 w-8 p-0 hover:bg-destructive/20"
                  title="Unmark as complete"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No habits completed this day</p>
      )}
    </div>
  );
};
