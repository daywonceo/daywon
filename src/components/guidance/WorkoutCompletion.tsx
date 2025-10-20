
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { CheckCircle, Battery, Zap, Star } from "lucide-react";

interface WorkoutCompletionProps {
  elapsedTime: number;
  onComplete: (data: {
    energyLevel?: 'low' | 'medium' | 'high';
    rpeOverall?: number;
    workoutQuality?: 'poor' | 'fair' | 'good' | 'excellent';
  }) => void;
}

const WorkoutCompletion = ({ elapsedTime, onComplete }: WorkoutCompletionProps) => {
  const [energyLevel, setEnergyLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [rpeOverall, setRpeOverall] = useState<number>(5);
  const [workoutQuality, setWorkoutQuality] = useState<'poor' | 'fair' | 'good' | 'excellent'>('good');
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComplete = () => {
    onComplete({
      energyLevel,
      rpeOverall,
      workoutQuality
    });
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="text-center">
          <h3 className="font-semibold text-base sm:text-lg text-foreground mb-2 flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Complete Workout
          </h3>
          <p className="text-sm text-muted-foreground">
            Duration: {formatTime(elapsedTime)}
          </p>
        </div>

        {/* Energy Level */}
        <div className="space-y-2 sm:space-y-3">
          <Label className="text-xs sm:text-sm font-medium flex items-center gap-2">
            <Battery className="w-3 h-3 sm:w-4 sm:h-4" />
            Energy Level
          </Label>
          <RadioGroup value={energyLevel} onValueChange={(v: any) => setEnergyLevel(v)}>
            <div className="flex gap-2 sm:gap-3">
              <div className="flex items-center space-x-1.5 sm:space-x-2 flex-1">
                <RadioGroupItem value="low" id="energy-low" className="h-4 w-4" />
                <Label htmlFor="energy-low" className="text-xs sm:text-sm cursor-pointer">Low</Label>
              </div>
              <div className="flex items-center space-x-1.5 sm:space-x-2 flex-1">
                <RadioGroupItem value="medium" id="energy-medium" className="h-4 w-4" />
                <Label htmlFor="energy-medium" className="text-xs sm:text-sm cursor-pointer">Medium</Label>
              </div>
              <div className="flex items-center space-x-1.5 sm:space-x-2 flex-1">
                <RadioGroupItem value="high" id="energy-high" className="h-4 w-4" />
                <Label htmlFor="energy-high" className="text-xs sm:text-sm cursor-pointer">High</Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Overall Effort (RPE) */}
        <div className="space-y-2 sm:space-y-3">
          <Label className="text-xs sm:text-sm font-medium flex items-center gap-2">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
            Overall Effort (RPE: {rpeOverall}/10)
          </Label>
          <Slider
            value={[rpeOverall]}
            onValueChange={(v) => setRpeOverall(v[0])}
            min={1}
            max={10}
            step={1}
            className="w-full touch-none"
          />
          <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground">
            <span>Easy</span>
            <span>Moderate</span>
            <span>Max Effort</span>
          </div>
        </div>

        {/* Workout Quality */}
        <div className="space-y-2 sm:space-y-3">
          <Label className="text-xs sm:text-sm font-medium flex items-center gap-2">
            <Star className="w-3 h-3 sm:w-4 sm:h-4" />
            Workout Quality
          </Label>
          <RadioGroup value={workoutQuality} onValueChange={(v: any) => setWorkoutQuality(v)}>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <RadioGroupItem value="poor" id="quality-poor" className="h-4 w-4" />
                <Label htmlFor="quality-poor" className="text-xs sm:text-sm cursor-pointer">Poor</Label>
              </div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <RadioGroupItem value="fair" id="quality-fair" className="h-4 w-4" />
                <Label htmlFor="quality-fair" className="text-xs sm:text-sm cursor-pointer">Fair</Label>
              </div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <RadioGroupItem value="good" id="quality-good" className="h-4 w-4" />
                <Label htmlFor="quality-good" className="text-xs sm:text-sm cursor-pointer">Good</Label>
              </div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <RadioGroupItem value="excellent" id="quality-excellent" className="h-4 w-4" />
                <Label htmlFor="quality-excellent" className="text-xs sm:text-sm cursor-pointer">Excellent</Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        <Button
          onClick={handleComplete}
          className="w-full h-11 sm:h-12 text-sm sm:text-base"
          size="lg"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Complete Workout
        </Button>
      </CardContent>
    </Card>
  );
};

export default WorkoutCompletion;
