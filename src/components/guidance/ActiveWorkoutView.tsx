import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { useWorkoutPlans } from "@/hooks/useWorkoutPlans";
import { useWorkoutSessions, WorkoutSession } from "@/hooks/useWorkoutSessions";
import { useExercises } from "@/hooks/useExercises";
import { 
  startWorkoutSession, 
  pauseWorkoutSession, 
  resumeWorkoutSession, 
  syncWorkoutDuration 
} from "@/services/workoutSessionService";
import { toast } from "@/components/ui/sonner";
import { getWorkoutOptions } from "@/utils/workoutRotation";
import TimerFailPrompt from "./TimerFailPrompt";
import WorkoutSelectionScreen from "./WorkoutSelectionScreen";
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
  const [showWorkoutSelection, setShowWorkoutSelection] = useState(true);
  const [planGenerationFailed, setPlanGenerationFailed] = useState(false);
  
  const { workoutPlans } = useWorkoutPlans();
  const { sessions, createSession, completeSession, logExercise, refetch } = useWorkoutSessions();
  const { generateWorkoutPlan, isLoading } = useExercises();

  const activePlan = workoutPlans.find(plan => plan.is_active);

  // Check for existing active session that has been started (has timer running)
  useEffect(() => {
    const activeSession = sessions.find(session => {
      const sessionDate = new Date(session.workout_date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return sessionDate <= today && !session.is_completed && session.started_at;
    });

    if (activeSession) {
      console.log('Found existing STARTED session:', activeSession);
      setCurrentSession(activeSession);
      setSelectedWorkoutType(activeSession.workout_type);
      setShowWorkoutSelection(false);
      setWorkoutStarted(true);
      
      // Calculate elapsed time from started_at timestamp
      const startedAt = new Date(activeSession.started_at);
      const now = new Date();
      const totalElapsed = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
      const pauseDuration = activeSession.total_pause_duration_seconds || 0;
      const actualElapsed = Math.max(0, totalElapsed - pauseDuration);
      
      setStartTime(startedAt);
      setElapsedTime(actualElapsed);
      
      // Check if currently paused
      if (activeSession.paused_at) {
        setIsTimerPaused(true);
      }
    }
  }, [sessions]);

  // Timer effect - calculate from started_at timestamp
  useEffect(() => {
    if (startTime && workoutStarted && !isTimerPaused && currentSession) {
      const interval = setInterval(() => {
        const now = new Date();
        const totalElapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        const pauseDuration = currentSession.total_pause_duration_seconds || 0;
        const actualElapsed = Math.max(0, totalElapsed - pauseDuration);
        setElapsedTime(actualElapsed);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, workoutStarted, isTimerPaused, currentSession]);

  // Sync workout duration to database every 30 seconds
  useEffect(() => {
    if (currentSession && workoutStarted && !isTimerPaused && elapsedTime > 0) {
      const syncInterval = setInterval(async () => {
        const durationMinutes = Math.floor(elapsedTime / 60);
        if (durationMinutes > 0) {
          try {
            await syncWorkoutDuration(currentSession.user_id, currentSession.id, durationMinutes);
            console.log('Synced workout duration:', durationMinutes, 'minutes');
          } catch (error) {
            console.error('Failed to sync workout duration:', error);
          }
        }
      }, 30000); // Sync every 30 seconds
      return () => clearInterval(syncInterval);
    }
  }, [currentSession, workoutStarted, isTimerPaused, elapsedTime]);

  // Timer fail check
  useEffect(() => {
    if (workoutStarted && startTime && elapsedTime === 0) {
      const timeoutId = setTimeout(() => {
        if (elapsedTime === 0) {
          setShowTimerFailPrompt(true);
        }
      }, 10000);
      return () => clearTimeout(timeoutId);
    }
  }, [workoutStarted, startTime, elapsedTime]);

  const handleWorkoutTypeSelection = async (workoutType: string) => {
    if (!activePlan) return;

    try {
      console.log('Creating session for workout type:', workoutType);
      
      // Check if there's already an inactive session for today
      let session = sessions.find(s => {
        const sessionDate = new Date(s.workout_date);
        const today = new Date();
        return sessionDate.toDateString() === today.toDateString() && 
               !s.is_completed && 
               (!s.duration_minutes || s.duration_minutes === 0);
      });

      // If no existing session, create a new one
      if (!session) {
        session = await createSession({
          workout_plan_id: activePlan.id,
          workout_date: new Date().toISOString().split('T')[0],
          workout_type: workoutType
        });
      }

      if (session) {
        setCurrentSession(session);
        setSelectedWorkoutType(workoutType);
        setShowWorkoutSelection(false);
        console.log('Workout session ready, now generating plan...');

        // Generate workout plan after session is created and workout type is selected
        try {
          const plan = await generateWorkoutPlan(activePlan.plan_type, 'beginner');
          console.log('Generated workout plan:', plan);
          
          if (!plan || !plan[workoutType]) {
            console.log('No plan data received');
            setPlanGenerationFailed(true);
            toast.info('Exercises unavailable due to API limits, but you can still track your workout manually.');
          } else {
            setWorkoutPlan(plan[workoutType]);
            setPlanGenerationFailed(false);
            toast.success('Workout plan loaded successfully!');
          }
        } catch (error) {
          console.error('Error generating workout plan:', error);
          setPlanGenerationFailed(true);
          toast.info('Exercise database temporarily unavailable. You can still track your workout time manually.');
        }
      }
    } catch (error) {
      console.error('Error creating workout session:', error);
      toast.error('Failed to create workout session');
    }
  };

  const handleBackToSelection = () => {
    setShowWorkoutSelection(true);
    setSelectedWorkoutType('');
    setCurrentSession(null);
    setWorkoutPlan(null);
    setStartTime(null);
    setElapsedTime(0);
    setWorkoutStarted(false);
    setIsTimerPaused(false);
    setPlanGenerationFailed(false);
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

  const handleStartTimer = async () => {
    if (!currentSession) return;
    
    const now = new Date();
    setStartTime(now);
    setWorkoutStarted(true);
    setIsTimerPaused(false);
    setElapsedTime(0);
    
    try {
      await startWorkoutSession(currentSession.user_id, currentSession.id);
      console.log('Timer started at:', now);
      toast.success("Workout timer started!");
    } catch (error) {
      console.error('Failed to start workout session:', error);
      toast.error('Failed to start timer');
    }
  };

  const handlePauseTimer = async () => {
    if (!currentSession) return;
    
    setIsTimerPaused(true);
    
    try {
      await pauseWorkoutSession(currentSession.user_id, currentSession.id);
      console.log('Timer paused at:', elapsedTime, 'seconds');
      toast.info("Timer paused");
    } catch (error) {
      console.error('Failed to pause workout session:', error);
      toast.error('Failed to pause timer');
    }
  };

  const handleResumeTimer = async () => {
    if (!currentSession || !currentSession.paused_at) return;
    
    const pausedAt = new Date(currentSession.paused_at);
    const now = new Date();
    const pauseDurationSeconds = Math.floor((now.getTime() - pausedAt.getTime()) / 1000);
    
    try {
      await resumeWorkoutSession(currentSession.user_id, currentSession.id, pauseDurationSeconds);
      setIsTimerPaused(false);
      console.log('Timer resumed after', pauseDurationSeconds, 'seconds pause');
      toast.success("Timer resumed!");
      
      // Refresh session data to get updated total_pause_duration_seconds
      await refetch();
    } catch (error) {
      console.error('Failed to resume workout session:', error);
      toast.error('Failed to resume timer');
    }
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

  // Show workout selection screen
  if (showWorkoutSelection && activePlan) {
    const workoutOptions = getWorkoutOptions(activePlan.plan_type, sessions);
    
    return (
      <WorkoutSelectionScreen
        activePlan={activePlan}
        workoutOptions={workoutOptions}
        isLoading={isLoading}
        onWorkoutSelect={handleWorkoutTypeSelection}
        onBack={onBack}
      />
    );
  }

  // Active workout screen
  if (!showWorkoutSelection && currentSession && selectedWorkoutType) {
    return (
      <div className="animate-fade-in space-y-4 sm:space-y-6 px-2 sm:px-0">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Button variant="ghost" size="sm" onClick={handleBackToSelection} className="flex-shrink-0">
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
                    Exercise List Temporarily Unavailable
                  </h3>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-4">
                    The exercise database is currently at capacity, but you can still track your workout time and log exercises manually.
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
                            } else {
                              toast.info('Still using backup exercises due to API limits');
                            }
                          })
                          .catch(() => {
                            toast.info('Exercise database still at capacity - manual logging available');
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
          <Button onClick={onBack} variant="success">
            Back to Overview
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActiveWorkoutView;
