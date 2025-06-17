
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tables } from "@/integrations/supabase/types";
import { getHabitActivities, isHabitRecentlyActive } from "@/utils/habitActivity";

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

// Ensure all tracked habits are visible in the database
async function ensureTrackedHabitsVisible(userId: string) {
  try {
    const activities = getHabitActivities();
    const trackedHabits = [...new Set(activities.map(a => a.habitName))];
    
    // Get existing habits from database
    const { data: existingHabits } = await supabase
      .from('habits')
      .select('name, status')
      .eq('user_id', userId);
    
    const existingHabitNames = existingHabits?.map(h => h.name) || [];
    
    // Find habits that need to be created
    const habitsToCreate = trackedHabits.filter(habitName => 
      !existingHabitNames.includes(habitName)
    );
    
    // Create missing habits
    if (habitsToCreate.length > 0) {
      const newHabits = habitsToCreate.map(habitName => ({
        user_id: userId,
        name: habitName,
        status: 'active' as const,
        category: getHabitCategory(habitName)
      }));
      
      await supabase.from('habits').insert(newHabits);
      console.log(`Created missing habits: ${habitsToCreate.join(', ')}`);
    }
    
    // Auto-activate habits that have been completed recently
    const habitsToReactivate = existingHabits
      ?.filter(h => h.status === 'archived' && isHabitRecentlyActive(h.name))
      .map(h => h.name) || [];
    
    if (habitsToReactivate.length > 0) {
      await supabase
        .from('habits')
        .update({ status: 'active' })
        .eq('user_id', userId)
        .in('name', habitsToReactivate);
      
      console.log(`Reactivated recently completed habits: ${habitsToReactivate.join(', ')}`);
    }
  } catch (error) {
    console.error('Failed to ensure tracked habits are visible:', error);
  }
}

// Get category for default habits
const getHabitCategory = (habitName: string): string => {
  const categoryMap: Record<string, string> = {
    'WORKOUT': 'Health & Fitness',
    'DEVOTIONS': 'Spiritual',
    'READ': 'Personal Development',
    'Sleep 8 Hours': 'Health & Fitness',
    'Drink Water': 'Health & Fitness',
    'Meditate': 'Mindfulness'
  };
  return categoryMap[habitName] || 'Personal';
};

export function useHabits() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = ["habits", user?.id];

  const { data: habits, isLoading, isError } = useQuery({
    queryKey,
    queryFn: async () => {
      const data = await fetchHabits(user!.id);
      // Ensure all tracked habits are visible
      await ensureTrackedHabitsVisible(user!.id);
      return data;
    },
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
    ensureTrackedHabitsVisible: () => user && ensureTrackedHabitsVisible(user.id),
  };
}
