
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer, Play } from "lucide-react";

interface ActiveWorkoutAlertProps {
  activeWorkoutSession: any;
  onResumeClick: () => void;
}

const ActiveWorkoutAlert = ({ activeWorkoutSession, onResumeClick }: ActiveWorkoutAlertProps) => {
  if (!activeWorkoutSession) return null;

  return (
    <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Timer className="w-6 h-6 text-orange-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h3 className="font-semibold text-orange-800 dark:text-orange-400">
                Workout In Progress
              </h3>
              <p className="text-sm text-orange-600 dark:text-orange-300">
                {activeWorkoutSession.workout_type.replace(/_/g, ' ').toUpperCase()} • Started today
              </p>
            </div>
          </div>
          <Button
            onClick={onResumeClick}
            size="sm"
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            Resume
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveWorkoutAlert;
