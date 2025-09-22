-- Performance optimization: Add missing indexes for frequently queried columns

-- Critical indexes for habit_activities (most frequently queried table)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_habit_activities_user_id_date ON public.habit_activities(user_id, activity_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_habit_activities_status ON public.habit_activities(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_habit_activities_created_at ON public.habit_activities(created_at);

-- Critical indexes for social_posts
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_social_posts_user_id_created_at ON public.social_posts(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_social_posts_created_at ON public.social_posts(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_social_posts_is_milestone ON public.social_posts(is_milestone);

-- Critical indexes for user_habits
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_habits_user_id_active ON public.user_habits(user_id, is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_habits_habit_id ON public.user_habits(habit_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_habits_start_date ON public.user_habits(start_date);

-- Critical indexes for exercise_logs
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exercise_logs_user_id_created_at ON public.exercise_logs(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exercise_logs_session_id ON public.exercise_logs(workout_session_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exercise_logs_exercise_name ON public.exercise_logs(exercise_name);

-- Critical indexes for workout_sessions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workout_sessions_user_id_date ON public.workout_sessions(user_id, workout_date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workout_sessions_completed ON public.workout_sessions(is_completed);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workout_sessions_type ON public.workout_sessions(workout_type);

-- Critical indexes for habit_photos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_habit_photos_user_id_date ON public.habit_photos(user_id, activity_date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_habit_photos_habit_id ON public.habit_photos(habit_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_habit_photos_shared ON public.habit_photos(is_shared);

-- Critical indexes for challenges
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_challenges_creator_id ON public.challenges(creator_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_challenges_challenge_type ON public.challenges(challenge_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_challenges_team_based ON public.challenges(is_team_based);

-- Critical indexes for user_progress
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_user_id_exercise ON public.user_progress(user_id, exercise_name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_updated_at ON public.user_progress(updated_at DESC);

-- Critical indexes for notifications
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_id_created_at ON public.notifications(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_read_status ON public.notifications(user_id, is_read);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_actor_id ON public.notifications(actor_id);

-- Critical indexes for user_relationships
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_relationships_follower_status ON public.user_relationships(follower_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_relationships_following_status ON public.user_relationships(following_id, status);

-- Critical indexes for user_habit_scores
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_habit_scores_user_period ON public.user_habit_scores(user_id, score_period, period_start DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_habit_scores_leaderboard ON public.user_habit_scores(score_period, rank_position);

-- Critical indexes for post_comments
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_comments_post_id_created_at ON public.post_comments(post_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_comments_user_id ON public.post_comments(user_id);

-- Critical indexes for post_reactions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_reactions_post_id ON public.post_reactions(post_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_reactions_user_post ON public.post_reactions(user_id, post_id);

-- Critical indexes for habit_events
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_habit_events_user_habit_occurred ON public.habit_events(user_habit_id, occurred_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_habit_events_source ON public.habit_events(source);

-- Critical indexes for saved tables for user lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_saved_recipes_user_id_saved_at ON public.saved_recipes(user_id, saved_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_saved_verses_user_id_saved_at ON public.saved_verses(user_id, saved_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_saved_devotions_user_id_saved_at ON public.saved_devotions(user_id, saved_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_saved_sermons_user_id_saved_at ON public.saved_sermons(user_id, saved_at DESC);

-- Performance indexes for frequently filtered columns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_habits_user_id_status ON public.habits(user_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_meal_plans_user_id_status ON public.meal_plans(user_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_weekly_summaries_user_id_week ON public.weekly_summaries(user_id, week_start DESC);

-- Composite indexes for complex queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_challenge_participants_challenge_status ON public.challenge_participants(challenge_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_challenge_teams_challenge_members ON public.challenge_teams(challenge_id, current_members);

-- Add indexes for JSON columns that are frequently queried
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_meal_plans_goals_gin ON public.meal_plans USING gin(goals);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_app_sessions_breakdown_gin ON public.app_sessions USING gin(section_breakdown);