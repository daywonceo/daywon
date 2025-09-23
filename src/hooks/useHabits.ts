
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tables } from "@/integrations/supabase/types";
import { getHabitActivities, isHabitRecentlyActiveSync, loadHabitActivitiesFromDatabase } from "@/utils/habitActivity";
// Removed deduplication functionality

export type Habit = Tables<'habits'>;
export type NewHabit = Omit<Habit, 'id' | 'created_at' | 'user_id' | 'archived_at' | 'ended_at'> & {
  default_tracking_type?: string;
  archived_at?: string | null;
  ended_at?: string | null;
};

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
  // Use the smart matching function to find or create habit
  const { data: habitId, error: functionError } = await supabase
    .rpc('find_or_create_habit', {
      p_user_id: userId,
      p_name: habit.name,
      p_description: habit.description,
      p_category: habit.category
    });

  if (functionError) throw functionError;

  // Fetch the habit data
  const { data, error } = await supabase
    .from('habits')
    .select()
    .eq('id', habitId)
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

async function endHabit(habitId: string) {
    const { data, error } = await supabase
        .from('habits')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', habitId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function archiveHabit(habitId: string) {
    const { data, error } = await supabase
        .from('habits')
        .update({ 
            archived_at: new Date().toISOString(),
            status: 'archived'
        })
        .eq('id', habitId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function unarchiveHabit(habitId: string) {
    const { data, error } = await supabase
        .from('habits')
        .update({ 
            archived_at: null,
            status: 'active'
        })
        .eq('id', habitId)
        .select()
        .single();

    if (error) throw error;
    return data;
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
      // Removed deduplication check - const duplicate = findDuplicateHabit(habitName, existingHabits || []);
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
    'Workout': 'Health & Fitness',
    'Devotions': 'Spiritual',
    'Read': 'Personal Development',
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
      
      // Throttle ensureTrackedHabitsVisible to prevent excessive calls
      const lastEnsureSync = localStorage.getItem(`lastEnsureSync_${user.id}`);
      const now = Date.now();
      
      if (!lastEnsureSync || now - parseInt(lastEnsureSync) > 60000) { // 1 minute
        await ensureTrackedHabitsVisible(user.id);
        localStorage.setItem(`lastEnsureSync_${user.id}`, now.toString());
      }
      
      // Then fetch all habits
      const data = await fetchHabits(user.id);
      return data;
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false
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

  const endMutation = useMutation({
    mutationFn: (habitId: string) => endHabit(habitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (habitId: string) => archiveHabit(habitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const unarchiveMutation = useMutation({
    mutationFn: (habitId: string) => unarchiveHabit(habitId),
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
    endHabit: endMutation.mutateAsync,
    archiveHabit: archiveMutation.mutateAsync,
    unarchiveHabit: unarchiveMutation.mutateAsync,
    ensureTrackedHabitsVisible: () => user && ensureTrackedHabitsVisible(user.id),
    refreshHabits,
  };
}
