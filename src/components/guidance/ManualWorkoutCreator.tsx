
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Play, Timer, CheckCircle, X } from "lucide-react";
import { useWorkoutSessions } from "@/hooks/useWorkoutSessions";
import { useExercises } from "@/hooks/useExercises";

interface ManualWorkoutCreatorProps {
  onBack: () => void;
}

interface Exercise {
  name: string;
  muscle: string;
  equipment: string;
  difficulty: string;
  instructions?: string;
}

interface ExerciseLog {
  exercise: Exercise;
  sets: number;
  reps: number;
  weight?: number;
}

const ManualWorkoutCreator = ({ onBack }: ManualWorkoutCreatorProps) => {
  const [workoutType, setWorkoutType] = useState<string>('');
  const [customWorkoutName, setCustomWorkoutName] = useState<string>('');
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Exercise[]>([]);

  const { createSession, completeSession, logExercise } = useWorkoutSessions();
  const { fetchExercises, exercises, isLoading } = useExercises();

  const workoutTypes = [
    { value: 'push', label: 'Push' },
    { value: 'pull', label: 'Pull' },
    { value: 'legs', label: 'Legs' },
    { value: 'full_body', label: 'Full Body' },
    { value: 'upper', label: 'Upper Body' },
    { value: 'lower', label: 'Lower Body' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'custom', label: 'Custom' }
  ];

  // Timer effect
  React.useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSearchExercises = async () => {
    if (searchQuery.trim()) {
      await fetchExercises({ name: searchQuery.trim() });
      setSearchResults(exercises);
    }
  };

  const addExercise = (exercise: Exercise) => {
    if (!selectedExercises.find(e => e.name === exercise.name)) {
      setSelectedExercises(prev => [...prev, exercise]);
    }
    setShowExerciseSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeExercise = (exerciseName: string) => {
    setSelectedExercises(prev => prev.filter(e => e.name !== exerciseName));
  };

  const addCustomExercise = () => {
    const customExercise: Exercise = {
      name: 'Custom Exercise',
      muscle: 'all',
      equipment: 'bodyweight',
      difficulty: 'beginner'
    };
    setSelectedExercises(prev => [...prev, customExercise]);
  };

  const startWorkout = async () => {
    if (!workoutType || (!customWorkoutName.trim() && workoutType === 'custom')) return;

    try {
      const finalWorkoutType = workoutType === 'custom' ? customWorkoutName.toLowerCase().replace(/\s+/g, '_') : workoutType;
      
      const session = await createSession({
        workout_date: new Date().toISOString().split('T')[0],
        workout_type: finalWorkoutType
      });

      if (session) {
        setCurrentSession(session);
        setWorkoutStarted(true);
        setStartTime(new Date());
      }
    } catch (error) {
      console.error('Error starting manual workout:', error);
    }
  };

  const logExerciseData = async (exercise: Exercise, sets: number, reps: number, weight?: number) => {
    if (!currentSession) return;

    const log = await logExercise(currentSession.id, {
      exercise_name: exercise.name,
      muscle_group: exercise.muscle,
      equipment: exercise.equipment,
      sets,
      reps,
      weight_lbs: weight,
      difficulty: exercise.difficulty,
      exercise_instructions: exercise.instructions
    });

    if (log) {
      setExerciseLogs(prev => [...prev, { exercise, sets, reps, weight }]);
    }
  };

  const completeWorkout = async () => {
    if (!currentSession || !startTime) return;

    const durationMinutes = Math.floor(elapsedTime / 60);
    await completeSession(currentSession.id, durationMinutes);
    onBack();
  };

  if (workoutStarted && currentSession) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-xl font-bold text-green-800 dark:text-green-400">
              {currentSession.workout_type.replace(/_/g, ' ').toUpperCase()}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <Timer className="w-4 h-4" />
            <span className="font-mono text-lg">{formatTime(elapsedTime)}</span>
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-4">
          {selectedExercises.map((exercise, index) => (
            <ExerciseCard
              key={index}
              exercise={exercise}
              onLog={logExerciseData}
              isLogged={exerciseLogs.some(log => log.exercise.name === exercise.name)}
            />
          ))}
        </div>

        {/* Complete Workout */}
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold text-green-800 dark:text-green-400 mb-2">
              Ready to finish?
            </h3>
            <p className="text-green-600 dark:text-green-300 text-sm mb-4">
              You've been working out for {formatTime(elapsedTime)}
            </p>
            <Button
              onClick={completeWorkout}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Workout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-bold text-green-800 dark:text-green-400">
          Create Manual Workout
        </h2>
      </div>

      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-800 dark:text-gray-200">
            Workout Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="workout-type">Workout Type</Label>
            <Select value={workoutType} onValueChange={setWorkoutType}>
              <SelectTrigger>
                <SelectValue placeholder="Select workout type" />
              </SelectTrigger>
              <SelectContent>
                {workoutTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {workoutType === 'custom' && (
            <div>
              <Label htmlFor="custom-name">Custom Workout Name</Label>
              <Input
                id="custom-name"
                value={customWorkoutName}
                onChange={(e) => setCustomWorkoutName(e.target.value)}
                placeholder="e.g., Upper Body Strength"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-800 dark:text-gray-200">
              Exercises ({selectedExercises.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExerciseSearch(!showExerciseSearch)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Find Exercise
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={addCustomExercise}
              >
                <Plus className="w-4 h-4 mr-2" />
                Custom
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showExerciseSearch && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex gap-2 mb-3">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for exercises..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchExercises()}
                />
                <Button onClick={handleSearchExercises} disabled={isLoading}>
                  Search
                </Button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {searchResults.slice(0, 5).map((exercise, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => addExercise(exercise)}
                    >
                      <div>
                        <div className="font-medium">{exercise.name}</div>
                        <div className="text-sm text-gray-500">{exercise.muscle}</div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            {selectedExercises.map((exercise, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium">{exercise.name}</div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">{exercise.muscle}</Badge>
                    <Badge variant="outline" className="text-xs">{exercise.difficulty}</Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExercise(exercise.name)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {selectedExercises.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No exercises added yet. Search for exercises or add custom ones.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        onClick={startWorkout}
        disabled={!workoutType || selectedExercises.length === 0 || (workoutType === 'custom' && !customWorkoutName.trim())}
        size="lg"
        className="w-full bg-green-600 hover:bg-green-700"
      >
        <Play className="w-5 h-5 mr-2" />
        Start Workout
      </Button>
    </div>
  );
};

// Exercise card component for tracking
interface ExerciseCardProps {
  exercise: Exercise;
  onLog: (exercise: Exercise, sets: number, reps: number, weight?: number) => void;
  isLogged: boolean;
}

const ExerciseCard = ({ exercise, onLog, isLogged }: ExerciseCardProps) => {
  const [sets, setSets] = useState<number>(3);
  const [reps, setReps] = useState<number>(10);
  const [weight, setWeight] = useState<number | undefined>();
  const [showForm, setShowForm] = useState(false);

  const handleLog = () => {
    onLog(exercise, sets, reps, weight);
    setShowForm(false);
  };

  return (
    <Card className={`${isLogged ? 'bg-green-50 dark:bg-green-900/20 border-green-200' : 'bg-white dark:bg-gray-800'}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg text-gray-800 dark:text-gray-200">
              {exercise.name}
            </CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary">{exercise.muscle}</Badge>
              <Badge variant="outline">{exercise.difficulty}</Badge>
              {exercise.equipment && (
                <Badge variant="outline">{exercise.equipment}</Badge>
              )}
            </div>
          </div>
          {isLogged ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm(!showForm)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      {exercise.instructions && (
        <CardContent className="pt-0 pb-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {exercise.instructions}
          </p>
        </CardContent>
      )}

      {showForm && !isLogged && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-xs text-gray-500">Sets</label>
              <Input
                type="number"
                value={sets}
                onChange={(e) => setSets(Number(e.target.value))}
                min={1}
                max={10}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Reps</label>
              <Input
                type="number"
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
                min={1}
                max={50}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Weight (lbs)</label>
              <Input
                type="number"
                value={weight || ''}
                onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Optional"
              />
            </div>
          </div>
          <Button onClick={handleLog} size="sm" className="w-full">
            Log Exercise
          </Button>
        </CardContent>
      )}
    </Card>
  );
};

export default ManualWorkoutCreator;
