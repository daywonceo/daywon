import { useHabits, Habit } from "./useHabits";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getHabitActivitiesV2 } from "@/utils/habitActivityV2";

export const useHabitDeduplicationV2 = () => {
  const { habits, updateHabit, deleteHabit } = useHabits();
  const { user } = useAuth();

  const findDuplicateGroups = () => {
    if (!habits) return [];
    
    const duplicateGroups: Array<{ 
      preferredHabit: Habit; 
      duplicates: Habit[] 
    }> = [];
    const processed = new Set<string>();
    
    habits.forEach(habit => {
      if (processed.has(habit.id)) return;
      
      const duplicates = habits.filter(h => 
        h.id !== habit.id && 
        h.status === 'active' &&
        areHabitsEquivalentV2(habit.name, h.name)
      );
      
      if (duplicates.length > 0) {
        // Find the habit with the most activity data
        const allHabits = [habit, ...duplicates];
        const activities = getHabitActivitiesV2();
        
        const habitWithMostActivity = allHabits.reduce((best, current) => {
          const currentActivityCount = activities.filter(a => a.habitId === current.id).length;
          const bestActivityCount = activities.filter(a => a.habitId === best.id).length;
          
          return currentActivityCount > bestActivityCount ? current : best;
        });
        
        duplicateGroups.push({
          preferredHabit: habitWithMostActivity,
          duplicates: allHabits.filter(h => h.id !== habitWithMostActivity.id)
        });
        
        // Mark all as processed
        allHabits.forEach(h => processed.add(h.id));
      }
    });
    
    return duplicateGroups;
  };

  const mergeDuplicateHabits = async () => {
    if (!user) return { success: false, error: "User not authenticated" };
    
    const duplicateGroups = findDuplicateGroups();
    
    if (duplicateGroups.length === 0) {
      return { success: true, mergedCount: 0, message: "No duplicate habits found" };
    }
    
    try {
      for (const group of duplicateGroups) {
        const { preferredHabit, duplicates } = group;
        
        // Use the database function to merge the habits
        const duplicateIds = duplicates.map(d => d.id);
        const { error } = await supabase.rpc('merge_duplicate_habits', {
          p_user_id: user.id,
          p_keep_habit_id: preferredHabit.id,
          p_merge_habit_ids: duplicateIds
        });
        
        if (error) {
          console.error('Error merging duplicate habits:', error);
          throw error;
        }
        
        console.log(`Merged duplicates for habit: ${preferredHabit.name}`);
      }
      
      return { 
        success: true, 
        mergedCount: duplicateGroups.length,
        message: `Successfully merged ${duplicateGroups.length} duplicate habit groups`
      };
    } catch (error) {
      console.error('Error merging duplicate habits:', error);
      return { 
        success: false, 
        error: "Failed to merge duplicate habits" 
      };
    }
  };

  const checkForDuplicateByName = (newHabitName: string) => {
    if (!habits) return null;
    return habits.find(habit => 
      habit.status === 'active' && 
      areHabitsEquivalentV2(newHabitName, habit.name)
    ) || null;
  };

  return {
    findDuplicateGroups,
    mergeDuplicateHabits,
    checkForDuplicate: checkForDuplicateByName,
    duplicateGroups: findDuplicateGroups()
  };
};

// Helper function to check if two habit names are equivalent
const areHabitsEquivalentV2 = (name1: string, name2: string): boolean => {
  const normalize = (name: string) => name.toLowerCase().trim().replace(/s$/, '');
  return normalize(name1) === normalize(name2);
};