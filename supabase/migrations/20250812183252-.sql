-- Fix habit_difficulty table RLS to prevent exposure to unauthenticated users
-- This resolves the "Habit Configuration Data Exposed" security warning

-- Drop the existing public policy
DROP POLICY IF EXISTS "All users can view habit difficulty" ON public.habit_difficulty;

-- Create new policy that only allows authenticated users
CREATE POLICY "Authenticated users can view habit difficulty" 
ON public.habit_difficulty 
FOR SELECT 
TO authenticated
USING (true);

-- Keep other policies unchanged (system-only for modifications)
-- This ensures habit difficulty data is only accessible to logged-in users