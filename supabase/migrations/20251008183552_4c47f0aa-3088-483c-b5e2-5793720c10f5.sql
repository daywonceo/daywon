-- Drop existing function first
DROP FUNCTION IF EXISTS public.can_send_friend_request(uuid);

-- Create blocked_users table
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  reason TEXT,
  UNIQUE(blocker_id, blocked_id)
);

-- Enable RLS on blocked_users
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blocked_users
DROP POLICY IF EXISTS "Users can view their own blocks" ON public.blocked_users;
CREATE POLICY "Users can view their own blocks"
  ON public.blocked_users FOR SELECT
  USING (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "Users can create blocks" ON public.blocked_users;
CREATE POLICY "Users can create blocks"
  ON public.blocked_users FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "Users can delete their own blocks" ON public.blocked_users;
CREATE POLICY "Users can delete their own blocks"
  ON public.blocked_users FOR DELETE
  USING (auth.uid() = blocker_id);

-- Create best_friends table
CREATE TABLE IF NOT EXISTS public.best_friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pinned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  position INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, friend_id)
);

-- Enable RLS on best_friends
ALTER TABLE public.best_friends ENABLE ROW LEVEL SECURITY;

-- RLS Policies for best_friends
DROP POLICY IF EXISTS "Users can view their own best friends" ON public.best_friends;
CREATE POLICY "Users can view their own best friends"
  ON public.best_friends FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create best friends" ON public.best_friends;
CREATE POLICY "Users can create best friends"
  ON public.best_friends FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own best friends" ON public.best_friends;
CREATE POLICY "Users can update their own best friends"
  ON public.best_friends FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own best friends" ON public.best_friends;
CREATE POLICY "Users can delete their own best friends"
  ON public.best_friends FOR DELETE
  USING (auth.uid() = user_id);

-- Create friend_request_limits table for rate limiting
CREATE TABLE IF NOT EXISTS public.friend_request_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requests_sent_today INTEGER NOT NULL DEFAULT 0,
  last_request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(user_id)
);

-- Enable RLS on friend_request_limits
ALTER TABLE public.friend_request_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for friend_request_limits
DROP POLICY IF EXISTS "Users can view their own limits" ON public.friend_request_limits;
CREATE POLICY "Users can view their own limits"
  ON public.friend_request_limits FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage limits" ON public.friend_request_limits;
CREATE POLICY "System can manage limits"
  ON public.friend_request_limits FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to check if user can send friend request
CREATE OR REPLACE FUNCTION public.can_send_friend_request(sender_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  last_date DATE;
  max_requests_per_day INTEGER := 50;
BEGIN
  SELECT requests_sent_today, last_request_date
  INTO current_count, last_date
  FROM public.friend_request_limits
  WHERE user_id = sender_id;
  
  IF NOT FOUND THEN
    INSERT INTO public.friend_request_limits (user_id, requests_sent_today, last_request_date)
    VALUES (sender_id, 0, CURRENT_DATE);
    RETURN true;
  END IF;
  
  IF last_date < CURRENT_DATE THEN
    UPDATE public.friend_request_limits
    SET requests_sent_today = 0, last_request_date = CURRENT_DATE
    WHERE user_id = sender_id;
    RETURN true;
  END IF;
  
  RETURN current_count < max_requests_per_day;
END;
$$;

-- Create function to increment friend request count
DROP FUNCTION IF EXISTS public.increment_friend_request_count(uuid);
CREATE OR REPLACE FUNCTION public.increment_friend_request_count(sender_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.friend_request_limits (user_id, requests_sent_today, last_request_date)
  VALUES (sender_id, 1, CURRENT_DATE)
  ON CONFLICT (user_id)
  DO UPDATE SET
    requests_sent_today = CASE
      WHEN friend_request_limits.last_request_date < CURRENT_DATE THEN 1
      ELSE friend_request_limits.requests_sent_today + 1
    END,
    last_request_date = CURRENT_DATE;
END;
$$;

-- Create function to get mutual friends
DROP FUNCTION IF EXISTS public.get_mutual_friends(uuid, uuid);
CREATE OR REPLACE FUNCTION public.get_mutual_friends(user_a UUID, user_b UUID)
RETURNS TABLE(
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  username TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    p.id,
    p.display_name,
    p.avatar_url,
    p.username
  FROM public.profiles p
  WHERE p.id IN (
    SELECT CASE
      WHEN ur1.follower_id = user_a THEN ur1.following_id
      ELSE ur1.follower_id
    END
    FROM public.user_relationships ur1
    WHERE (ur1.follower_id = user_a OR ur1.following_id = user_a)
      AND ur1.status = 'accepted'
    
    INTERSECT
    
    SELECT CASE
      WHEN ur2.follower_id = user_b THEN ur2.following_id
      ELSE ur2.follower_id
    END
    FROM public.user_relationships ur2
    WHERE (ur2.follower_id = user_b OR ur2.following_id = user_b)
      AND ur2.status = 'accepted'
  )
  AND p.id != user_a
  AND p.id != user_b;
END;
$$;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON public.blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON public.blocked_users(blocked_id);
CREATE INDEX IF NOT EXISTS idx_best_friends_user ON public.best_friends(user_id);
CREATE INDEX IF NOT EXISTS idx_best_friends_friend ON public.best_friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friend_request_limits_user ON public.friend_request_limits(user_id);
