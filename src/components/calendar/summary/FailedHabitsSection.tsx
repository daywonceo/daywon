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
        <Target className="h-5 w-5 text-warning" />
        Habits to Improve
      </h3>
      <div className="space-y-2">
        {habits.map((habit, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between bg-warning/10 p-3 rounded-lg border border-warning/20"
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
