import { useEffect } from 'react';
import { useHabitDeduplication } from './useHabitDeduplication';
import { toast } from './use-toast';

export const useAutomaticDeduplication = () => {
  const { duplicateGroups, mergeDuplicateHabits } = useHabitDeduplication();

  useEffect(() => {
    const runDeduplication = async () => {
      if (duplicateGroups.length > 0) {
        console.log(`Found ${duplicateGroups.length} duplicate habit groups, attempting to merge...`);
        
        const result = await mergeDuplicateHabits();
        
        if (result.success && result.mergedCount && result.mergedCount > 0) {
          toast({
            title: "Duplicate habits merged",
            description: `Consolidated ${result.mergedCount} duplicate habit${result.mergedCount > 1 ? 's' : ''} based on completion history`,
            duration: 5000,
          });
        } else if (!result.success && result.error) {
          console.error('Failed to merge duplicates:', result.error);
        }
      }
    };

    // Run deduplication after a short delay to avoid interfering with initial load
    const timer = setTimeout(runDeduplication, 2000);
    return () => clearTimeout(timer);
  }, [duplicateGroups.length, mergeDuplicateHabits]);

  return { duplicateGroups };
};