-- Fix function search paths by setting them to 'public'
-- This addresses the WARN 1 and WARN 2 security issues

-- Update functions that don't have search_path set
ALTER FUNCTION public.update_habit_activities_updated_at() SET search_path = 'public';
ALTER FUNCTION public.update_app_sessions_updated_at() SET search_path = 'public';
ALTER FUNCTION public.update_habit_scores_updated_at() SET search_path = 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';
ALTER FUNCTION public.update_user_progress() SET search_path = 'public';

-- Update any other functions that may be missing search_path
ALTER FUNCTION public.calculate_habit_streak(uuid, date) SET search_path = 'public';
ALTER FUNCTION public.get_weekly_habit_summary(uuid, date) SET search_path = 'public';
ALTER FUNCTION public.update_habit_photos_on_merge() SET search_path = 'public';