-- Add an "ended_at" timestamp to stop future scheduling without erasing history
ALTER TABLE public.habits
ADD COLUMN IF NOT EXISTS ended_at timestamptz;

-- (Optional) Keep this if you already soft-delete via archive
ALTER TABLE public.habits
ADD COLUMN IF NOT EXISTS archived_at timestamptz;

-- Ensure name uniqueness only for active (not archived) habits
DROP INDEX IF EXISTS uq_habits_user_name_active;
CREATE UNIQUE INDEX uq_habits_user_name_active
ON public.habits (user_id, lower(name))
WHERE archived_at IS NULL;

-- Ensure logs cascade on true delete
ALTER TABLE public.habit_activities
DROP CONSTRAINT IF EXISTS habit_activities_habit_id_fkey;
ALTER TABLE public.habit_activities
ADD CONSTRAINT habit_activities_habit_id_fkey
FOREIGN KEY (habit_id) REFERENCES public.habits(id) ON DELETE CASCADE;