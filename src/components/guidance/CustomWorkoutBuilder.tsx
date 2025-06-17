
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

interface Exercise {
  name: string;
  muscle: string;
  equipment: string;
  difficulty: string;
  instructions?: string;
  sets?: number;
  reps?: number;
  weight?: number;
}

interface CustomWorkoutBuilderProps {
  exercises: Exercise[];
  onExercisesChange: (exercises: Exercise[]) => void;
}

const CustomWorkoutBuilder = ({ exercises, onExercisesChange }: CustomWorkoutBuilderProps) => {
  const removeExercise = (index: number) => {
    onExercisesChange(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof Exercise, value: any) => {
    const updated = exercises.map((ex, i) => 
      i === index ? { ...ex, [field]: value } : ex
    );
    onExercisesChange(updated);
  };

  const addCustomExercise = () => {
    const newExercise: Exercise = {
      name: '',
      muscle: 'chest',
      equipment: 'bodyweight',
      difficulty: 'beginner',
      sets: 3,
      reps: 10
    };
    onExercisesChange([...exercises, newExercise]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm sm:text-base">Build Your Workout</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addCustomExercise}
          className="text-xs sm:text-sm"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          Add Exercise
        </Button>
      </div>

      <div className="space-y-3">
        {exercises.map((exercise, index) => (
          <Card key={index} className="bg-white dark:bg-gray-800">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 mr-2">
                  <Input
                    value={exercise.name}
                    onChange={(e) => updateExercise(index, 'name', e.target.value)}
                    placeholder="Exercise name"
                    className="font-medium mb-2 text-sm sm:text-base"
                  />
                  <div className="flex gap-1 sm:gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {exercise.muscle}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {exercise.difficulty}
                    </Badge>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExercise(index)}
                  className="text-red-500 hover:text-red-700 p-1 sm:p-2"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Sets</Label>
                  <Input
                    type="number"
                    value={exercise.sets || 3}
                    onChange={(e) => updateExercise(index, 'sets', Number(e.target.value))}
                    min={1}
                    max={10}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Reps</Label>
                  <Input
                    type="number"
                    value={exercise.reps || 10}
                    onChange={(e) => updateExercise(index, 'reps', Number(e.target.value))}
                    min={1}
                    max={50}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Weight (lbs)</Label>
                  <Input
                    type="number"
                    value={exercise.weight || ''}
                    onChange={(e) => updateExercise(index, 'weight', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Optional"
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {exercises.length === 0 && (
        <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400">
          <p className="text-sm sm:text-base">No exercises added yet. Click "Add Exercise" to build your workout.</p>
        </div>
      )}
    </div>
  );
};

export default CustomWorkoutBuilder;
