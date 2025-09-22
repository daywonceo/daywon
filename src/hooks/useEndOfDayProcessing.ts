import { useEffect } from 'react';
import { toast } from './use-toast';

export const useEndOfDayProcessing = () => {
  useEffect(() => {
    const handleEndOfDayProcessed = (event: CustomEvent) => {
      const { date, habitsProcessed, totalHabits } = event.detail;
      console.log(`End-of-day processing completed for ${date}: ${habitsProcessed}/${totalHabits} habits processed`);
      
      if (habitsProcessed > 0) {
        // Show a toast to let users know habits were auto-marked
        toast({
          title: "Day completed",
          description: `${habitsProcessed} incomplete habit${habitsProcessed !== 1 ? 's' : ''} marked as failed`,
          duration: 4000,
        });
      }
    };

    // Listen for the V2 end-of-day processing event
    window.addEventListener('habitEndOfDayProcessedV2', handleEndOfDayProcessed as EventListener);
    
    return () => {
      window.removeEventListener('habitEndOfDayProcessedV2', handleEndOfDayProcessed as EventListener);
    };
  }, []);

  // Manual trigger for end-of-day processing (useful for testing)
  const triggerEndOfDayProcessing = async () => {
    try {
      const { processEndOfDayHabitsV2 } = await import('@/utils/habitSynchronizationV2');
      await processEndOfDayHabitsV2();
      toast({
        title: "Processing complete",
        description: "End-of-day habit processing triggered manually",
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to trigger end-of-day processing:', error);
      toast({
        title: "Processing failed",
        description: "Could not process end-of-day habits",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return { triggerEndOfDayProcessing };
};