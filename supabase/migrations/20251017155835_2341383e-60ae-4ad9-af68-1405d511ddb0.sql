-- Phase 1: Critical Performance Indexes for habit_activities
-- Composite index for the most common query pattern (user's activities by date and status)
CREATE INDEX IF NOT EXISTS idx_habit_activities_user_date_status 
ON habit_activities(user_id, activity_date DESC, status);

-- Index for habit-specific queries (specific habit's activities over time)
CREATE INDEX IF NOT EXISTS idx_habit_activities_user_habit_date 
ON habit_activities(user_id, habit_id, activity_date DESC);

-- Index for date range queries (activities across users by date)
CREATE INDEX IF NOT EXISTS idx_habit_activities_date_user 
ON habit_activities(activity_date DESC, user_id);

-- Phase 1: Critical Performance Indexes for user_top_habits
-- Composite index for monthly habit lookups
CREATE INDEX IF NOT EXISTS idx_user_top_habits_user_month 
ON user_top_habits(user_id, month DESC);

-- Phase 1: Critical Performance Indexes for habits
-- Index for active habit queries (partial index for better performance)
CREATE INDEX IF NOT EXISTS idx_habits_user_status 
ON habits(user_id, status) WHERE status = 'active';

-- Index for name-based lookups with normalization
CREATE INDEX IF NOT EXISTS idx_habits_user_name_lower 
ON habits(user_id, LOWER(name));

-- Phase 2: Social & Challenge Indexes for challenge_participants
-- Index for participant lookups by challenge
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_user 
ON challenge_participants(challenge_id, user_id, status);

-- Index for team-based queries (partial index for team challenges)
CREATE INDEX IF NOT EXISTS idx_challenge_participants_team 
ON challenge_participants(team_id, user_id) WHERE team_id IS NOT NULL;

-- Index for user's challenges
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_challenge 
ON challenge_participants(user_id, challenge_id, status);

-- Phase 2: Social & Challenge Indexes for challenge_comments
-- Index for comment retrieval by challenge
CREATE INDEX IF NOT EXISTS idx_challenge_comments_challenge_created 
ON challenge_comments(challenge_id, created_at DESC);

-- Index for nested comments (partial index for replies)
CREATE INDEX IF NOT EXISTS idx_challenge_comments_parent 
ON challenge_comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;

-- Phase 2: Social & Challenge Indexes for challenge_reactions
-- Composite index for reaction queries
CREATE INDEX IF NOT EXISTS idx_challenge_reactions_challenge_user 
ON challenge_reactions(challenge_id, user_id, reaction_type);

-- Phase 3: Workout & Exercise Indexes for workout_sessions
-- Index for user's workout history
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date 
ON workout_sessions(user_id, workout_date DESC, is_completed);

-- Index for plan-based queries (partial index for planned workouts)
CREATE INDEX IF NOT EXISTS idx_workout_sessions_plan_date 
ON workout_sessions(workout_plan_id, workout_date DESC) 
WHERE workout_plan_id IS NOT NULL;

-- Phase 3: Workout & Exercise Indexes for exercise_logs
-- Index for session-based exercise retrieval
CREATE INDEX IF NOT EXISTS idx_exercise_logs_session_created 
ON exercise_logs(workout_session_id, created_at DESC);

-- Index for exercise tracking/progress
CREATE INDEX IF NOT EXISTS idx_exercise_logs_user_exercise 
ON exercise_logs(user_id, exercise_name, created_at DESC);

-- Phase 4: Social Posts & Comments for social_posts
-- Index for feed queries
CREATE INDEX IF NOT EXISTS idx_social_posts_user_created 
ON social_posts(user_id, created_at DESC);

-- Index for milestone posts (partial index for special posts)
CREATE INDEX IF NOT EXISTS idx_social_posts_milestone 
ON social_posts(is_milestone, created_at DESC) WHERE is_milestone = true;

-- Phase 4: Social Posts & Comments for post_comments
-- Post comments index
CREATE INDEX IF NOT EXISTS idx_post_comments_post_created 
ON post_comments(post_id, created_at DESC);

-- Phase 4: Social Posts & Comments for post_reactions
-- Post reactions index
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_user 
ON post_reactions(post_id, user_id, reaction_type);

-- Phase 5: Supporting Indexes for user_habit_scores
-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_user_habit_scores_period_rank 
ON user_habit_scores(score_period, period_start DESC, rank_position);

-- Index for user's score history
CREATE INDEX IF NOT EXISTS idx_user_habit_scores_user_period 
ON user_habit_scores(user_id, score_period, period_start DESC);

-- Phase 5: Supporting Indexes for notifications
-- Index for user's notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created 
ON notifications(user_id, is_read, created_at DESC);

-- Phase 5: Supporting Indexes for user_relationships
-- Index for friend lookups (follower perspective)
CREATE INDEX IF NOT EXISTS idx_user_relationships_follower_status 
ON user_relationships(follower_id, status, following_id);

-- Index for friend lookups (following perspective)
CREATE INDEX IF NOT EXISTS idx_user_relationships_following_status 
ON user_relationships(following_id, status, follower_id);

-- Analyze all affected tables to update statistics
ANALYZE habit_activities;
ANALYZE user_top_habits;
ANALYZE habits;
ANALYZE challenge_participants;
ANALYZE challenge_comments;
ANALYZE challenge_reactions;
ANALYZE workout_sessions;
ANALYZE exercise_logs;
ANALYZE social_posts;
ANALYZE post_comments;
ANALYZE post_reactions;
ANALYZE user_habit_scores;
ANALYZE notifications;
ANALYZE user_relationships;