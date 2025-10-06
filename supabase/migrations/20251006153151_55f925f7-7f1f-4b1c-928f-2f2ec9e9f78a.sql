-- First, create the normalization function
CREATE OR REPLACE FUNCTION public.normalize_habit_name(habit_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  normalized TEXT;
BEGIN
  normalized := LOWER(TRIM(habit_name));
  
  -- Handle 'ies' -> 'y' (activities -> activity)
  IF normalized ~ 'ies$' AND LENGTH(normalized) > 4 THEN
    normalized := SUBSTRING(normalized FROM 1 FOR LENGTH(normalized) - 3) || 'y';
  -- Handle 'es' after ch/sh/ss/x/z
  ELSIF normalized ~ '(ch|sh|ss|x|z)es$' THEN
    normalized := SUBSTRING(normalized FROM 1 FOR LENGTH(normalized) - 2);
  ELSIF normalized ~ 'ses$' AND LENGTH(normalized) > 4 THEN
    normalized := SUBSTRING(normalized FROM 1 FOR LENGTH(normalized) - 2);
  -- Handle simple 's' removal (devotions -> devotion)
  ELSIF normalized ~ 's$' AND LENGTH(normalized) > 3 THEN
    normalized := SUBSTRING(normalized FROM 1 FOR LENGTH(normalized) - 1);
  END IF;
  
  RETURN normalized;
END;
$$;

-- Delete duplicate activities where both Devotion and Devotions exist on same date
-- Keep the "Devotion" activity, delete "Devotions" activity
DELETE FROM public.habit_activities
WHERE habit_id = 'ad99c7ac-5127-4753-9f1b-b530b5a14e1b'::UUID  -- Devotions
  AND activity_date IN (
    SELECT activity_date 
    FROM public.habit_activities 
    WHERE habit_id = 'abc1f070-b9a4-4073-aa5b-974111509654'::UUID  -- Devotion
  );

-- Now move remaining "Devotions" activities to "Devotion"
UPDATE public.habit_activities
SET habit_id = 'abc1f070-b9a4-4073-aa5b-974111509654'::UUID,
    habit_name = 'Devotion'
WHERE habit_id = 'ad99c7ac-5127-4753-9f1b-b530b5a14e1b'::UUID;

-- Archive the duplicate "Devotions" habit
UPDATE public.habits
SET status = 'archived',
    archived_at = NOW()
WHERE id = 'ad99c7ac-5127-4753-9f1b-b530b5a14e1b'::UUID;

-- Update find_or_create_habit to use normalization
CREATE OR REPLACE FUNCTION public.find_or_create_habit(
  p_user_id UUID, 
  p_name TEXT, 
  p_description TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_habit_id UUID;
  normalized_name TEXT;
BEGIN
  normalized_name := normalize_habit_name(p_name);
  
  SELECT id INTO existing_habit_id 
  FROM public.habits 
  WHERE user_id = p_user_id 
    AND normalize_habit_name(name) = normalized_name
    AND status = 'active'
  ORDER BY created_at ASC
  LIMIT 1;
  
  IF existing_habit_id IS NOT NULL THEN
    RETURN existing_habit_id;
  END IF;
  
  INSERT INTO public.habits (user_id, name, description, category, status)
  VALUES (p_user_id, p_name, p_description, p_category, 'active')
  RETURNING id INTO existing_habit_id;
  
  RETURN existing_habit_id;
END;
$$;