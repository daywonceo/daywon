-- Performance optimization: Add missing indexes for frequently queried columns (final batch)

-- Performance indexes for frequently filtered columns
CREATE INDEX IF NOT EXISTS idx_habits_user_id_status ON public.habits(user_id, status);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id_status ON public.meal_plans(user_id, status);
CREATE INDEX IF NOT EXISTS idx_weekly_summaries_user_id_week ON public.weekly_summaries(user_id, week_start DESC);

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_status ON public.challenge_participants(challenge_id, status);
CREATE INDEX IF NOT EXISTS idx_challenge_teams_challenge_members ON public.challenge_teams(challenge_id, current_members);

-- Add indexes for JSON columns that are frequently queried
CREATE INDEX IF NOT EXISTS idx_meal_plans_goals_gin ON public.meal_plans USING gin(goals);
CREATE INDEX IF NOT EXISTS idx_app_sessions_breakdown_gin ON public.app_sessions USING gin(section_breakdown);

-- Additional frequently used composite indexes
CREATE INDEX IF NOT EXISTS idx_challenge_chat_challenge_created ON public.challenge_chat(challenge_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_challenge_comments_challenge_created ON public.challenge_comments(challenge_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_reflections_user_created ON public.user_reflections(user_id, created_at DESC);