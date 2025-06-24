
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ExerciseHistory {
  exercise_name: string;
  sets: number;
  reps: number;
  weight_lbs: number | null;
  created_at: string;
}

interface ExerciseSuggestion {
  sets: number;
  reps: number;
  weight?: number;
  isProgression?: boolean;
}

export const useExerciseSuggestions = () => {
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const fetchExerciseHistory = async (exerciseName: string): Promise<ExerciseHistory[]> => {
    if (!user) return [];

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercise_logs')
        .select('exercise_name, sets, reps, weight_lbs, created_at')
        .eq('user_id', user.id)
        .eq('exercise_name', exerciseName)
        .order('created_at', { ascending: false })
        .limit(10); // Get last 10 sessions for this exercise

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching exercise history:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgression = (history: ExerciseHistory[]): ExerciseSuggestion => {
    if (history.length === 0) {
      // Default suggestion for new exercises
      return {
        sets: 3,
        reps: 10,
        weight: undefined
      };
    }

    // Get the most recent workout data
    const lastWorkout = history[0];
    const secondLastWorkout = history[1];

    // Base suggestion on last workout
    let suggestion: ExerciseSuggestion = {
      sets: lastWorkout.sets,
      reps: lastWorkout.reps,
      weight: lastWorkout.weight_lbs || undefined
    };

    // Progressive overload logic
    if (lastWorkout.weight_lbs && history.length >= 2) {
      const sessionsAtCurrentWeight = history.filter(
        h => h.weight_lbs === lastWorkout.weight_lbs
      ).length;

      // If they've done 2+ sessions at current weight, suggest progression
      if (sessionsAtCurrentWeight >= 2) {
        const currentWeight = lastWorkout.weight_lbs;
        let weightIncrease = 0;

        // Progressive overload based on weight range
        if (currentWeight <= 50) {
          weightIncrease = 5; // 5 lb increase for lighter weights
        } else if (currentWeight <= 100) {
          weightIncrease = 5; // 5 lb increase for moderate weights
        } else {
          weightIncrease = 10; // 10 lb increase for heavier weights
        }

        suggestion = {
          ...suggestion,
          weight: currentWeight + weightIncrease,
          isProgression: true
        };
      }
    }

    // Rep progression if no weight is used (bodyweight exercises)
    if (!lastWorkout.weight_lbs && history.length >= 2) {
      const avgReps = history.slice(0, 3).reduce((sum, h) => sum + h.reps, 0) / Math.min(3, history.length);
      
      // If consistently hitting target reps, suggest increase
      if (lastWorkout.reps >= avgReps) {
        suggestion.reps = Math.min(lastWorkout.reps + 1, 20); // Cap at 20 reps
      }
    }

    return suggestion;
  };

  const getSuggestionForExercise = async (exerciseName: string): Promise<ExerciseSuggestion> => {
    const history = await fetchExerciseHistory(exerciseName);
    return calculateProgression(history);
  };

  const getProgressionNote = (suggestion: ExerciseSuggestion, lastWeight?: number): string => {
    if (suggestion.isProgression && suggestion.weight && lastWeight) {
      const increase = suggestion.weight - lastWeight;
      return `💪 Progressive overload: +${increase} lbs from last session`;
    }
    return '';
  };

  return {
    getSuggestionForExercise,
    getProgressionNote,
    isLoading
  };
};
