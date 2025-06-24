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
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [showTimerFailPrompt, setShowTimerFailPrompt] = useState(false);
  const [manualMinutes, setManualMinutes] = useState<string>('');
  const [viewState, setViewState] = useState<'selection' | 'workout'>('selection');
  const [planGenerationFailed, setPlanGenerationFailed] = useState(false);
  
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
      
      // Try to generate workout plan for active sessions that have a plan_id
      if (activeSession.workout_plan_id && activePlan) {
        console.log('Generating workout plan for existing session');
        generateWorkoutPlan(activePlan.plan_type, 'beginner')
          .then(plan => {
            console.log('Generated plan:', plan);
            if (plan && plan[activeSession.workout_type]) {
              setWorkoutPlan(plan[activeSession.workout_type]);
              setPlanGenerationFailed(false);
            } else {
              console.log('Plan generation returned empty result');
              setPlanGenerationFailed(true);
            }
          })
          .catch(error => {
            console.error('Failed to generate workout plan:', error);
            setPlanGenerationFailed(true);
            toast.error('Unable to load exercises. You can still track your workout manually.');
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
      console.log('Generating workout plan for type:', workoutType);
      // Generate workout plan first
      const plan = await generateWorkoutPlan(activePlan.plan_type, 'beginner');
      console.log('Generated workout plan:', plan);
      
      if (!plan || !plan[workoutType]) {
        toast.error('Failed to generate workout plan. You can still track your workout manually.');
        setPlanGenerationFailed(true);
      } else {
        setWorkoutPlan(plan[workoutType]);
        setPlanGenerationFailed(false);
      }

      // Create session regardless of plan generation success
      const session = await createSession({
        workout_plan_id: activePlan.id,
        workout_date: new Date().toISOString().split('T')[0],
        workout_type: workoutType
      });

      if (session) {
        setCurrentSession(session);
        setSelectedWorkoutType(workoutType);
        setViewState('workout');
        console.log('Workout session created');
      }
    } catch (error) {
      console.error('Error creating workout session:', error);
      toast.error('Failed to create workout session');
    }
  };

  const handleToggleExerciseComplete = (exerciseName: string, completed: boolean) => {
    setCompletedExercises(prev => {
      const newSet = new Set(prev);
      if (completed) {
        newSet.add(exerciseName);
        toast.success(`${exerciseName} marked as complete!`);
      } else {
        newSet.delete(exerciseName);
        toast.info(`${exerciseName} unmarked`);
      }
      return newSet;
    });
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
      <div className="animate-fade-in space-y-4 sm:space-y-6 px-2 sm:px-0">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Button variant="ghost" size="sm" onClick={onBack} className="flex-shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-green-800 dark:text-green-400 truncate">
                {selectedWorkoutType.replace(/_/g, ' ').toUpperCase()}
              </h2>
              {!currentSession.workout_plan_id && (
                <Badge variant="outline" className="text-xs mt-1">Manual</Badge>
              )}
            </div>
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

        {/* Show exercises for plan-based workouts, with fallback if generation failed */}
        {currentSession.workout_plan_id && (
          <>
            {planGenerationFailed ? (
              <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                <CardContent className="p-4 sm:p-6 text-center">
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
                    Exercise List Unavailable
                  </h3>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-4">
                    We couldn't load your exercise list, but you can still track your workout time and log exercises manually.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (activePlan) {
                        generateWorkoutPlan(activePlan.plan_type, 'beginner')
                          .then(plan => {
                            if (plan && plan[selectedWorkoutType]) {
                              setWorkoutPlan(plan[selectedWorkoutType]);
                              setPlanGenerationFailed(false);
                              toast.success('Exercises loaded successfully!');
                            }
                          })
                          .catch(() => {
                            toast.error('Still unable to load exercises');
                          });
                      }
                    }}
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                  >
                    Try Loading Exercises Again
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <ExerciseList
                workoutPlan={workoutPlan}
                exerciseLogs={exerciseLogs}
                completedExercises={completedExercises}
                onLogExercise={handleLogExercise}
                onToggleExerciseComplete={handleToggleExerciseComplete}
              />
            )}
          </>
        )}

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
    <div className="animate-fade-in space-y-6 px-2 sm:px-0">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-bold text-green-800 dark:text-green-400">
          No Active Plan
        </h2>
      </div>

      <Card className="bg-white dark:bg-gray-800">
        <CardContent className="p-6 sm:p-8 text-center">
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
