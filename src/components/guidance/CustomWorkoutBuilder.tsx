
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Search } from "lucide-react";
import { useExercises } from "@/hooks/useExercises";

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  
  const { exercises: availableExercises, fetchExercises, isLoading } = useExercises();

  const muscleGroups = [
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
    'core', 'quadriceps', 'hamstrings', 'calves', 'glutes'
  ];

  const difficulties = ['beginner', 'intermediate', 'expert'];

  const handleSearch = async () => {
    const params: any = {};
    if (searchQuery.trim()) params.name = searchQuery.trim();
    if (selectedMuscle && selectedMuscle !== 'all') params.muscle = selectedMuscle;
    if (selectedDifficulty && selectedDifficulty !== 'all') params.difficulty = selectedDifficulty;
    
    await fetchExercises(params);
  };

  const addExercise = (exercise: any) => {
    const newExercise: Exercise = {
      name: exercise.name,
      muscle: exercise.muscle,
      equipment: exercise.equipment,
      difficulty: exercise.difficulty,
      instructions: exercise.instructions,
      sets: 3,
      reps: 10,
      weight: undefined
    };
    
    onExercisesChange([...exercises, newExercise]);
  };

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
        <h4 className="font-medium text-gray-800 dark:text-gray-200">Build Your Workout</h4>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowExerciseSearch(!showExerciseSearch)}
          >
            <Search className="w-4 h-4 mr-1" />
            Find Exercises
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCustomExercise}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Custom
          </Button>
        </div>
      </div>

      {showExerciseSearch && (
        <Card className="bg-gray-50 dark:bg-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Search Exercises</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Exercise Name</Label>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., push up"
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs">Muscle Group</Label>
                <Select value={selectedMuscle} onValueChange={setSelectedMuscle}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Any muscle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any muscle</SelectItem>
                    {muscleGroups.map(muscle => (
                      <SelectItem key={muscle} value={muscle}>
                        {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Difficulty</Label>
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Any difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any difficulty</SelectItem>
                    {difficulties.map(diff => (
                      <SelectItem key={diff} value={diff}>
                        {diff.charAt(0).toUpperCase() + diff.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              type="button" 
              onClick={handleSearch} 
              disabled={isLoading}
              size="sm"
              className="w-full"
            >
              {isLoading ? 'Searching...' : 'Search Exercises'}
            </Button>

            {availableExercises.length > 0 && (
              <div className="max-h-32 overflow-y-auto space-y-2">
                {availableExercises.slice(0, 10).map((exercise, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded text-sm">
                    <div>
                      <div className="font-medium">{exercise.name}</div>
                      <div className="text-xs text-gray-500">
                        {exercise.muscle} • {exercise.difficulty}
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => addExercise(exercise)}
                      className="h-6 px-2"
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {exercises.map((exercise, index) => (
          <Card key={index} className="bg-white dark:bg-gray-800">
            <CardContent className="p-3">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <Input
                    value={exercise.name}
                    onChange={(e) => updateExercise(index, 'name', e.target.value)}
                    placeholder="Exercise name"
                    className="font-medium mb-2"
                  />
                  <div className="flex gap-2">
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
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
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
                    className="h-8"
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
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Weight (lbs)</Label>
                  <Input
                    type="number"
                    value={exercise.weight || ''}
                    onChange={(e) => updateExercise(index, 'weight', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Optional"
                    className="h-8"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {exercises.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No exercises added yet. Search for exercises or add custom ones to build your workout.</p>
        </div>
      )}
    </div>
  );
};

export default CustomWorkoutBuilder;
