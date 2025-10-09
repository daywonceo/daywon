import { CheckCircle, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { capitalizeHabitName } from "@/lib/utils";

interface CompletedHabit {
  name: string;
  habitId: string;
  streak: number;
}

interface CompletedHabitsSectionProps {
  habits: CompletedHabit[];
}

export const CompletedHabitsSection = ({ habits }: CompletedHabitsSectionProps) => {
  return (
    <div>
      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-green-500" />
        Habits Completed
      </h3>
      {habits.length > 0 ? (
        <div className="space-y-2">
          {habits.map((habit, index) => (
            <div 
              key={`${habit.habitId}-${index}`} 
              className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800"
            >
              <span className="text-sm font-medium">{capitalizeHabitName(habit.name)}</span>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                <span>{habit.streak} day{habit.streak !== 1 ? 's' : ''}</span>
              </Badge>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No habits completed this day</p>
      )}
    </div>
  );
};
