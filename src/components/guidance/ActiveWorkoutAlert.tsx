
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer, Play } from "lucide-react";

interface ActiveWorkoutAlertProps {
  activeWorkoutSession: any;
  onResumeClick: () => void;
}

const ActiveWorkoutAlert = ({ activeWorkoutSession, onResumeClick }: ActiveWorkoutAlertProps) => {
  // Only show if there's truly an active workout session
  if (!activeWorkoutSession) return null;

  // Check if workout is actually in progress (has started and is not completed)
  const isActuallyInProgress = activeWorkoutSession.duration_minutes > 0 || 
    (activeWorkoutSession.created_at && !activeWorkoutSession.is_completed);

  // Don't show alert if workout is completed
  if (activeWorkoutSession.is_completed) return null;

  // Only show the alert if there's a real active workout
  if (!isActuallyInProgress) return null;

  return (
    <Card className="bg-warning/10 border-warning/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Timer className="w-6 h-6 text-warning" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse"></div>
            </div>
            <div>
              <h3 className="font-semibold text-warning">
                Workout In Progress
              </h3>
              <p className="text-sm text-warning-foreground">
                {activeWorkoutSession.workout_type.replace(/_/g, ' ').toUpperCase()} • Timer running
              </p>
            </div>
          </div>
          <Button
            onClick={onResumeClick}
            size="sm"
            className="bg-warning text-warning-foreground hover:opacity-90"
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
