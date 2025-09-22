-- Performance optimization: Add missing indexes for frequently queried columns (batch 3)

-- Critical indexes for user_habit_scores
CREATE INDEX IF NOT EXISTS idx_user_habit_scores_user_period ON public.user_habit_scores(user_id, score_period, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_user_habit_scores_leaderboard ON public.user_habit_scores(score_period, rank_position);

-- Critical indexes for post_comments
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id_created_at ON public.post_comments(post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON public.post_comments(user_id);

-- Critical indexes for post_reactions
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON public.post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_post ON public.post_reactions(user_id, post_id);

-- Critical indexes for habit_events
CREATE INDEX IF NOT EXISTS idx_habit_events_user_habit_occurred ON public.habit_events(user_habit_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_habit_events_source ON public.habit_events(source);

-- Critical indexes for saved tables for user lookups
CREATE INDEX IF NOT EXISTS idx_saved_recipes_user_id_saved_at ON public.saved_recipes(user_id, saved_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_verses_user_id_saved_at ON public.saved_verses(user_id, saved_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_devotions_user_id_saved_at ON public.saved_devotions(user_id, saved_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_sermons_user_id_saved_at ON public.saved_sermons(user_id, saved_at DESC);