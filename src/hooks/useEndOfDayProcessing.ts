import { useEffect } from 'react';
import { toast } from './use-toast';

export const useEndOfDayProcessing = () => {
  useEffect(() => {
    const handleEndOfDayProcessed = (event: CustomEvent) => {
      const { datesProcessed, habitsProcessed, totalHabits, processedByDate } = event.detail;
      console.log(`End-of-day processing completed for ${datesProcessed.length} dates: ${habitsProcessed}/${totalHabits} habits processed`);
      
      if (habitsProcessed > 0) {
        const datesWithChanges = Object.keys(processedByDate).filter(date => processedByDate[date] > 0);
        
        // Show a toast to let users know habits were auto-marked
        toast({
          title: "Past days completed",
          description: `${habitsProcessed} incomplete habit${habitsProcessed !== 1 ? 's' : ''} marked as failed across ${datesWithChanges.length} date${datesWithChanges.length !== 1 ? 's' : ''}`,
          duration: 5000,
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
  const triggerEndOfDayProcessing = async (daysToProcess: number = 7) => {
    try {
      const { processEndOfDayHabits } = await import('@/utils/habitSynchronization');
      await processEndOfDayHabits(daysToProcess);
      toast({
        title: "Processing complete",
        description: `End-of-day habit processing triggered for last ${daysToProcess} days`,
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