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
        
        // Get completion history for each duplicate habit
        const activities = getHabitActivities();
        const habitCompletions = duplicateHabits.map(habit => {
          const habitActivities = activities.filter(a => a.habitName === habit.name);
          const completed = habitActivities.filter(a => a.status === 'completed').length;
          const total = habitActivities.length;
          return { habit, completed, total, completionRate: total > 0 ? completed / total : 0 };
        });
        
        // Sort by completion history (total completed first, then completion rate)
        habitCompletions.sort((a, b) => {
          if (a.completed !== b.completed) return b.completed - a.completed;
          return b.completionRate - a.completionRate;
        });
        
        // Keep the habit with the most completion data
        const keepHabit = habitCompletions[0].habit;
        const habitsToRemove = duplicateHabits.filter(h => h.id !== keepHabit.id);
        
        // Update the kept habit to use the preferred name (but keep the one with most data)
        const finalName = keepHabit.name; // Keep the name of the habit with most completion data
        
        // Update local storage activities to consolidate under the kept habit's name
        const updatedActivities = activities.map(activity => {
          const shouldUpdate = habitsToRemove.some(h => h.name === activity.habitName);
          return shouldUpdate 
            ? { ...activity, habitName: finalName }
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
