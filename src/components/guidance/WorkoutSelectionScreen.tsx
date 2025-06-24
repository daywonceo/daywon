
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
  const alternativeWorkouts = workoutOptions.filter(workout => !workout.isRecommended);

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="flex-shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-green-800 dark:text-green-400 truncate">
            Choose Your Workout
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            From your {activePlan.name} plan
          </p>
        </div>
      </div>

      {/* Suggested Workout Section */}
      {recommendedWorkout && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              Suggested Workout
            </h3>
          </div>
          
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {recommendedWorkout.displayName}
                    </h4>
                    <Badge variant="default" className="bg-green-600 text-xs flex-shrink-0">
                      Recommended
                    </Badge>
                  </div>
                  
                  {recommendedWorkout.lastCompleted ? (
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <CheckCircle className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">
                        Last completed: {formatLastCompleted(recommendedWorkout.lastCompleted)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span>Not completed yet</span>
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={() => onWorkoutSelect(recommendedWorkout.type)}
                  disabled={isLoading}
                  size="sm"
                  className="flex-shrink-0 h-10 px-4 bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Start
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alternative Workouts Section */}
      {alternativeWorkouts.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">
            Alternative Workouts
          </h3>
          
          <div className="space-y-3">
            {alternativeWorkouts.map((workout) => (
              <Card 
                key={workout.type}
                className="bg-white dark:bg-gray-800 transition-all duration-200 hover:shadow-md"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 truncate mb-1">
                        {workout.displayName}
                      </h4>
                      
                      {workout.lastCompleted ? (
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <CheckCircle className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            Last completed: {formatLastCompleted(workout.lastCompleted)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          <span>Not completed yet</span>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => onWorkoutSelect(workout.type)}
                      disabled={isLoading}
                      size="sm"
                      variant="outline"
                      className="flex-shrink-0 h-10 px-4"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Start
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Card className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            💡 Tip: The suggested workout follows your rotation pattern for optimal results.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutSelectionScreen;
