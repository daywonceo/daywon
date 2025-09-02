-- Fix function security warnings by setting proper search_path
DROP FUNCTION IF EXISTS public.end_habit_today(uuid);
DROP FUNCTION IF EXISTS public.resume_habit(uuid);
DROP FUNCTION IF EXISTS public.delete_habit_forever(uuid);

-- End today = stop future scheduling, keep history & Catch Up through today
CREATE OR REPLACE FUNCTION public.end_habit_today(p_habit uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.habits
  SET ended_at = NOW()
  WHERE id = p_habit AND user_id = auth.uid() AND ended_at IS NULL;
END; $$;

-- Resume = clear the end flag
CREATE OR REPLACE FUNCTION public.resume_habit(p_habit uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.habits
  SET ended_at = NULL
  WHERE id = p_habit AND user_id = auth.uid() AND ended_at IS NOT NULL;
END; $$;

-- True delete (keeps ON DELETE CASCADE behavior for logs)
CREATE OR REPLACE FUNCTION public.delete_habit_forever(p_habit uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.habits
  WHERE id = p_habit AND user_id = auth.uid();
END; $$;