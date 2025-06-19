
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play } from "lucide-react";

interface WorkoutTypeSelectionProps {
  activePlan: any;
  workoutTypes: string[];
  isLoading: boolean;
  onWorkoutTypeSelect: (type: string) => void;
  onBack: () => void;
}

const WorkoutTypeSelection = ({
  activePlan,
  workoutTypes,
  isLoading,
  onWorkoutTypeSelect,
  onBack
}: WorkoutTypeSelectionProps) => {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-bold text-green-800 dark:text-green-400">
          Choose Your Workout
        </h2>
      </div>

      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-800 dark:text-gray-200">
            Select Today's Workout
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            From your {activePlan.name} plan
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {workoutTypes.map((type) => (
            <Button
              key={type}
              variant="outline"
              className="w-full h-16 text-left justify-start hover:bg-green-50 dark:hover:bg-green-900/20"
              onClick={() => onWorkoutTypeSelect(type)}
              disabled={isLoading}
            >
              <div className="flex items-center gap-3">
                <Play className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium">
                    {type.replace(/_/g, ' ').toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Estimated 45-60 minutes
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutTypeSelection;
