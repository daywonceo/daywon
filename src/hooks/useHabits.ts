
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tables } from "@/integrations/supabase/types";
import { getHabitActivities, isHabitRecentlyActiveSync, loadHabitActivitiesFromDatabase } from "@/utils/habitActivity";
import { findDuplicateHabit } from "@/utils/habitDeduplication";

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

async function addHabit(habit: NewHabit, userId: string, existingHabits: Habit[]) {
  // Check for duplicates before adding
  const duplicate = findDuplicateHabit(habit.name, existingHabits);
  if (duplicate) {
    throw new Error(`Habit "${duplicate.name}" already exists. Try editing the existing one instead.`);
  }

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
    console.log('Ensuring tracked habits are visible for user:', userId);
    const activities = await loadHabitActivitiesFromDatabase();
    const trackedHabits = [...new Set(activities.map(a => a.habitName))];
    console.log('Found tracked habits in local storage:', trackedHabits);
    
    // Get existing habits from database
    const { data: existingHabits } = await supabase
      .from('habits')
      .select('name, status')
      .eq('user_id', userId);
    
    console.log('Existing habits in database:', existingHabits);
    const existingHabitNames = existingHabits?.map(h => h.name) || [];
    
    // Find habits that need to be created (check for duplicates)
    const habitsToCreate = trackedHabits.filter(habitName => {
      // Check if a similar habit already exists
      const duplicate = findDuplicateHabit(habitName, existingHabits || []);
      return !duplicate;
    });
    
    console.log('Habits to create:', habitsToCreate);
    
    // Create missing habits
    if (habitsToCreate.length > 0) {
      const newHabits = habitsToCreate.map(habitName => ({
        user_id: userId,
        name: habitName,
        status: 'active' as const,
        category: getHabitCategory(habitName)
      }));
      
      const { error } = await supabase.from('habits').insert(newHabits);
      if (error) {
        console.error('Error creating habits:', error);
      } else {
        console.log(`Created missing habits: ${habitsToCreate.join(', ')}`);
      }
    }
    
    // Auto-activate habits that have been completed recently
    const habitsToReactivate = existingHabits
      ?.filter(h => h.status === 'archived' && isHabitRecentlyActiveSync(h.name))
      .map(h => h.name) || [];
    
    console.log('Habits to reactivate:', habitsToReactivate);
    
    if (habitsToReactivate.length > 0) {
      const { error } = await supabase
        .from('habits')
        .update({ status: 'active' })
        .eq('user_id', userId)
        .in('name', habitsToReactivate);
      
      if (error) {
        console.error('Error reactivating habits:', error);
      } else {
        console.log(`Reactivated recently completed habits: ${habitsToReactivate.join(', ')}`);
      }
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
      if (!user?.id) return [];
      
      // First ensure tracked habits are visible
      await ensureTrackedHabitsVisible(user.id);
      
      // Then fetch all habits
      const data = await fetchHabits(user.id);
      return data;
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: (newHabit: NewHabit) => addHabit(newHabit, user!.id, habits || []),
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

  const refreshHabits = async () => {
    if (user?.id) {
      await ensureTrackedHabitsVisible(user.id);
      queryClient.invalidateQueries({ queryKey });
    }
  };

  return {
    habits,
    isLoading,
    isError,
    addHabit: addMutation.mutateAsync,
    updateHabit: updateMutation.mutateAsync,
    deleteHabit: deleteMutation.mutateAsync,
    ensureTrackedHabitsVisible: () => user && ensureTrackedHabitsVisible(user.id),
    refreshHabits,
  };
}
