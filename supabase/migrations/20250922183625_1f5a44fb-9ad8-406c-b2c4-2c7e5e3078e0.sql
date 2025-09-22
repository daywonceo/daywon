-- Performance optimization: Add missing indexes for frequently queried columns (batch 1)

-- Critical indexes for habit_activities (most frequently queried table)
CREATE INDEX IF NOT EXISTS idx_habit_activities_user_id_date ON public.habit_activities(user_id, activity_date);
CREATE INDEX IF NOT EXISTS idx_habit_activities_status ON public.habit_activities(status);
CREATE INDEX IF NOT EXISTS idx_habit_activities_created_at ON public.habit_activities(created_at);

-- Critical indexes for social_posts
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id_created_at ON public.social_posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON public.social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_is_milestone ON public.social_posts(is_milestone);

-- Critical indexes for user_habits
CREATE INDEX IF NOT EXISTS idx_user_habits_user_id_active ON public.user_habits(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_habits_habit_id ON public.user_habits(habit_id);
CREATE INDEX IF NOT EXISTS idx_user_habits_start_date ON public.user_habits(start_date);

-- Critical indexes for exercise_logs
CREATE INDEX IF NOT EXISTS idx_exercise_logs_user_id_created_at ON public.exercise_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_session_id ON public.exercise_logs(workout_session_id);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_exercise_name ON public.exercise_logs(exercise_name);

-- Critical indexes for workout_sessions
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id_date ON public.workout_sessions(user_id, workout_date DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_completed ON public.workout_sessions(is_completed);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_type ON public.workout_sessions(workout_type);