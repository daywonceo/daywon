import { Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { capitalizeHabitName } from "@/lib/utils";

interface FailedHabit {
  name: string;
  habitId: string;
  streak: number;
}

interface FailedHabitsSectionProps {
  habits: FailedHabit[];
}

export const FailedHabitsSection = ({ habits }: FailedHabitsSectionProps) => {
  if (habits.length === 0) return null;

  return (
    <div>
      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
        <Target className="h-5 w-5 text-orange-500" />
        Habits to Improve
      </h3>
      <div className="space-y-2">
        {habits.map((habit, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800"
          >
            <span className="text-sm font-medium">{capitalizeHabitName(habit.name)}</span>
            <Badge variant="outline" className="text-xs">
              Try again tomorrow
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
};
