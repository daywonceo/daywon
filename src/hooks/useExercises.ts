
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Exercise {
  name: string;
  type: string;
  muscle: string;
  equipment: string;
  difficulty: string;
  instructions: string;
}

export const useExercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchExercises = async (params: {
    muscle?: string;
    difficulty?: string;
    type?: string;
    name?: string;
  } = {}) => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Fetching exercises with params:', params);
      
      const { data, error: fetchError } = await supabase.functions.invoke('get-exercises', {
        body: params
      });

      if (fetchError) {
        throw fetchError;
      }

      setExercises(data || []);
      console.log('Exercises loaded:', data?.length || 0);
    } catch (err) {
      console.error('Error fetching exercises:', err);
      setError('Failed to fetch exercises');
    } finally {
      setIsLoading(false);
    }
  };

  const generateWorkoutPlan = async (planType: string, difficulty: string = 'beginner') => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Generating workout plan:', planType, difficulty);
      
      const { data, error: generateError } = await supabase.functions.invoke('generate-workout-plan', {
        body: { planType, difficulty }
      });

      if (generateError) {
        throw generateError;
      }

      console.log('Workout plan generated:', data);
      return data;
    } catch (err) {
      console.error('Error generating workout plan:', err);
      setError('Failed to generate workout plan');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    exercises,
    isLoading,
    error,
    fetchExercises,
    generateWorkoutPlan
  };
};
