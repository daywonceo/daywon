-- Migration to cleanup and consolidate habit tracking to use habit_id as source of truth

-- Step 1: Backfill missing habit_id values in habit_activities
-- This will find or create habit records for activities that don't have habit_id set
DO $$
DECLARE
    activity_record RECORD;
    found_habit_id UUID;
BEGIN
    -- Loop through all habit_activities that don't have habit_id set
    FOR activity_record IN 
        SELECT DISTINCT user_id, habit_name 
        FROM public.habit_activities 
        WHERE habit_id IS NULL
    LOOP
        -- Find or create the habit using our existing function
        SELECT public.find_or_create_habit(
            activity_record.user_id, 
            activity_record.habit_name, 
            NULL, 
            NULL
        ) INTO found_habit_id;
        
        -- Update all activities for this user/habit_name combination
        UPDATE public.habit_activities 
        SET habit_id = found_habit_id 
        WHERE user_id = activity_record.user_id 
          AND habit_name = activity_record.habit_name 
          AND habit_id IS NULL;
          
        RAISE NOTICE 'Updated habit_activities for user % habit % with habit_id %', 
                     activity_record.user_id, activity_record.habit_name, found_habit_id;
    END LOOP;
END $$;

-- Step 2: Identify and merge duplicate habits
-- Create a temporary function to find and merge duplicates
CREATE OR REPLACE FUNCTION merge_all_duplicate_habits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    user_record RECORD;
    habit_group RECORD;
    keep_habit_id UUID;
    merge_habit_ids UUID[];
    habit_counts RECORD;
BEGIN
    -- Loop through each user
    FOR user_record IN SELECT DISTINCT user_id FROM public.habits WHERE status = 'active'
    LOOP
        -- Find groups of habits with similar names for this user
        FOR habit_group IN 
            SELECT LOWER(TRIM(name)) as normalized_name, array_agg(id) as habit_ids
            FROM public.habits 
            WHERE user_id = user_record.user_id AND status = 'active'
            GROUP BY LOWER(TRIM(name))
            HAVING COUNT(*) > 1
        LOOP
            -- For each group of duplicates, find the one with the most activities
            SELECT habit_id, COUNT(*) as activity_count
            INTO habit_counts
            FROM public.habit_activities 
            WHERE habit_id = ANY(habit_group.habit_ids)
            GROUP BY habit_id
            ORDER BY COUNT(*) DESC, habit_id
            LIMIT 1;
            
            -- If we found activities, use the habit with most activities
            IF habit_counts.habit_id IS NOT NULL THEN
                keep_habit_id := habit_counts.habit_id;
            ELSE
                -- If no activities found, just keep the first one alphabetically
                keep_habit_id := habit_group.habit_ids[1];
            END IF;
            
            -- Create array of habits to merge (excluding the one to keep)
            SELECT array_agg(id) 
            INTO merge_habit_ids
            FROM unnest(habit_group.habit_ids) as id 
            WHERE id != keep_habit_id;
            
            -- Only merge if there are duplicates to merge
            IF array_length(merge_habit_ids, 1) > 0 THEN
                -- Call our existing merge function
                PERFORM public.merge_duplicate_habits(
                    user_record.user_id,
                    keep_habit_id,
                    merge_habit_ids
                );
                
                RAISE NOTICE 'Merged duplicate habits for user % - kept habit_id % and merged %', 
                           user_record.user_id, keep_habit_id, merge_habit_ids;
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- Execute the merge function
SELECT merge_all_duplicate_habits();

-- Drop the temporary function
DROP FUNCTION merge_all_duplicate_habits();

-- Step 3: Ensure habit_id is not null for future inserts
-- Add a constraint to prevent null habit_id values going forward
ALTER TABLE public.habit_activities 
ALTER COLUMN habit_id SET NOT NULL;

-- Step 4: Create an index on habit_id for better performance
CREATE INDEX IF NOT EXISTS idx_habit_activities_habit_id 
ON public.habit_activities(habit_id);

-- Step 5: Create an index on habit_id and activity_date for streak calculations
CREATE INDEX IF NOT EXISTS idx_habit_activities_habit_id_date 
ON public.habit_activities(habit_id, activity_date);

-- Step 6: Update habit_photos to reference habit_id instead of just habit_name
-- First add habit_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'habit_photos' AND column_name = 'habit_id'
    ) THEN
        ALTER TABLE public.habit_photos ADD COLUMN habit_id UUID;
    END IF;
END $$;

-- Backfill habit_id in habit_photos
UPDATE public.habit_photos 
SET habit_id = h.id 
FROM public.habits h 
WHERE habit_photos.user_id = h.user_id 
  AND LOWER(TRIM(habit_photos.habit_name)) = LOWER(TRIM(h.name))
  AND h.status = 'active'
  AND habit_photos.habit_id IS NULL;

-- Create function to automatically update habit_photos when habits are merged
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

-- Create trigger to automatically update habit_photos when habit_activities are updated
DROP TRIGGER IF EXISTS trigger_update_habit_photos_on_activity_update ON public.habit_activities;
CREATE TRIGGER trigger_update_habit_photos_on_activity_update
    AFTER UPDATE OF habit_id ON public.habit_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_habit_photos_on_merge();