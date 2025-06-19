
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface WorkoutCompletionProps {
  elapsedTime: number;
  onComplete: () => void;
}

const WorkoutCompletion = ({ elapsedTime, onComplete }: WorkoutCompletionProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
      <CardContent className="p-6 text-center">
        <h3 className="font-semibold text-green-800 dark:text-green-400 mb-2">
          Ready to finish?
        </h3>
        <p className="text-green-600 dark:text-green-300 text-sm mb-4">
          You've been working out for {formatTime(elapsedTime)}
        </p>
        <Button
          onClick={onComplete}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Complete Workout
        </Button>
      </CardContent>
    </Card>
  );
};

export default WorkoutCompletion;
