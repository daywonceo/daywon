
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Clock, CheckCircle, Star } from "lucide-react";
import { format } from "date-fns";

interface WorkoutOption {
  type: string;
  displayName: string;
  lastCompleted?: Date;
  isRecommended?: boolean;
}

interface WorkoutSelectionScreenProps {
  activePlan: any;
  workoutOptions: WorkoutOption[];
  onWorkoutSelect: (workoutType: string) => void;
  onBack: () => void;
  isLoading: boolean;
}

const WorkoutSelectionScreen = ({
  activePlan,
  workoutOptions,
  onWorkoutSelect,
  onBack,
  isLoading
}: WorkoutSelectionScreenProps) => {
  const formatLastCompleted = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return format(date, "MMM d");
    }
  };

  const recommendedWorkout = workoutOptions.find(workout => workout.isRecommended);
  const allWorkouts = workoutOptions;

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6 px-4 sm:px-2 pb-6">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="flex-shrink-0 -ml-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl font-bold text-success truncate">
            Choose Your Workout
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">
            From your {activePlan.name} plan
          </p>
        </div>
      </div>

      {/* Suggested Workout Section */}
      {recommendedWorkout && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-warning flex-shrink-0" />
            <h3 className="text-sm sm:text-base font-semibold text-foreground">
              Suggested Workout
            </h3>
          </div>
          
          <Card className="bg-success/5 border-success/20">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-semibold text-foreground text-sm sm:text-base">
                      {recommendedWorkout.displayName}
                    </h4>
                    <Badge variant="default" className="bg-success text-xs flex-shrink-0">
                      Recommended
                    </Badge>
                  </div>
                  
                  {recommendedWorkout.lastCompleted ? (
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                      <CheckCircle className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">
                        Last: {formatLastCompleted(recommendedWorkout.lastCompleted)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span>Not completed yet</span>
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={() => onWorkoutSelect(recommendedWorkout.type)}
                  disabled={isLoading}
                  size="sm"
                  className="flex-shrink-0 w-full sm:w-auto h-10 px-6 bg-success hover:bg-success/90"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* All Workout Options Section */}
      <div className="space-y-3">
        <h3 className="text-sm sm:text-base font-semibold text-foreground">
          {recommendedWorkout ? "All Workout Options" : "Workout Options"}
        </h3>
        
        <div className="grid gap-3">
          {allWorkouts.map((workout) => (
            <Card 
              key={workout.type}
              className={`transition-all duration-200 hover:shadow-md ${
                workout.isRecommended 
                  ? "bg-success/5 border-success/20" 
                  : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0 w-full sm:w-auto">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-semibold text-foreground text-sm sm:text-base">
                        {workout.displayName}
                      </h4>
                      {workout.isRecommended && (
                        <Badge variant="default" className="bg-success text-xs flex-shrink-0">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    
                    {workout.lastCompleted ? (
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                        <CheckCircle className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">
                          Last: {formatLastCompleted(workout.lastCompleted)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span>Not completed yet</span>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    onClick={() => onWorkoutSelect(workout.type)}
                    disabled={isLoading}
                    size="sm"
                    className={`flex-shrink-0 w-full sm:w-auto h-10 px-6 ${
                      workout.isRecommended 
                        ? "bg-success hover:bg-success/90" 
                        : ""
                    }`}
                    variant={workout.isRecommended ? "default" : "outline"}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="bg-muted/50 border-border">
        <CardContent className="p-3 sm:p-4 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            💡 Tip: The suggested workout follows your rotation pattern for optimal results.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutSelectionScreen;
