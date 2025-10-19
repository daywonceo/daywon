
import { supabase } from '@/integrations/supabase/client';
import { WorkoutSession } from '@/types/workout';

export const fetchWorkoutSessions = async (
  userId: string,
  options: {
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
    includeCompleted?: boolean;
  } = {}
): Promise<WorkoutSession[]> => {
  console.log('Fetching workout sessions for user:', userId, options);
  
  let query = supabase
    .from('workout_sessions')
    .select(`
      *,
      exercise_logs (
        id,
        exercise_name,
        muscle_group,
        equipment,
        sets,
        reps,
        weight_lbs,
        difficulty,
        exercise_instructions,
        created_at
      )
    `)
    .eq('user_id', userId);

  if (options.dateFrom) {
    query = query.gte('workout_date', options.dateFrom);
  }

  if (options.dateTo) {
    query = query.lte('workout_date', options.dateTo);
  }

  if (options.includeCompleted !== undefined) {
    query = query.eq('is_completed', options.includeCompleted);
  }

  query = query.order('workout_date', { ascending: false });

  if (options.limit) {
    query = query.limit(options.limit);
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Supabase error details:', error);
    throw new Error(`Database error: ${error.message}`);
  }

  console.log('Workout sessions fetched successfully:', data?.length || 0);
  return data || [];
};

export const fetchRecentWorkoutSessions = async (userId: string, days: number = 7): Promise<WorkoutSession[]> => {
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - days);
  
  return fetchWorkoutSessions(userId, {
    dateFrom: dateFrom.toISOString().split('T')[0],
    limit: 20
  });
};

export const fetchUpcomingWorkoutSessions = async (userId: string): Promise<WorkoutSession[]> => {
  const today = new Date().toISOString().split('T')[0];
  
  return fetchWorkoutSessions(userId, {
    dateFrom: today,
    includeCompleted: false,
    limit: 10
  });
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
      duration_minutes: durationMinutes,
      paused_at: null // Clear pause state when completing
    })
    .eq('id', sessionId)
    .eq('user_id', userId);

  if (error) {
    console.error('Complete session error:', error);
    throw new Error(`Failed to complete session: ${error.message}`);
  }
};

export const startWorkoutSession = async (
  userId: string,
  sessionId: string
): Promise<void> => {
  console.log('Starting workout session:', sessionId);
  
  const { error } = await supabase
    .from('workout_sessions')
    .update({ 
      started_at: new Date().toISOString(),
      paused_at: null,
      total_pause_duration_seconds: 0
    })
    .eq('id', sessionId)
    .eq('user_id', userId);

  if (error) {
    console.error('Start session error:', error);
    throw new Error(`Failed to start session: ${error.message}`);
  }
};

export const pauseWorkoutSession = async (
  userId: string,
  sessionId: string
): Promise<void> => {
  console.log('Pausing workout session:', sessionId);
  
  const { error } = await supabase
    .from('workout_sessions')
    .update({ 
      paused_at: new Date().toISOString()
    })
    .eq('id', sessionId)
    .eq('user_id', userId);

  if (error) {
    console.error('Pause session error:', error);
    throw new Error(`Failed to pause session: ${error.message}`);
  }
};

export const resumeWorkoutSession = async (
  userId: string,
  sessionId: string,
  pauseDurationSeconds: number
): Promise<void> => {
  console.log('Resuming workout session:', sessionId, pauseDurationSeconds);
  
  // Fetch current total pause duration
  const { data: session, error: fetchError } = await supabase
    .from('workout_sessions')
    .select('total_pause_duration_seconds')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single();

  if (fetchError) {
    console.error('Fetch session error:', fetchError);
    throw new Error(`Failed to fetch session: ${fetchError.message}`);
  }

  const { error } = await supabase
    .from('workout_sessions')
    .update({ 
      paused_at: null,
      total_pause_duration_seconds: (session?.total_pause_duration_seconds || 0) + pauseDurationSeconds
    })
    .eq('id', sessionId)
    .eq('user_id', userId);

  if (error) {
    console.error('Resume session error:', error);
    throw new Error(`Failed to resume session: ${error.message}`);
  }
};

export const syncWorkoutDuration = async (
  userId: string,
  sessionId: string,
  durationMinutes: number
): Promise<void> => {
  console.log('Syncing workout duration:', sessionId, durationMinutes);
  
  const { error } = await supabase
    .from('workout_sessions')
    .update({ 
      duration_minutes: durationMinutes
    })
    .eq('id', sessionId)
    .eq('user_id', userId);

  if (error) {
    console.error('Sync duration error:', error);
    throw new Error(`Failed to sync duration: ${error.message}`);
  }
};
