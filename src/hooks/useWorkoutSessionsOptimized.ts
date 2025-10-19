import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { 
  fetchWorkoutSessions, 
  fetchRecentWorkoutSessions, 
  fetchUpcomingWorkoutSessions 
} from '@/services/workoutSessionService';
import { WorkoutSession } from '@/types/workout';

const WORKOUT_SESSIONS_KEY = 'workout-sessions';
const RECENT_WORKOUTS_KEY = 'recent-workouts';
const UPCOMING_WORKOUTS_KEY = 'upcoming-workouts';

export const useAllWorkoutSessions = () => {
  const { user } = useAuth();

  return useQuery<WorkoutSession[], Error>({
    queryKey: [WORKOUT_SESSIONS_KEY, user?.id],
    queryFn: () => fetchWorkoutSessions(user!.id),
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRecentWorkouts = (days: number = 7) => {
  const { user } = useAuth();

  return useQuery<WorkoutSession[], Error>({
    queryKey: [RECENT_WORKOUTS_KEY, user?.id, days],
    queryFn: () => fetchRecentWorkoutSessions(user!.id, days),
    enabled: !!user,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpcomingWorkouts = () => {
  const { user } = useAuth();

  return useQuery<WorkoutSession[], Error>({
    queryKey: [UPCOMING_WORKOUTS_KEY, user?.id],
    queryFn: () => fetchUpcomingWorkoutSessions(user!.id),
    enabled: !!user,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useWorkoutSessionsCache = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const invalidateAllWorkouts = () => {
    queryClient.invalidateQueries({ queryKey: [WORKOUT_SESSIONS_KEY, user?.id] });
    queryClient.invalidateQueries({ queryKey: [RECENT_WORKOUTS_KEY, user?.id] });
    queryClient.invalidateQueries({ queryKey: [UPCOMING_WORKOUTS_KEY, user?.id] });
  };

  const prefetchRecentWorkouts = () => {
    if (user) {
      queryClient.prefetchQuery({
        queryKey: [RECENT_WORKOUTS_KEY, user.id, 7],
        queryFn: () => fetchRecentWorkoutSessions(user.id, 7),
        staleTime: 1 * 60 * 1000,
      });
    }
  };

  return {
    invalidateAllWorkouts,
    prefetchRecentWorkouts,
  };
};
