import { useCallback } from 'react';
import { recordHabitActivityV2, getHabitActivitiesV2, getHabitActivitiesByIdV2 } from '@/utils/habitTracking';

// Hook to provide V2 habit activity functionality
export const useHabitActivityV2 = () => {
  const recordActivity = useCallback(async (
    habitName: string,
    status: "completed" | "failed" | "empty",
    date?: Date
  ) => {
    return await recordHabitActivityV2(habitName, status, date);
  }, []);

  const getActivities = useCallback(() => {
    return getHabitActivitiesV2();
  }, []);

  const getActivitiesById = useCallback((habitId: string) => {
    return getHabitActivitiesByIdV2(habitId);
  }, []);

  return {
    recordActivity,
    getActivities,
    getActivitiesById
  };
};