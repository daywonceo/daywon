-- Continue fixing remaining functions and address leaderboard privacy

-- Fix the remaining functions with search_path issues

-- Fix discover_potential_friends function
CREATE OR REPLACE FUNCTION public.discover_potential_friends(search_query text DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  display_name text,
  avatar_url text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $function$
  SELECT 
    p.id,
    p.display_name,
    p.avatar_url
  FROM public.profiles p
  WHERE p.id != auth.uid()
    AND p.display_name IS NOT NULL
    AND (
      search_query IS NULL 
      OR p.display_name ILIKE '%' || search_query || '%'
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.user_relationships ur
      WHERE (ur.follower_id = auth.uid() AND ur.following_id = p.id)
         OR (ur.follower_id = p.id AND ur.following_id = auth.uid())
    )
  LIMIT 50;
$function$;

-- Fix update_user_progress function
CREATE OR REPLACE FUNCTION public.update_user_progress()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.user_progress (
    user_id, 
    exercise_name, 
    current_weight_lbs, 
    previous_weight_lbs,
    total_sessions,
    updated_at
  )
  VALUES (
    NEW.user_id,
    NEW.exercise_name,
    NEW.weight_lbs,
    (SELECT current_weight_lbs FROM public.user_progress WHERE user_id = NEW.user_id AND exercise_name = NEW.exercise_name),
    1,
    now()
  )
  ON CONFLICT (user_id, exercise_name) 
  DO UPDATE SET
    previous_weight_lbs = user_progress.current_weight_lbs,
    current_weight_lbs = NEW.weight_lbs,
    total_sessions = user_progress.total_sessions + 1,
    weight_increase_percent = CASE 
      WHEN user_progress.current_weight_lbs > 0 
      THEN ((NEW.weight_lbs - user_progress.current_weight_lbs) / user_progress.current_weight_lbs) * 100
      ELSE 0
    END,
    last_increase_date = CASE 
      WHEN NEW.weight_lbs > user_progress.current_weight_lbs 
      THEN CURRENT_DATE
      ELSE user_progress.last_increase_date
    END,
    updated_at = now();
    
  RETURN NEW;
END;
$function$;

-- Fix update_habit_photos_on_merge function
CREATE OR REPLACE FUNCTION public.update_habit_photos_on_merge()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    UPDATE public.habit_photos 
    SET habit_id = NEW.habit_id
    WHERE user_id = NEW.user_id 
      AND LOWER(TRIM(habit_name)) = LOWER(TRIM((SELECT name FROM public.habits WHERE id = NEW.habit_id)))
      AND habit_id IS NULL;
      
    RETURN NEW;
END;
$function$;

-- 2. Address leaderboard privacy concerns by creating a secure anonymized leaderboard view
-- Update user_habit_scores RLS to only allow users to see their own scores
DROP POLICY IF EXISTS "Users can view all habit scores for leaderboard" ON public.user_habit_scores;

-- Allow users to view only their own scores
CREATE POLICY "users_can_view_own_scores" 
ON public.user_habit_scores 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Create a secure function for anonymized leaderboard data
CREATE OR REPLACE FUNCTION public.get_anonymized_leaderboard(score_period_param text DEFAULT 'weekly')
RETURNS TABLE (
  rank_position integer,
  total_score numeric,
  consistency_rate numeric,
  score_period text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $function$
  SELECT 
    rank_position,
    total_score,
    consistency_rate,
    score_period
  FROM public.user_habit_scores
  WHERE score_period = score_period_param
    AND rank_position IS NOT NULL
  ORDER BY rank_position ASC
  LIMIT 100;
$function$;

-- 3. Secure habit_difficulty table with proper write restrictions
CREATE POLICY "only_system_can_modify_habit_difficulty" 
ON public.habit_difficulty 
FOR INSERT 
TO service_role
WITH CHECK (true);

CREATE POLICY "only_system_can_update_habit_difficulty" 
ON public.habit_difficulty 
FOR UPDATE 
TO service_role
USING (true);

CREATE POLICY "only_system_can_delete_habit_difficulty" 
ON public.habit_difficulty 
FOR DELETE 
TO service_role
USING (true);