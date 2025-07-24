-- Fix security issues by setting search_path for functions

-- Drop and recreate find_or_create_habit function with proper search_path
DROP FUNCTION IF EXISTS public.find_or_create_habit(UUID, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.find_or_create_habit(
  p_user_id UUID,
  p_name TEXT,
  p_description TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL
) RETURNS UUID 
SET search_path TO 'public'
AS $$
DECLARE
  existing_habit_id UUID;
  normalized_name TEXT;
BEGIN
  -- Normalize the habit name for comparison
  normalized_name := LOWER(TRIM(p_name));
  
  -- Look for existing habit with similar name (case-insensitive, trimmed)
  SELECT id INTO existing_habit_id 
  FROM public.habits 
  WHERE user_id = p_user_id 
    AND LOWER(TRIM(name)) = normalized_name
    AND status = 'active'
  LIMIT 1;
  
  -- If found, return existing habit ID
  IF existing_habit_id IS NOT NULL THEN
    RETURN existing_habit_id;
  END IF;
  
  -- If not found, create new habit
  INSERT INTO public.habits (user_id, name, description, category, status)
  VALUES (p_user_id, p_name, p_description, p_category, 'active')
  RETURNING id INTO existing_habit_id;
  
  RETURN existing_habit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate merge_duplicate_habits function with proper search_path
DROP FUNCTION IF EXISTS public.merge_duplicate_habits(UUID, UUID, UUID[]);

CREATE OR REPLACE FUNCTION public.merge_duplicate_habits(
  p_user_id UUID,
  p_keep_habit_id UUID,
  p_merge_habit_ids UUID[]
) RETURNS VOID 
SET search_path TO 'public'
AS $$
BEGIN
  -- Update all habit_activities to reference the kept habit
  UPDATE public.habit_activities 
  SET habit_id = p_keep_habit_id 
  WHERE user_id = p_user_id 
    AND habit_id = ANY(p_merge_habit_ids);
  
  -- Update habit_photos if they exist
  UPDATE public.habit_photos 
  SET habit_name = (SELECT name FROM public.habits WHERE id = p_keep_habit_id)
  WHERE user_id = p_user_id 
    AND habit_name IN (
      SELECT name FROM public.habits WHERE id = ANY(p_merge_habit_ids)
    );
  
  -- Archive the duplicate habits instead of deleting them
  UPDATE public.habits 
  SET status = 'archived' 
  WHERE user_id = p_user_id 
    AND id = ANY(p_merge_habit_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;