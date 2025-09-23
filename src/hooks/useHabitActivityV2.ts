import { useCallback } from 'react';
import { recordHabitActivity, getHabitActivities, getHabitActivitiesByIdV2 } from '@/utils/habitTracking';

// Hook to provide V2 habit activity functionality
export const useHabitActivityV2 = () => {
  const recordActivity = useCallback(async (
    habitName: string,
    status: "completed" | "failed" | "empty",
    date?: Date
  ) => {
    return await recordHabitActivity(habitName, status, date);
  }, []);

  const getActivities = useCallback(() => {
    return getHabitActivities();
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