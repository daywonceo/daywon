
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
    <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
      <CardContent className="p-4 sm:p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Timer className={`w-5 h-5 sm:w-6 sm:h-6 text-primary ${workoutStarted && !isTimerPaused ? 'animate-pulse' : ''}`} />
          <span className="text-2xl sm:text-3xl font-mono font-bold text-primary">
            {formatTime(elapsedTime)}
          </span>
          {workoutStarted && !isTimerPaused && (
            <Badge className="ml-2 text-xs sm:text-sm bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30 animate-pulse">
              Running
            </Badge>
          )}
          {isTimerPaused && (
            <Badge variant="secondary" className="ml-2 text-xs sm:text-sm">Paused</Badge>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
          {!workoutStarted ? (
            <Button
              onClick={onStartTimer}
              size="lg"
              className="w-full sm:w-auto h-11 sm:h-12"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Workout
            </Button>
          ) : (
            <>
              {!isTimerPaused ? (
                <Button
                  onClick={onPauseTimer}
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto h-11 sm:h-12"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              ) : (
                <Button
                  onClick={onResumeTimer}
                  size="lg"
                  className="w-full sm:w-auto h-11 sm:h-12"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </Button>
              )}
              <Button
                onClick={onStopWorkout}
                variant="destructive"
                size="lg"
                className="w-full sm:w-auto h-11 sm:h-12"
              >
                <Square className="w-4 h-4 mr-2" />
                End Workout
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutTimer;
