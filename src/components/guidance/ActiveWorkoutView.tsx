import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Pause, CheckCircle, Plus, Timer, AlertTriangle, RotateCcw } from "lucide-react";
import { useWorkoutPlans } from "@/hooks/useWorkoutPlans";
import { useWorkoutSessions } from "@/hooks/useWorkoutSessions";
import { useExercises } from "@/hooks/useExercises";
import { toast } from "@/components/ui/sonner";

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
  const [showLongRunningAlert, setShowLongRunningAlert] = useState(false);
  const [manualDuration, setManualDuration] = useState<string>('');
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  
  const { workoutPlans } = useWorkoutPlans();
  const { sessions, createSession, completeSession, logExercise, refetch } = useWorkoutSessions();
  const { generateWorkoutPlan, isLoading } = useExercises();

  const activePlan = workoutPlans.find(plan => plan.is_active);

  // Check for existing active session and validate its state
  useEffect(() => {
    const activeSession = sessions.find(session => {
      const sessionDate = new Date(session.workout_date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return sessionDate <= today && !session.is_completed;
    });

    if (activeSession) {
      console.log('Found existing active session:', activeSession);
      
      // Fallback check: if workout is "In Progress" but has no valid start time or duration
      const sessionCreatedAt = new Date(activeSession.created_at);
      const timeSinceCreation = Date.now() - sessionCreatedAt.getTime();
      
      // If session was created more than 5 minutes ago but has no duration and no exercises logged
      if (timeSinceCreation > 5 * 60 * 1000 && !activeSession.duration_minutes) {
        console.log('Detected potentially stuck workout, checking for activity...');
        
        // Check if any exercises were logged for this session
        // For now, we'll assume if no start time is properly set, it needs to be reset
        if (!startTime && elapsedTime === 0) {
          console.log('Resetting stuck workout session');
          setCurrentSession(activeSession);
          setSelectedWorkoutType(activeSession.workout_type);
          setWorkoutStarted(false); // Mark as not started to show proper buttons
          return;
        }
      }
      
      setCurrentSession(activeSession);
      setSelectedWorkoutType(activeSession.workout_type);
      setWorkoutStarted(true);
      
      // Set start time to creation time if we're resuming
      setStartTime(sessionCreatedAt);
      
      // Generate workout plan if needed
      if (activeSession.workout_plan_id && activePlan) {
        generateWorkoutPlan(activePlan.plan_type, 'beginner').then(plan => {
          if (plan && plan[activeSession.workout_type]) {
            setWorkoutPlan(plan[activeSession.workout_type]);
          }
        });
      }
    }
  }, [sessions, activePlan, generateWorkoutPlan, startTime, elapsedTime]);

  // Timer effect with long-running workout check
  useEffect(() => {
    if (startTime && workoutStarted && !isTimerPaused) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
        
        // Check if workout has been running for more than 2 hours
        if (elapsed > 7200 && !showLongRunningAlert) {
          setShowLongRunningAlert(true);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, workoutStarted, isTimerPaused, showLongRunningAlert]);

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
        setSelectedWorkoutType(workoutType);
        // Don't start timer yet - wait for user to explicitly start
        setWorkoutStarted(false);
      }
    } catch (error) {
      console.error('Error starting workout:', error);
    }
  };

  const handleStartTimer = () => {
    setStartTime(new Date());
    setWorkoutStarted(true);
    setIsTimerPaused(false);
    toast.success("Workout timer started!");
  };

  const handlePauseTimer = () => {
    setIsTimerPaused(true);
    toast.info("Workout timer paused");
  };

  const handleResumeTimer = () => {
    // Adjust start time to account for paused duration
    const pausedDuration = elapsedTime * 1000; // Convert to milliseconds
    setStartTime(new Date(Date.now() - pausedDuration));
    setIsTimerPaused(false);
    toast.success("Workout timer resumed!");
  };

  const handleResetWorkout = async () => {
    if (!currentSession) return;
    
    // Reset the session by completing it with 0 duration, then create a new one
    await completeSession(currentSession.id, 0);
    
    // Reset all states
    setStartTime(null);
    setElapsedTime(0);
    setWorkoutStarted(false);
    setIsTimerPaused(false);
    setExerciseLogs([]);
    
    // Refetch sessions to get updated state
    await refetch();
    
    toast.success("Workout reset successfully");
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

  const handleCompleteWorkout = async (customDuration?: number) => {
    if (!currentSession || (!startTime && !customDuration)) return;

    const durationMinutes = customDuration || Math.floor(elapsedTime / 60);
    await completeSession(currentSession.id, durationMinutes);
    toast.success(`Workout completed! Duration: ${durationMinutes} minutes`);
    onBack();
  };

  const handleForgotToStop = () => {
    const duration = parseInt(manualDuration);
    if (duration && duration > 0) {
      handleCompleteWorkout(duration);
    } else {
      toast.error("Please enter a valid duration");
    }
  };

  const dismissLongRunningAlert = () => {
    setShowLongRunningAlert(false);
    toast.info("Timer will continue running");
  };

  // Long-running workout alert
  if (showLongRunningAlert) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-bold text-orange-800 dark:text-orange-400">
            Long Running Workout Detected
          </h2>
        </div>

        <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="text-orange-800 dark:text-orange-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Workout Running for {formatTime(elapsedTime)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-orange-700 dark:text-orange-300">
              It looks like this workout has been running for a while. Did you forget to stop the timer?
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-orange-800 dark:text-orange-300 mb-2">
                  How long did your workout actually take? (minutes)
                </label>
                <Input
                  type="number"
                  value={manualDuration}
                  onChange={(e) => setManualDuration(e.target.value)}
                  placeholder="e.g., 60"
                  className="bg-white dark:bg-gray-800"
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={handleForgotToStop}
                  className="bg-orange-600 hover:bg-orange-700"
                  disabled={!manualDuration}
                >
                  Yes - I forgot to stop it
                </Button>
                <Button
                  variant="outline"
                  onClick={dismissLongRunningAlert}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  No - Keep running
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Workout type selection (only show if no active session and we have an active plan)
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
  if (currentSession) {
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
          
          {/* Timer and Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-green-600">
              <Timer className="w-4 h-4" />
              <span className="font-mono text-lg">{formatTime(elapsedTime)}</span>
              {isTimerPaused && <span className="text-xs text-orange-500">(Paused)</span>}
            </div>
          </div>
        </div>

        {/* Timer Control Buttons */}
        <Card className="bg-gray-50 dark:bg-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Workout Controls
              </div>
              <div className="flex gap-2">
                {!workoutStarted && elapsedTime === 0 && (
                  <Button
                    onClick={handleStartTimer}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Timer
                  </Button>
                )}
                
                {workoutStarted && !isTimerPaused && (
                  <Button
                    onClick={handlePauseTimer}
                    size="sm"
                    variant="outline"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                )}
                
                {isTimerPaused && (
                  <Button
                    onClick={handleResumeTimer}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </Button>
                )}
                
                {elapsedTime === 0 && (
                  <Button
                    onClick={handleResetWorkout}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Show exercises if we have a workout plan */}
        {workoutPlan && workoutPlan.exercises && (
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
        )}

        {/* Show message for manual workouts without exercises */}
        {!workoutPlan && (
          <Card className="bg-gray-50 dark:bg-gray-700">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Manual Workout in Progress
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                This is a manual workout. Start the timer when you begin exercising.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Complete Workout - only show if timer has been started */}
        {(workoutStarted || elapsedTime > 0) && (
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold text-green-800 dark:text-green-400 mb-2">
                Ready to finish?
              </h3>
              <p className="text-green-600 dark:text-green-300 text-sm mb-4">
                You've been working out for {formatTime(elapsedTime)}
              </p>
              <Button
                onClick={() => handleCompleteWorkout()}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Workout
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // If no active session and no active plan, show message
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-bold text-green-800 dark:text-green-400">
          No Active Workout
        </h2>
      </div>

      <Card className="bg-white dark:bg-gray-800">
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            No Workout in Progress
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start a new workout from your active plan or create a manual workout.
          </p>
          <Button onClick={onBack} className="bg-green-600 hover:bg-green-700">
            Back to Overview
          </Button>
        </CardContent>
      </Card>
    </div>
  );
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
