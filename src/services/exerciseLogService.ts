
import { supabase } from '@/integrations/supabase/client';
import { ExerciseLog } from '@/types/workout';

export const logExercise = async (
  userId: string,
  sessionId: string,
  exerciseData: {
    exercise_name: string;
    muscle_group?: string;
    equipment?: string;
    sets: number;
    reps: number;
    weight_lbs?: number;
    difficulty?: string;
    exercise_instructions?: string;
  }
): Promise<ExerciseLog> => {
  console.log('Logging exercise:', { ...exerciseData, sessionId, userId });
  
  const { data, error } = await supabase
    .from('exercise_logs')
    .insert({
      user_id: userId,
      workout_session_id: sessionId,
      ...exerciseData
    })
    .select()
    .single();

  if (error) {
    console.error('Log exercise error:', error);
    throw new Error(`Failed to log exercise: ${error.message}`);
  }

  console.log('Exercise logged:', data);
  return data;
};
