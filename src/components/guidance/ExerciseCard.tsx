
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, Plus, TrendingUp, X } from "lucide-react";
import CollapsibleDescription from "./CollapsibleDescription";
import { useExerciseSuggestions } from "@/hooks/useExerciseSuggestions";

interface ExerciseCardProps {
  exercise: any;
  onLog: (exercise: any, sets: number, reps: number, weight?: number) => void;
  isLogged: boolean;
  isCompleted?: boolean;
  onToggleComplete?: (exerciseName: string, completed: boolean) => void;
  onRemove?: (exerciseName: string) => void;
}

const ExerciseCard = ({ 
  exercise, 
  onLog, 
  isLogged, 
  isCompleted = false,
  onToggleComplete,
  onRemove 
}: ExerciseCardProps) => {
  const [sets, setSets] = useState<number>(3);
  const [reps, setReps] = useState<number>(10);
  const [weight, setWeight] = useState<number | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [progressionNote, setProgressionNote] = useState<string>('');
  
  const { getSuggestionForExercise, getProgressionNote, isLoading } = useExerciseSuggestions();

  // Load suggestions when form is opened
  useEffect(() => {
    if (showForm && !isLogged) {
      loadSuggestions();
    }
  }, [showForm, isLogged]);

  const loadSuggestions = async () => {
    try {
      const suggestion = await getSuggestionForExercise(exercise.name);
      const currentWeight = weight;
      
      setSets(suggestion.sets);
      setReps(suggestion.reps);
      
      if (suggestion.weight !== undefined) {
        setWeight(suggestion.weight);
      }
      
      // Set progression note
      if (suggestion.isProgression) {
        const note = getProgressionNote(suggestion, currentWeight);
        setProgressionNote(note);
      } else {
        setProgressionNote('');
      }
    } catch (error) {
      console.error('Error loading exercise suggestions:', error);
    }
  };

  const handleLog = () => {
    onLog(exercise, sets, reps, weight);
    setShowForm(false);
    setProgressionNote('');
  };

  const handleToggleComplete = (checked: boolean) => {
    if (onToggleComplete) {
      onToggleComplete(exercise.name, checked);
    }
  };

  const handleToggleForm = () => {
    // If closing the form (showForm is true) and exercise isn't already completed, mark it complete
    if (showForm && !isCompleted && onToggleComplete) {
      onToggleComplete(exercise.name, true);
    }
    setShowForm(!showForm);
  };

  return (
    <Card className={`transition-colors ${
      isCompleted 
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
        : isLogged 
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' 
          : 'bg-white dark:bg-gray-800'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {onToggleComplete && (
              <div className="flex-shrink-0 mt-1">
                <Checkbox
                  checked={isCompleted}
                  onCheckedChange={handleToggleComplete}
                  className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className={`text-lg leading-tight ${
                isCompleted 
                  ? 'text-green-800 dark:text-green-300 line-through' 
                  : 'text-gray-800 dark:text-gray-200'
              }`}>
                {exercise.name}
              </CardTitle>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">{exercise.muscle}</Badge>
                <Badge variant="outline" className="text-xs">{exercise.difficulty}</Badge>
                {exercise.equipment && (
                  <Badge variant="outline" className="text-xs">{exercise.equipment}</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 flex gap-2">
            {onRemove && !isLogged && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(exercise.name)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                title="Remove exercise"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            {isLogged ? (
              <CheckCircle className="w-5 h-5 text-blue-600" />
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleForm}
                disabled={isLoading}
                className="h-8 w-8 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      {exercise.instructions && (
        <CardContent className="pt-0 pb-3">
          <CollapsibleDescription 
            text={exercise.instructions}
            maxLines={2}
          />
        </CardContent>
      )}

      {showForm && !isLogged && (
        <CardContent className="pt-0">
          {progressionNote && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <TrendingUp className="w-4 h-4 flex-shrink-0" />
                <span className="leading-tight">{progressionNote}</span>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Sets</label>
              <Input
                type="number"
                value={sets}
                onChange={(e) => setSets(Number(e.target.value))}
                min={1}
                max={10}
                className="text-sm h-8"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Reps</label>
              <Input
                type="number"
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
                min={1}
                max={50}
                className="text-sm h-8"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Weight (lbs)</label>
              <Input
                type="number"
                value={weight || ''}
                onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Optional"
                className="text-sm h-8"
              />
            </div>
          </div>
          <Button onClick={handleLog} size="sm" className="w-full h-8">
            Log Exercise
          </Button>
        </CardContent>
      )}
    </Card>
  );
};

export default ExerciseCard;
