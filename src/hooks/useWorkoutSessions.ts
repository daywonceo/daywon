
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
    if (!user) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const { data, error: fetchError } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('workout_date', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

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
    if (!user) return null;

    try {
      const { data, error: createError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          ...workoutData
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      await fetchSessions();
      return data;
    } catch (err) {
      console.error('Error creating workout session:', err);
      setError('Failed to create workout session');
      return null;
    }
  };

  const completeSession = async (sessionId: string, durationMinutes: number) => {
    if (!user) return;

    try {
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
    if (!user) return null;

    try {
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
        throw logError;
      }

      return data;
    } catch (err) {
      console.error('Error logging exercise:', err);
      setError('Failed to log exercise');
      return null;
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
