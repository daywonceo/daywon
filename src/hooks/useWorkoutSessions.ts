
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { recordHabitActivity } from '@/utils/habitActivity';
import { WorkoutSession, ExerciseLog } from '@/types/workout';
import { 
  fetchWorkoutSessions, 
  createWorkoutSession, 
  completeWorkoutSession,
  deleteWorkoutSession
} from '@/services/workoutSessionService';
import { logExercise } from '@/services/exerciseLogService';
import { getPlannedWorkoutsForWeek, getCurrentWeekPlannedWorkouts } from '@/utils/workoutUtils';

export const useWorkoutSessions = () => {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { user } = useAuth();

  const fetchSessions = async () => {
    if (!user) {
      setSessions([]);
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const data = await fetchWorkoutSessions(user.id);
      setSessions(data);
      setError('');
    } catch (err: any) {
      console.error('Error fetching workout sessions:', err);
      const errorMessage = err.message || 'Failed to fetch workout sessions';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const createSession = async (workoutData: {
    workout_plan_id?: string;
    workout_date: string;
    workout_type: string;
    notes?: string;
    planned_day_of_week?: number;
  }) => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await createWorkoutSession(user.id, workoutData);
      await fetchSessions();
      return data;
    } catch (err: any) {
      console.error('Error creating workout session:', err);
      setError(err.message || 'Failed to create workout session');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const completeSession = async (sessionId: string, durationMinutes: number) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await completeWorkoutSession(user.id, sessionId, durationMinutes);

      // Auto-mark WORKOUT habit as completed if duration is 30+ minutes
      if (durationMinutes >= 30) {
        console.log('Workout duration is 30+ minutes, marking WORKOUT habit as completed');
        await recordHabitActivity('WORKOUT', 'completed', new Date());
        console.log('WORKOUT habit marked as completed for today');
      }

      await fetchSessions();
    } catch (err: any) {
      console.error('Error completing workout session:', err);
      setError(err.message || 'Failed to complete workout session');
    } finally {
      setIsLoading(false);
    }
  };

  const logExerciseForSession = async (sessionId: string, exerciseData: {
    exercise_name: string;
    muscle_group?: string;
    equipment?: string;
    sets: number;
    reps: number;
    weight_lbs?: number;
    difficulty?: string;
    exercise_instructions?: string;
  }) => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await logExercise(user.id, sessionId, exerciseData);
      return data;
    } catch (err: any) {
      console.error('Error logging exercise:', err);
      setError(err.message || 'Failed to log exercise');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await deleteWorkoutSession(user.id, sessionId);
      await fetchSessions(); // Refresh the list after deletion
    } catch (err: any) {
      console.error('Error deleting workout session:', err);
      setError(err.message || 'Failed to delete workout session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  return {
    sessions,
    isLoading,
    error,
    createSession,
    completeSession,
    deleteSession,
    logExercise: logExerciseForSession,
    refetch: fetchSessions,
    getPlannedWorkoutsForWeek: (startOfWeek: Date) => getPlannedWorkoutsForWeek(sessions, startOfWeek),
    getCurrentWeekPlannedWorkouts: () => getCurrentWeekPlannedWorkouts(sessions)
  };
};

export type { WorkoutSession, ExerciseLog };
