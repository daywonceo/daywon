-- Complete fix for habit_difficulty table RLS policies
-- Remove all authenticated user access except SELECT

-- Drop all existing policies that allow authenticated users to modify data
DROP POLICY IF EXISTS "only_system_can_modify_habit_difficulty" ON public.habit_difficulty;
DROP POLICY IF EXISTS "only_system_can_update_habit_difficulty" ON public.habit_difficulty;
DROP POLICY IF EXISTS "only_system_can_delete_habit_difficulty" ON public.habit_difficulty;

-- Create restrictive policies that only allow system/service role access for modifications
CREATE POLICY "system_only_insert_habit_difficulty" 
ON public.habit_difficulty 
FOR INSERT 
TO service_role
WITH CHECK (true);

CREATE POLICY "system_only_update_habit_difficulty" 
ON public.habit_difficulty 
FOR UPDATE 
TO service_role
USING (true);

CREATE POLICY "system_only_delete_habit_difficulty" 
ON public.habit_difficulty 
FOR DELETE 
TO service_role
USING (true);

-- Authenticated users can only SELECT (read-only access)
-- System/service role can perform all operations