import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type TrackingType = 'DAILY' | 'N_PER_PERIOD' | 'SELECTED_DAYS';
export type Period = 'WEEK' | 'MONTH';

export interface UserHabit {
  id: string;
  user_id: string;
  habit_id: string;
  tracking_type: TrackingType;
  period?: Period;
  target_count?: number;
  selected_days?: number[];
  min_rest_days: number;
  time_window_start?: string;
  time_window_end?: string;
  reminder_time?: string;
  reminder_channel: string[];
  start_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  habit?: {
    name: string;
    category?: string;
  };
}

export interface CreateUserHabitData {
  habit_id: string;
  tracking_type: TrackingType;
  period?: Period;
  target_count?: number;
  selected_days?: number[];
  min_rest_days?: number;
  time_window_start?: string;
  time_window_end?: string;
  reminder_time?: string;
  reminder_channel?: string[];
  start_date?: string;
}

export interface HabitEvent {
  id: string;
  user_habit_id: string;
  occurred_at: string;
  value: number;
  source: 'manual' | 'automatic' | 'import';
  created_at: string;
}

async function fetchUserHabits(userId: string): Promise<UserHabit[]> {
  const { data, error } = await supabase
    .from("user_habits")
    .select(`
      *,
      habit:habits(name, category)
    `)
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

async function createUserHabit(userId: string, habitData: CreateUserHabitData): Promise<UserHabit> {
  const { data, error } = await supabase
    .from("user_habits")
    .insert({
      user_id: userId,
      ...habitData,
    })
    .select(`
      *,
      habit:habits(name, category)
    `)
    .single();

  if (error) throw error;
  return data;
}

async function updateUserHabit(id: string, updates: Partial<CreateUserHabitData>): Promise<UserHabit> {
  const { data, error } = await supabase
    .from("user_habits")
    .update(updates)
    .eq("id", id)
    .select(`
      *,
      habit:habits(name, category)
    `)
    .single();

  if (error) throw error;
  return data;
}

async function deleteUserHabit(id: string): Promise<void> {
  const { error } = await supabase
    .from("user_habits")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw error;
}

async function logHabitEvent(userHabitId: string, value: number = 1): Promise<HabitEvent> {
  const { data, error } = await supabase
    .from("habit_events")
    .insert({
      user_habit_id: userHabitId,
      value,
      source: 'manual'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function getHabitEvents(userHabitId: string, fromDate?: string, toDate?: string): Promise<HabitEvent[]> {
  let query = supabase
    .from("habit_events")
    .select("*")
    .eq("user_habit_id", userHabitId)
    .order("occurred_at", { ascending: false });

  if (fromDate) {
    query = query.gte("occurred_at", fromDate);
  }
  if (toDate) {
    query = query.lte("occurred_at", toDate);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export function useUserHabits() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = ["user-habits", user?.id];

  const { data: userHabits, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => fetchUserHabits(user!.id),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (habitData: CreateUserHabitData) => createUserHabit(user!.id, habitData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreateUserHabitData> }) => 
      updateUserHabit(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUserHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const logEventMutation = useMutation({
    mutationFn: ({ userHabitId, value }: { userHabitId: string; value?: number }) => 
      logHabitEvent(userHabitId, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habit-events"] });
    },
  });

  return {
    userHabits,
    isLoading,
    isError,
    createUserHabit: createMutation.mutateAsync,
    updateUserHabit: updateMutation.mutateAsync,
    deleteUserHabit: deleteMutation.mutateAsync,
    logHabitEvent: logEventMutation.mutateAsync,
    getHabitEvents,
  };
}