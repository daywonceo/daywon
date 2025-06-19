
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { useWorkoutPlans } from "@/hooks/useWorkoutPlans";
import { useWorkoutSessions, WorkoutSession } from "@/hooks/useWorkoutSessions";
import { useExercises } from "@/hooks/useExercises";
import { toast } from "@/components/ui/sonner";
import { getWorkoutTypesForPlan } from "@/utils/workoutHelpers";
import TimerFailPrompt from "./TimerFailPrompt";
import WorkoutTypeSelection from "./WorkoutTypeSelection";
import WorkoutTimer from "./WorkoutTimer";
import ExerciseList from "./ExerciseList";
import WorkoutCompletion from "./WorkoutCompletion";

interface ActiveWorkoutViewProps {
  onBack: () => void;
}

const ActiveWorkoutView = ({ onBack }: ActiveWorkoutViewProps) => {
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<string>('');
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [exerciseLogs, setExerciseLogs] = useState<any[]>([]);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [showTimerFailPrompt, setShowTimerFailPrompt] = useState(false);
  const [manualMinutes, setManualMinutes] = useState<string>('');
  const [viewState, setViewState] = useState<'selection' | 'workout'>('selection');
  
  const { workoutPlans } = useWorkoutPlans();
  const { sessions, createSession, completeSession, logExercise, refetch } = useWorkoutSessions();
  const { generateWorkoutPlan, isLoading } = useExercises();

  const activePlan = workoutPlans.find(plan => plan.is_active);

  // Check for existing active session
  useEffect(() => {
    const activeSession = sessions.find(session => {
      const sessionDate = new Date(session.workout_date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return sessionDate <= today && !session.is_completed;
    });

    if (activeSession) {
      console.log('Found existing active session:', activeSession);
      setCurrentSession(activeSession);
      setSelectedWorkoutType(activeSession.workout_type);
      setViewState('workout');
      
      // Check if workout has been started (has duration > 0)
      if (activeSession.duration_minutes && activeSession.duration_minutes > 0) {
        setWorkoutStarted(true);
        setStartTime(new Date(activeSession.created_at));
        setElapsedTime(activeSession.duration_minutes * 60);
      }
      
      // Generate workout plan if needed
      if (activeSession.workout_plan_id && activePlan) {
        generateWorkoutPlan(activePlan.plan_type, 'beginner').then(plan => {
          if (plan && plan[activeSession.workout_type]) {
            setWorkoutPlan(plan[activeSession.workout_type]);
          }
        });
      }
    }
  }, [sessions, activePlan, generateWorkoutPlan]);

  // Timer effect
  useEffect(() => {
    if (startTime && workoutStarted && !isTimerPaused) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, workoutStarted, isTimerPaused]);

  // Timer fail check - if user tries to start but timer doesn't increment after 10 seconds
  useEffect(() => {
    if (workoutStarted && startTime && elapsedTime === 0) {
      const timeoutId = setTimeout(() => {
        if (elapsedTime === 0) {
          setShowTimerFailPrompt(true);
        }
      }, 10000); // 10 seconds
      return () => clearTimeout(timeoutId);
    }
  }, [workoutStarted, startTime, elapsedTime]);

  const handleWorkoutTypeSelection = async (workoutType: string) => {
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
        setSelectedWorkoutType(workoutType);
        setViewState('workout');
        console.log('Workout session created, ready to start timer');
      }
    } catch (error) {
      console.error('Error creating workout session:', error);
      toast.error('Failed to create workout session');
    }
  };

  const handleStartTimer = () => {
    const now = new Date();
    setStartTime(now);
    setWorkoutStarted(true);
    setIsTimerPaused(false);
    setElapsedTime(0);
    console.log('Timer started at:', now);
    toast.success("Workout timer started!");
  };

  const handlePauseTimer = () => {
    setIsTimerPaused(true);
    console.log('Timer paused at:', elapsedTime, 'seconds');
    toast.info("Timer paused");
  };

  const handleResumeTimer = () => {
    if (startTime) {
      const pausedDuration = elapsedTime * 1000;
      setStartTime(new Date(Date.now() - pausedDuration));
    }
    setIsTimerPaused(false);
    console.log('Timer resumed');
    toast.success("Timer resumed!");
  };

  const handleStopWorkout = () => {
    if (elapsedTime > 0) {
      handleCompleteWorkout();
    } else {
      setStartTime(null);
      setElapsedTime(0);
      setWorkoutStarted(false);
      setIsTimerPaused(false);
      toast.info("Workout stopped");
    }
  };

  const handleCompleteWorkout = async (customDuration?: number) => {
    if (!currentSession) return;

    const durationMinutes = customDuration || Math.max(1, Math.floor(elapsedTime / 60));
    await completeSession(currentSession.id, durationMinutes);
    toast.success(`Workout completed! Duration: ${durationMinutes} minutes`);
    onBack();
  };

  const handleManualTimeEntry = () => {
    const minutes = parseInt(manualMinutes);
    if (minutes && minutes > 0) {
      handleCompleteWorkout(minutes);
    } else {
      toast.error("Please enter a valid duration");
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
      toast.success("Exercise logged!");
    }
  };

  // Timer fail prompt
  if (showTimerFailPrompt) {
    return (
      <TimerFailPrompt
        manualMinutes={manualMinutes}
        onManualMinutesChange={setManualMinutes}
        onManualTimeEntry={handleManualTimeEntry}
        onTryAgain={() => {
          setShowTimerFailPrompt(false);
          setWorkoutStarted(false);
          setStartTime(null);
          setElapsedTime(0);
        }}
        onBack={onBack}
      />
    );
  }

  // Workout type selection screen
  if (viewState === 'selection' && activePlan) {
    const workoutTypes = getWorkoutTypesForPlan(activePlan.plan_type);
    
    return (
      <WorkoutTypeSelection
        activePlan={activePlan}
        workoutTypes={workoutTypes}
        isLoading={isLoading}
        onWorkoutTypeSelect={handleWorkoutTypeSelection}
        onBack={onBack}
      />
    );
  }

  // Active workout screen
  if (viewState === 'workout' && currentSession) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-xl font-bold text-green-800 dark:text-green-400">
              {selectedWorkoutType.replace(/_/g, ' ').toUpperCase()}
              {!currentSession.workout_plan_id && (
                <Badge variant="outline" className="ml-2">Manual</Badge>
              )}
            </h2>
          </div>
        </div>

        <WorkoutTimer
          elapsedTime={elapsedTime}
          isTimerPaused={isTimerPaused}
          workoutStarted={workoutStarted}
          onStartTimer={handleStartTimer}
          onPauseTimer={handlePauseTimer}
          onResumeTimer={handleResumeTimer}
          onStopWorkout={handleStopWorkout}
        />

        <ExerciseList
          workoutPlan={workoutPlan}
          exerciseLogs={exerciseLogs}
          onLogExercise={handleLogExercise}
        />

        {workoutStarted && elapsedTime > 0 && (
          <WorkoutCompletion
            elapsedTime={elapsedTime}
            onComplete={() => handleCompleteWorkout()}
          />
        )}
      </div>
    );
  }

  // No active plan fallback
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-bold text-green-800 dark:text-green-400">
          No Active Plan
        </h2>
      </div>

      <Card className="bg-white dark:bg-gray-800">
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            No Active Workout Plan
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create a workout plan first to start tracking your workouts.
          </p>
          <Button onClick={onBack} className="bg-green-600 hover:bg-green-700">
            Back to Overview
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActiveWorkoutView;
