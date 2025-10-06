-- Create friend_suggestions table for AI-recommended connections
CREATE TABLE public.friend_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  suggested_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  suggestion_reason TEXT,
  mutual_friends_count INTEGER DEFAULT 0,
  shared_habits_count INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, suggested_user_id)
);

-- Enable RLS
ALTER TABLE public.friend_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for friend_suggestions
CREATE POLICY "Users can view their own suggestions"
  ON public.friend_suggestions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can dismiss their own suggestions"
  ON public.friend_suggestions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own suggestions"
  ON public.friend_suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function: Calculate smart friend suggestions
CREATE OR REPLACE FUNCTION public.get_friend_suggestions(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  username TEXT,
  mutual_friends_count INTEGER,
  shared_habits_count INTEGER,
  score INTEGER,
  suggestion_reason TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH user_habits AS (
    SELECT DISTINCT category 
    FROM public.habits 
    WHERE habits.user_id = p_user_id AND status = 'active'
  ),
  mutual_friends AS (
    SELECT 
      CASE 
        WHEN ur1.following_id = p_user_id THEN ur2.following_id
        WHEN ur1.follower_id = p_user_id THEN ur2.follower_id
        ELSE NULL
      END as potential_friend_id,
      COUNT(*)::INTEGER as mutual_count
    FROM public.user_relationships ur1
    JOIN public.user_relationships ur2 ON (
      (ur1.following_id = ur2.follower_id AND ur1.follower_id != ur2.following_id AND ur2.following_id != p_user_id)
      OR (ur1.follower_id = ur2.following_id AND ur1.following_id != ur2.follower_id AND ur2.follower_id != p_user_id)
    )
    WHERE (ur1.follower_id = p_user_id OR ur1.following_id = p_user_id)
      AND ur1.status = 'accepted'
      AND ur2.status = 'accepted'
    GROUP BY potential_friend_id
  ),
  shared_habits AS (
    SELECT 
      h.user_id as potential_friend_id,
      COUNT(DISTINCT h.category)::INTEGER as shared_count
    FROM public.habits h
    JOIN user_habits uh ON h.category = uh.category
    WHERE h.user_id != p_user_id
      AND h.status = 'active'
    GROUP BY h.user_id
  )
  SELECT 
    p.id,
    p.display_name,
    p.avatar_url,
    p.username,
    COALESCE(mf.mutual_count, 0)::INTEGER as mutual_friends_count,
    COALESCE(sh.shared_count, 0)::INTEGER as shared_habits_count,
    (COALESCE(mf.mutual_count, 0) * 10 + COALESCE(sh.shared_count, 0) * 5)::INTEGER as score,
    CASE 
      WHEN mf.mutual_count > 0 AND sh.shared_count > 0 THEN 
        mf.mutual_count || ' mutual friends • ' || sh.shared_count || ' shared interests'
      WHEN mf.mutual_count > 0 THEN 
        mf.mutual_count || ' mutual friends'
      WHEN sh.shared_count > 0 THEN 
        sh.shared_count || ' shared interests'
      ELSE 'Similar interests'
    END as suggestion_reason
  FROM public.profiles p
  LEFT JOIN mutual_friends mf ON p.id = mf.potential_friend_id
  LEFT JOIN shared_habits sh ON p.id = sh.potential_friend_id
  WHERE p.id != p_user_id
    AND p.display_name IS NOT NULL
    AND p.id NOT IN (
      SELECT following_id FROM public.user_relationships WHERE follower_id = p_user_id
      UNION
      SELECT follower_id FROM public.user_relationships WHERE following_id = p_user_id
    )
    AND (mf.mutual_count > 0 OR sh.shared_count > 0)
  ORDER BY score DESC, p.created_at DESC
  LIMIT p_limit;
END;
$$;