
export interface WorkoutSession {
  id: string;
  user_id: string;
  workout_plan_id: string | null;
  workout_date: string;
  workout_type: string;
  duration_minutes: number | null;
  is_completed: boolean;
  notes: string | null;
  planned_day_of_week: number | null;
  created_at: string;
  updated_at: string;
}

export interface ExerciseLog {
  id: string;
  user_id: string;
  workout_session_id: string;
  exercise_name: string;
  muscle_group: string | null;
  equipment: string | null;
  sets: number;
  reps: number;
  weight_lbs: number | null;
  difficulty: string | null;
  exercise_instructions: string | null;
  created_at: string;
}
