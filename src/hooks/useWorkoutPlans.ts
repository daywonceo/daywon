import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface WorkoutPlan {
  id: string;
  user_id: string;
  plan_type: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useWorkoutPlans = () => {
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { user } = useAuth();

  const fetchWorkoutPlans = async () => {
    if (!user) {
      setWorkoutPlans([]);
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Fetching workout plans for user:', user.id);
      
      const { data, error: fetchError } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Supabase error details:', fetchError);
        throw new Error(`Database error: ${fetchError.message}`);
      }

      console.log('Workout plans fetched successfully:', data?.length || 0);
      setWorkoutPlans(data || []);
      setError(''); // Clear any previous errors
    } catch (err: any) {
      console.error('Error fetching workout plans:', err);
      const errorMessage = err.message || 'Failed to fetch workout plans';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const createWorkoutPlan = async (planType: string, name: string) => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Creating workout plan:', { planType, name, userId: user.id });
      
      // Set all existing plans to inactive
      await supabase
        .from('workout_plans')
        .update({ is_active: false })
        .eq('user_id', user.id);

      const { data, error: createError } = await supabase
        .from('workout_plans')
        .insert({
          user_id: user.id,
          plan_type: planType,
          name,
          is_active: true
        })
        .select()
        .single();

      if (createError) {
        console.error('Create error:', createError);
        throw new Error(`Failed to create plan: ${createError.message}`);
      }

      console.log('Workout plan created:', data);
      await fetchWorkoutPlans();
      return data;
    } catch (err: any) {
      console.error('Error creating workout plan:', err);
      setError(err.message || 'Failed to create workout plan');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const setActivePlan = async (planId: string) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Setting active plan:', planId);
      
      // Set all plans to inactive
      await supabase
        .from('workout_plans')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Set selected plan to active
      const { error: updateError } = await supabase
        .from('workout_plans')
        .update({ is_active: true })
        .eq('id', planId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Set active plan error:', updateError);
        throw new Error(`Failed to set active plan: ${updateError.message}`);
      }

      await fetchWorkoutPlans();
    } catch (err: any) {
      console.error('Error setting active plan:', err);
      setError(err.message || 'Failed to set active plan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkoutPlans();
  }, [user]);

  return {
    workoutPlans,
    isLoading,
    error,
    createWorkoutPlan,
    setActivePlan,
    refetch: fetchWorkoutPlans
  };
};
