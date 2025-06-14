
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tables } from "@/integrations/supabase/types";

export type Habit = Tables<'habits'>;
export type NewHabit = Omit<Habit, 'id' | 'created_at' | 'user_id'>;

async function fetchHabits(userId: string) {
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

async function addHabit(habit: NewHabit, userId: string) {
  const { data, error } = await supabase
    .from("habits")
    .insert([{ ...habit, user_id: userId }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

async function updateHabit(habit: Partial<Habit> & { id: string }) {
    const { id, ...updateData } = habit;
    const { data, error } = await supabase
        .from('habits')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function deleteHabit(habitId: string) {
    const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId);

    if (error) throw error;
}

export function useHabits() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = ["habits", user?.id];

  const { data: habits, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => fetchHabits(user!.id),
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: (newHabit: NewHabit) => addHabit(newHabit, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (habit: Partial<Habit> & { id: string }) => updateHabit(habit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: (habitId: string) => deleteHabit(habitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    habits,
    isLoading,
    isError,
    addHabit: addMutation.mutateAsync,
    updateHabit: updateMutation.mutateAsync,
    deleteHabit: deleteMutation.mutateAsync,
  };
}
