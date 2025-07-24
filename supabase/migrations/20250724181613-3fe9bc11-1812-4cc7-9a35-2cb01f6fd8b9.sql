-- Add habit_id column to habit_activities table
ALTER TABLE public.habit_activities 
ADD COLUMN habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_habit_activities_habit_id ON public.habit_activities(habit_id);

-- Migrate existing data by matching habit names to habit IDs
UPDATE public.habit_activities 
SET habit_id = habits.id 
FROM public.habits 
WHERE habit_activities.user_id = habits.user_id 
  AND LOWER(TRIM(habit_activities.habit_name)) = LOWER(TRIM(habits.name));

-- Create function to find or create habit with smart matching
CREATE OR REPLACE FUNCTION public.find_or_create_habit(
  p_user_id UUID,
  p_name TEXT,
  p_description TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL
) RETURNS UUID AS $$
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

-- Create function to merge duplicate habits
CREATE OR REPLACE FUNCTION public.merge_duplicate_habits(
  p_user_id UUID,
  p_keep_habit_id UUID,
  p_merge_habit_ids UUID[]
) RETURNS VOID AS $$
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