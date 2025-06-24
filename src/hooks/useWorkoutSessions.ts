import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { recordHabitActivity } from '@/utils/habitActivity';

export interface WorkoutSession {
  id: string;
  user_id: string;
  workout_plan_id: string | null;
  workout_date: string;
  workout_type: string;
  duration_minutes: number | null;
  is_completed: boolean;
  notes: string | null;
  planned_day_of_week: number | null;
  created_at: string;
  updated_at: string;
}

export interface ExerciseLog {
  id: string;
  user_id: string;
  workout_session_id: string;
  exercise_name: string;
  muscle_group: string | null;
  equipment: string | null;
  sets: number;
  reps: number;
  weight_lbs: number | null;
  difficulty: string | null;
  exercise_instructions: string | null;
  created_at: string;
}

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
      console.log('Fetching workout sessions for user:', user.id);
      
      const { data, error: fetchError } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('workout_date', { ascending: false });

      if (fetchError) {
        console.error('Supabase error details:', fetchError);
        throw new Error(`Database error: ${fetchError.message}`);
      }

      console.log('Workout sessions fetched successfully:', data?.length || 0);
      setSessions(data || []);
      setError(''); // Clear any previous errors
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
      console.log('Creating workout session:', { ...workoutData, userId: user.id });
      
      const { data, error: createError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          ...workoutData
        })
        .select()
        .single();

      if (createError) {
        console.error('Create session error:', createError);
        throw new Error(`Failed to create session: ${createError.message}`);
      }

      console.log('Workout session created:', data);
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
      console.log('Completing workout session:', sessionId, durationMinutes);
      
      const { error: updateError } = await supabase
        .from('workout_sessions')
        .update({ 
          is_completed: true,
          duration_minutes: durationMinutes
        })
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Complete session error:', updateError);
        throw new Error(`Failed to complete session: ${updateError.message}`);
      }

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

  const logExercise = async (sessionId: string, exerciseData: {
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
      console.log('Logging exercise:', { ...exerciseData, sessionId, userId: user.id });
      
      const { data, error: logError } = await supabase
        .from('exercise_logs')
        .insert({
          user_id: user.id,
          workout_session_id: sessionId,
          ...exerciseData
        })
        .select()
        .single();

      if (logError) {
        console.error('Log exercise error:', logError);
        throw new Error(`Failed to log exercise: ${logError.message}`);
      }

      console.log('Exercise logged:', data);
      return data;
    } catch (err: any) {
      console.error('Error logging exercise:', err);
      setError(err.message || 'Failed to log exercise');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getPlannedWorkoutsForWeek = (startOfWeek: Date): WorkoutSession[] => {
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return sessions.filter(session => {
      if (session.planned_day_of_week === null) return false;
      
      const sessionDate = new Date(session.workout_date);
      return sessionDate >= startOfWeek && sessionDate <= endOfWeek;
    });
  };

  const getCurrentWeekPlannedWorkouts = (): WorkoutSession[] => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start from Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    return getPlannedWorkoutsForWeek(startOfWeek);
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
    logExercise,
    refetch: fetchSessions,
    getPlannedWorkoutsForWeek,
    getCurrentWeekPlannedWorkouts
  };
};
