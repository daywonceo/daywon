import { useHabits } from "./useHabits";
import { findDuplicateHabit, getPreferredHabitName, areHabitsEquivalent } from "@/utils/habitDeduplication";
import { getHabitActivities } from "@/utils/habitActivity";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useHabitDeduplication = () => {
  const { habits, updateHabit, deleteHabit } = useHabits();
  const { user } = useAuth();

  const findDuplicateGroups = () => {
    if (!habits) return [];
    
    const duplicateGroups: Array<{ preferredName: string; habits: typeof habits }> = [];
    const processed = new Set<string>();
    
    habits.forEach(habit => {
      if (processed.has(habit.id)) return;
      
      const duplicates = habits.filter(h => 
        h.id !== habit.id && areHabitsEquivalent(habit.name, h.name)
      );
      
      if (duplicates.length > 0) {
        const allNames = [habit.name, ...duplicates.map(d => d.name)];
        const preferredName = getPreferredHabitName(allNames);
        
        duplicateGroups.push({
          preferredName,
          habits: [habit, ...duplicates]
        });
        
        // Mark all as processed
        [habit, ...duplicates].forEach(h => processed.add(h.id));
      }
    });
    
    return duplicateGroups;
  };

  const mergeDuplicateHabits = async () => {
    if (!user) return { success: false, error: "User not authenticated" };
    
    const duplicateGroups = findDuplicateGroups();
    
    try {
      for (const group of duplicateGroups) {
        const { preferredName, habits: duplicateHabits } = group;
        
        // Find the habit to keep (prefer the one with the preferred name, or the first one)
        const keepHabit = duplicateHabits.find(h => h.name === preferredName) || duplicateHabits[0];
        const habitsToRemove = duplicateHabits.filter(h => h.id !== keepHabit.id);
        
        // Update the kept habit to use the preferred name
        if (keepHabit.name !== preferredName) {
          await updateHabit({ id: keepHabit.id, name: preferredName });
        }
        
        // Update local storage activities to use the preferred name
        const activities = getHabitActivities();
        const updatedActivities = activities.map(activity => {
          const shouldUpdate = duplicateHabits.some(h => h.name === activity.habitName);
          return shouldUpdate 
            ? { ...activity, habitName: preferredName }
            : activity;
        });
        
        // Save updated activities
        if (updatedActivities.length !== activities.length || 
            JSON.stringify(updatedActivities) !== JSON.stringify(activities)) {
          localStorage.setItem('habitTracker', JSON.stringify({
            habitActivities: updatedActivities
          }));
        }
        
        // Delete duplicate habits from database
        for (const habitToRemove of habitsToRemove) {
          await deleteHabit(habitToRemove.id);
        }
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

  const checkForDuplicate = (newHabitName: string) => {
    if (!habits) return null;
    return findDuplicateHabit(newHabitName, habits);
  };

  return {
    findDuplicateGroups,
    mergeDuplicateHabits,
    checkForDuplicate,
    duplicateGroups: findDuplicateGroups()
  };
};
