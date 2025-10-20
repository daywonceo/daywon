
import { WorkoutSession } from '@/types/workout';

export interface WorkoutOption {
  type: string;
  displayName: string;
  lastCompleted?: Date;
  isRecommended?: boolean;
}

export const getWorkoutDisplayName = (workoutType: string): string => {
  const displayNames: Record<string, string> = {
    'upper_body': 'Upper Body',
    'lower_body': 'Lower Body',
    'push': 'Push (Chest, Shoulders, Triceps)',
    'pull': 'Pull (Back, Biceps)',
    'legs': 'Legs',
    'chest_back': 'Chest & Back',
    'shoulders_arms': 'Shoulders & Arms',
    'full_body': 'Full Body'
  };
  
  return displayNames[workoutType] || workoutType.replace(/_/g, ' ').toUpperCase();
};

export const getWorkoutRotationOrder = (planType: string): string[] => {
  const rotationOrders: Record<string, string[]> = {
    'upper_lower': ['upper_body', 'lower_body'],
    'push_pull_legs': ['push', 'pull', 'legs'],
    'body_part_split': ['chest_back', 'legs', 'shoulders_arms'],
    'full_body': ['full_body']
  };
  
  // Return the matching rotation or a default full body option
  return rotationOrders[planType] || ['full_body', 'upper_body', 'lower_body'];
};

export const getRecommendedNextWorkout = (
  planType: string,
  sessions: WorkoutSession[]
): string | null => {
  const rotationOrder = getWorkoutRotationOrder(planType);
  if (rotationOrder.length === 0) return null;

  // Get the most recent completed workout
  const completedSessions = sessions
    .filter(session => session.is_completed)
    .sort((a, b) => new Date(b.workout_date).getTime() - new Date(a.workout_date).getTime());

  if (completedSessions.length === 0) {
    // No completed workouts, recommend the first in rotation
    return rotationOrder[0];
  }

  const lastWorkoutType = completedSessions[0].workout_type;
  const currentIndex = rotationOrder.indexOf(lastWorkoutType);
  
  if (currentIndex === -1) {
    // Last workout not in current rotation, start from beginning
    return rotationOrder[0];
  }

  // Return next workout in rotation (cycle back to start if at end)
  const nextIndex = (currentIndex + 1) % rotationOrder.length;
  return rotationOrder[nextIndex];
};

export const getWorkoutOptions = (
  planType: string,
  sessions: WorkoutSession[]
): WorkoutOption[] => {
  const rotationOrder = getWorkoutRotationOrder(planType);
  const recommendedNext = getRecommendedNextWorkout(planType, sessions);

  return rotationOrder.map(workoutType => {
    // Find the most recent session for this workout type
    const lastSession = sessions
      .filter(session => session.workout_type === workoutType && session.is_completed)
      .sort((a, b) => new Date(b.workout_date).getTime() - new Date(a.workout_date).getTime())[0];

    return {
      type: workoutType,
      displayName: getWorkoutDisplayName(workoutType),
      lastCompleted: lastSession ? new Date(lastSession.workout_date) : undefined,
      isRecommended: workoutType === recommendedNext
    };
  });
};
