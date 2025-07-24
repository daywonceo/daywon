-- Fix security warning by updating the trigger function to have proper search_path
CREATE OR REPLACE FUNCTION update_habit_photos_on_merge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Update habit_photos to reference the new habit_id
    UPDATE public.habit_photos 
    SET habit_id = NEW.habit_id
    WHERE user_id = NEW.user_id 
      AND LOWER(TRIM(habit_name)) = LOWER(TRIM((SELECT name FROM public.habits WHERE id = NEW.habit_id)))
      AND habit_id IS NULL;
      
    RETURN NEW;
END $$;