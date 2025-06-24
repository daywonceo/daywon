
import { supabase } from '@/integrations/supabase/client';
import { WorkoutSession } from '@/types/workout';

export const fetchWorkoutSessions = async (userId: string): Promise<WorkoutSession[]> => {
  console.log('Fetching workout sessions for user:', userId);
  
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('workout_date', { ascending: false });

  if (error) {
    console.error('Supabase error details:', error);
    throw new Error(`Database error: ${error.message}`);
  }

  console.log('Workout sessions fetched successfully:', data?.length || 0);
  return data || [];
};

export const createWorkoutSession = async (
  userId: string,
  workoutData: {
    workout_plan_id?: string;
    workout_date: string;
    workout_type: string;
    notes?: string;
    planned_day_of_week?: number;
  }
): Promise<WorkoutSession> => {
  console.log('Creating workout session:', { ...workoutData, userId });
  
  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({
      user_id: userId,
      ...workoutData
    })
    .select()
    .single();

  if (error) {
    console.error('Create session error:', error);
    throw new Error(`Failed to create session: ${error.message}`);
  }

  console.log('Workout session created:', data);
  return data;
};

export const completeWorkoutSession = async (
  userId: string,
  sessionId: string,
  durationMinutes: number
): Promise<void> => {
  console.log('Completing workout session:', sessionId, durationMinutes);
  
  const { error } = await supabase
    .from('workout_sessions')
    .update({ 
      is_completed: true,
      duration_minutes: durationMinutes
    })
    .eq('id', sessionId)
    .eq('user_id', userId);

  if (error) {
    console.error('Complete session error:', error);
    throw new Error(`Failed to complete session: ${error.message}`);
  }
};
