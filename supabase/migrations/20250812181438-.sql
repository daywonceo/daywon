-- COMPREHENSIVE SECURITY FIX: Address all security findings

-- 1. Fix function search_path issues by updating all functions to be secure
-- Update all existing functions to have proper search_path settings

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    display_name, 
    username
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'display_name',
    LOWER(NEW.raw_user_meta_data ->> 'username')
  );
  RETURN NEW;
END;
$function$;

-- Fix find_or_create_habit function
CREATE OR REPLACE FUNCTION public.find_or_create_habit(p_user_id uuid, p_name text, p_description text DEFAULT NULL::text, p_category text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  existing_habit_id UUID;
  normalized_name TEXT;
BEGIN
  normalized_name := LOWER(TRIM(p_name));
  
  SELECT id INTO existing_habit_id 
  FROM public.habits 
  WHERE user_id = p_user_id 
    AND LOWER(TRIM(name)) = normalized_name
    AND status = 'active'
  LIMIT 1;
  
  IF existing_habit_id IS NOT NULL THEN
    RETURN existing_habit_id;
  END IF;
  
  INSERT INTO public.habits (user_id, name, description, category, status)
  VALUES (p_user_id, p_name, p_description, p_category, 'active')
  RETURNING id INTO existing_habit_id;
  
  RETURN existing_habit_id;
END;
$function$;

-- Fix merge_duplicate_habits function
CREATE OR REPLACE FUNCTION public.merge_duplicate_habits(p_user_id uuid, p_keep_habit_id uuid, p_merge_habit_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.habit_activities 
  SET habit_id = p_keep_habit_id 
  WHERE user_id = p_user_id 
    AND habit_id = ANY(p_merge_habit_ids);
  
  UPDATE public.habit_photos 
  SET habit_name = (SELECT name FROM public.habits WHERE id = p_keep_habit_id)
  WHERE user_id = p_user_id 
    AND habit_name IN (
      SELECT name FROM public.habits WHERE id = ANY(p_merge_habit_ids)
    );
  
  UPDATE public.habits 
  SET status = 'archived' 
  WHERE user_id = p_user_id 
    AND id = ANY(p_merge_habit_ids);
END;
$function$;

-- Fix get_connected_profiles function
CREATE OR REPLACE FUNCTION public.get_connected_profiles()
RETURNS TABLE (
  id uuid,
  display_name text,
  avatar_url text,
  bio text,
  status text,
  last_active timestamp with time zone,
  created_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $function$
  SELECT 
    p.id,
    p.display_name,
    p.avatar_url,
    p.bio,
    p.status,
    p.last_active,
    p.created_at
  FROM public.profiles p
  WHERE p.id != auth.uid()
    AND (
      EXISTS (
        SELECT 1 FROM public.user_relationships ur
        WHERE (ur.follower_id = auth.uid() AND ur.following_id = p.id AND ur.status = 'accepted')
           OR (ur.follower_id = p.id AND ur.following_id = auth.uid() AND ur.status = 'accepted')
      )
    );
$function$;

-- Fix search_connected_profiles function
CREATE OR REPLACE FUNCTION public.search_connected_profiles(search_query text)
RETURNS TABLE (
  id uuid,
  display_name text,
  avatar_url text,
  bio text,
  status text,
  last_active timestamp with time zone,
  created_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $function$
  SELECT 
    p.id,
    p.display_name,
    p.avatar_url,
    p.bio,
    p.status,
    p.last_active,
    p.created_at
  FROM public.profiles p
  WHERE p.id != auth.uid()
    AND p.display_name IS NOT NULL
    AND p.display_name ILIKE '%' || search_query || '%'
    AND (
      EXISTS (
        SELECT 1 FROM public.user_relationships ur
        WHERE (ur.follower_id = auth.uid() AND ur.following_id = p.id AND ur.status = 'accepted')
           OR (ur.follower_id = p.id AND ur.following_id = auth.uid() AND ur.status = 'accepted')
      )
    );
$function$;