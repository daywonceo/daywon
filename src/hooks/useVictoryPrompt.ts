
import { useState, useCallback } from 'react';
import { toast } from "@/hooks/use-toast";

export const useVictoryPrompt = () => {
  const [showVictoryPrompt, setShowVictoryPrompt] = useState(false);
  const [completedHabit, setCompletedHabit] = useState<string | null>(null);

  const triggerVictoryPrompt = useCallback((habitName: string) => {
    setCompletedHabit(habitName);
    setShowVictoryPrompt(true);
    
    toast({
      title: "Habit Completed!",
      description: "Add your victory song to the challenge playlist!",
      duration: 5000,
    });
  }, []);

  const dismissVictoryPrompt = useCallback(() => {
    setShowVictoryPrompt(false);
    setCompletedHabit(null);
  }, []);

  return {
    showVictoryPrompt,
    completedHabit,
    triggerVictoryPrompt,
    dismissVictoryPrompt,
  };
};
