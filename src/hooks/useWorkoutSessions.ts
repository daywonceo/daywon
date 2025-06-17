
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface WorkoutSession {
  id: string;
  user_id: string;
  workout_plan_id: string | null;
  workout_date: string;
  workout_type: string;
  duration_minutes: number | null;
  is_completed: boolean;
  notes: string | null;
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
        console.error('Supabase error:', fetchError);
        throw fetchError;
      }

      console.log('Workout sessions fetched:', data?.length || 0);
      setSessions(data || []);
    } catch (err) {
      console.error('Error fetching workout sessions:', err);
      setError('Failed to fetch workout sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const createSession = async (workoutData: {
    workout_plan_id?: string;
    workout_date: string;
    workout_type: string;
    notes?: string;
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
        throw createError;
      }

      console.log('Workout session created:', data);
      await fetchSessions();
      return data;
    } catch (err) {
      console.error('Error creating workout session:', err);
      setError('Failed to create workout session');
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
      
      await supabase
        .from('workout_sessions')
        .update({ 
          is_completed: true,
          duration_minutes: durationMinutes
        })
        .eq('id', sessionId)
        .eq('user_id', user.id);

      await fetchSessions();
    } catch (err) {
      console.error('Error completing workout session:', err);
      setError('Failed to complete workout session');
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
        throw logError;
      }

      console.log('Exercise logged:', data);
      return data;
    } catch (err) {
      console.error('Error logging exercise:', err);
      setError('Failed to log exercise');
      return null;
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
    logExercise,
    refetch: fetchSessions
  };
};
