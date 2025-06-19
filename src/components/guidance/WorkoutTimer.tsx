
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Timer, Play, Pause, Square } from "lucide-react";

interface WorkoutTimerProps {
  elapsedTime: number;
  isTimerPaused: boolean;
  workoutStarted: boolean;
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onStopWorkout: () => void;
}

const WorkoutTimer = ({
  elapsedTime,
  isTimerPaused,
  workoutStarted,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onStopWorkout
}: WorkoutTimerProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
      <CardContent className="p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Timer className="w-6 h-6 text-green-600" />
          <span className="text-3xl font-mono font-bold text-green-700 dark:text-green-400">
            {formatTime(elapsedTime)}
          </span>
          {isTimerPaused && (
            <Badge variant="secondary" className="ml-2">Paused</Badge>
          )}
        </div>
        
        <div className="flex justify-center gap-2">
          {!workoutStarted ? (
            <Button
              onClick={onStartTimer}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Timer
            </Button>
          ) : (
            <>
              {!isTimerPaused ? (
                <Button
                  onClick={onPauseTimer}
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              ) : (
                <Button
                  onClick={onResumeTimer}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </Button>
              )}
              <Button
                onClick={onStopWorkout}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutTimer;
