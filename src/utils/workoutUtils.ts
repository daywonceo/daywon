
import { WorkoutSession } from '@/types/workout';

export const getPlannedWorkoutsForWeek = (
  sessions: WorkoutSession[],
  startOfWeek: Date
): WorkoutSession[] => {
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  return sessions.filter(session => {
    if (session.planned_day_of_week === null) return false;
    
    const sessionDate = new Date(session.workout_date);
    return sessionDate >= startOfWeek && sessionDate <= endOfWeek;
  });
};

export const getCurrentWeekPlannedWorkouts = (sessions: WorkoutSession[]): WorkoutSession[] => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Start from Sunday
  startOfWeek.setHours(0, 0, 0, 0);

  return getPlannedWorkoutsForWeek(sessions, startOfWeek);
};
