-- Fix security issues found by linter

-- Update functions to include proper search_path security settings
CREATE OR REPLACE FUNCTION public.get_public_profiles()
 RETURNS TABLE(id uuid, display_name text, avatar_url text, bio text, status text, last_active timestamp with time zone, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
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

CREATE OR REPLACE FUNCTION public.search_public_profiles(search_query text)
 RETURNS TABLE(id uuid, display_name text, avatar_url text, bio text, status text, last_active timestamp with time zone, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
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
    AND p.display_name ILIKE '%' || search_query || '%'
    AND (
      EXISTS (
        SELECT 1 FROM public.user_relationships ur
        WHERE (ur.follower_id = auth.uid() AND ur.following_id = p.id AND ur.status = 'accepted')
           OR (ur.follower_id = p.id AND ur.following_id = auth.uid() AND ur.status = 'accepted')
      )
    );
$function$;