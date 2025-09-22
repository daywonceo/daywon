-- Performance optimization: Add missing indexes for frequently queried columns (batch 2)

-- Critical indexes for habit_photos
CREATE INDEX IF NOT EXISTS idx_habit_photos_user_id_date ON public.habit_photos(user_id, activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_habit_photos_habit_id ON public.habit_photos(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_photos_shared ON public.habit_photos(is_shared);

-- Critical indexes for challenges
CREATE INDEX IF NOT EXISTS idx_challenges_creator_id ON public.challenges(creator_id);
CREATE INDEX IF NOT EXISTS idx_challenges_challenge_type ON public.challenges(challenge_type);
CREATE INDEX IF NOT EXISTS idx_challenges_team_based ON public.challenges(is_team_based);

-- Critical indexes for user_progress
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id_exercise ON public.user_progress(user_id, exercise_name);
CREATE INDEX IF NOT EXISTS idx_user_progress_updated_at ON public.user_progress(updated_at DESC);

-- Critical indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read_status ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_actor_id ON public.notifications(actor_id);

-- Critical indexes for user_relationships
CREATE INDEX IF NOT EXISTS idx_user_relationships_follower_status ON public.user_relationships(follower_id, status);
CREATE INDEX IF NOT EXISTS idx_user_relationships_following_status ON public.user_relationships(following_id, status);