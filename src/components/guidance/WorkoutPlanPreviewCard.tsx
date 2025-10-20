import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Dumbbell, TrendingUp, Play } from "lucide-react";

interface WorkoutPlanPreviewCardProps {
  planType: string;
  difficulty: string;
  exercises: any[];
  estimatedDuration?: number;
  onQuickStart: () => void;
}

export const WorkoutPlanPreviewCard = ({
  planType,
  difficulty,
  exercises,
  estimatedDuration,
  onQuickStart
}: WorkoutPlanPreviewCardProps) => {
  const muscleGroups = [...new Set(exercises.map(ex => ex.muscle).filter(Boolean))];
  
  const difficultyColors = {
    beginner: "bg-green-500/10 text-green-700 dark:text-green-400",
    intermediate: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    advanced: "bg-red-500/10 text-red-700 dark:text-red-400"
  };

  return (
    <Card className="p-4 space-y-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg capitalize">{planType.replace(/_/g, ' ')}</h3>
          <div className="flex gap-2">
            <Badge className={difficultyColors[difficulty as keyof typeof difficultyColors] || ""}>
              <TrendingUp className="w-3 h-3 mr-1" />
              {difficulty}
            </Badge>
            {estimatedDuration && (
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                ~{estimatedDuration}min
              </Badge>
            )}
          </div>
        </div>
        <Button onClick={onQuickStart} size="sm" className="gap-2">
          <Play className="w-4 h-4" />
          Quick Start
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Dumbbell className="w-4 h-4" />
          <span>{exercises.length} exercises</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {muscleGroups.slice(0, 5).map((muscle, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {muscle}
            </Badge>
          ))}
          {muscleGroups.length > 5 && (
            <Badge variant="secondary" className="text-xs">
              +{muscleGroups.length - 5} more
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Preview:</p>
        <div className="space-y-1">
          {exercises.slice(0, 3).map((exercise, idx) => (
            <div key={idx} className="text-sm pl-3 border-l-2 border-primary/30">
              {exercise.name}
            </div>
          ))}
          {exercises.length > 3 && (
            <div className="text-sm text-muted-foreground pl-3">
              +{exercises.length - 3} more exercises
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
