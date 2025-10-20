import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, Clock, SkipForward } from "lucide-react";
import { hapticSuccess } from "@/utils/haptics";

interface RestTimerProps {
  initialSeconds?: number;
  onComplete: () => void;
  onSkip: () => void;
  nextExercise?: string;
}

export const RestTimer = ({ 
  initialSeconds = 60, 
  onComplete, 
  onSkip,
  nextExercise 
}: RestTimerProps) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);
  const [adjustedTime, setAdjustedTime] = useState(initialSeconds);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      hapticSuccess();
      onComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [seconds, isActive, onComplete]);

  const progress = ((adjustedTime - seconds) / adjustedTime) * 100;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const adjustRestTime = (adjustment: number) => {
    const newTime = Math.max(10, seconds + adjustment);
    setSeconds(newTime);
    setAdjustedTime(newTime);
  };

  return (
    <Card className="p-4 sm:p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h3 className="font-semibold text-base sm:text-lg">Rest Time</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm"
          >
            <SkipForward className="w-3 h-3 sm:w-4 sm:h-4" />
            Skip
          </Button>
        </div>

        <div className="text-center space-y-2">
          <div className="text-4xl sm:text-5xl font-bold text-primary tabular-nums">
            {formatTime(seconds)}
          </div>
          <Progress value={progress} className="h-1.5 sm:h-2" />
        </div>

        {nextExercise && (
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground bg-background/50 p-2 sm:p-3 rounded-lg">
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">Next: <span className="font-medium text-foreground">{nextExercise}</span></span>
          </div>
        )}

        <div className="flex gap-2 justify-center flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustRestTime(-15)}
            disabled={seconds <= 15}
            className="h-8 sm:h-9 text-xs sm:text-sm min-w-[60px]"
          >
            -15s
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustRestTime(15)}
            className="h-8 sm:h-9 text-xs sm:text-sm min-w-[60px]"
          >
            +15s
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustRestTime(30)}
            className="h-8 sm:h-9 text-xs sm:text-sm min-w-[60px]"
          >
            +30s
          </Button>
        </div>
      </div>
    </Card>
  );
};
