
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Pause, CheckCircle, Plus, Timer } from "lucide-react";
import { useWorkoutPlans } from "@/hooks/useWorkoutPlans";
import { useWorkoutSessions } from "@/hooks/useWorkoutSessions";
import { useExercises } from "@/hooks/useExercises";

interface ActiveWorkoutViewProps {
  onBack: () => void;
}

const ActiveWorkoutView = ({ onBack }: ActiveWorkoutViewProps) => {
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<string>('');
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [exerciseLogs, setExerciseLogs] = useState<any[]>([]);
  
  const { workoutPlans } = useWorkoutPlans();
  const { createSession, completeSession, logExercise } = useWorkoutSessions();
  const { generateWorkoutPlan, isLoading } = useExercises();

  const activePlan = workoutPlans.find(plan => plan.is_active);

  // Timer effect
  useEffect(() => {
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

  const handleStartWorkout = async (workoutType: string) => {
    if (!activePlan) return;

    try {
      // Generate workout plan
      const plan = await generateWorkoutPlan(activePlan.plan_type, 'beginner');
      if (!plan || !plan[workoutType]) return;

      // Create session
      const session = await createSession({
        workout_plan_id: activePlan.id,
        workout_date: new Date().toISOString().split('T')[0],
        workout_type: workoutType
      });

      if (session) {
        setCurrentSession(session);
        setWorkoutPlan(plan[workoutType]);
        setStartTime(new Date());
        setSelectedWorkoutType(workoutType);
      }
    } catch (error) {
      console.error('Error starting workout:', error);
    }
  };

  const handleLogExercise = async (exercise: any, sets: number, reps: number, weight?: number) => {
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
      setExerciseLogs(prev => [...prev, { ...log, exercise }]);
    }
  };

  const handleCompleteWorkout = async () => {
    if (!currentSession || !startTime) return;

    const durationMinutes = Math.floor(elapsedTime / 60);
    await completeSession(currentSession.id, durationMinutes);
    onBack();
  };

  // Workout type selection
  if (!currentSession && activePlan) {
    const workoutTypes = getWorkoutTypesForPlan(activePlan.plan_type);
    
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-bold text-green-800 dark:text-green-400">
            Start Workout
          </h2>
        </div>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-800 dark:text-gray-200">
              Choose Today's Workout
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {workoutTypes.map((type) => (
              <Button
                key={type}
                variant="outline"
                className="w-full h-16 text-left justify-start"
                onClick={() => handleStartWorkout(type)}
                disabled={isLoading}
              >
                <div className="flex items-center gap-3">
                  <Play className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium">
                      {type.replace(/_/g, ' ').toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-500">
                      Estimated 45-60 minutes
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active workout view
  if (currentSession && workoutPlan) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-xl font-bold text-green-800 dark:text-green-400">
              {selectedWorkoutType.replace(/_/g, ' ').toUpperCase()}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <Timer className="w-4 h-4" />
            <span className="font-mono text-lg">{formatTime(elapsedTime)}</span>
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-4">
          {workoutPlan.exercises.map((exercise: any, index: number) => (
            <ExerciseCard
              key={index}
              exercise={exercise}
              onLog={handleLogExercise}
              isLogged={exerciseLogs.some(log => log.exercise_name === exercise.name)}
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
              onClick={handleCompleteWorkout}
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

  return null;
};

// Exercise card component
interface ExerciseCardProps {
  exercise: any;
  onLog: (exercise: any, sets: number, reps: number, weight?: number) => void;
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

// Helper function to get workout types based on plan
const getWorkoutTypesForPlan = (planType: string): string[] => {
  switch (planType) {
    case 'push_pull_legs':
      return ['push', 'pull', 'legs'];
    case 'upper_lower':
      return ['upper', 'lower'];
    case 'full_body':
      return ['full_body'];
    case 'chest_back_shoulders_arms_legs':
      return ['chest_back', 'shoulders_arms', 'legs'];
    default:
      return ['full_body'];
  }
};

export default ActiveWorkoutView;
