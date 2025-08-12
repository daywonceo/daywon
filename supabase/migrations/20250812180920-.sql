-- Ensure profiles table has no public access and is fully secured

-- First, check existing policies and remove any that might allow public access
DROP POLICY IF EXISTS "Users can view friends basic profiles" ON public.profiles;

-- Create a more restrictive policy that only allows authenticated users to view profiles
-- and only their own profile includes email
CREATE POLICY "Authenticated users can view own profile only" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Create a separate policy for limited friend profile access (no email)
-- This will be handled through our security definer functions only
-- No direct SELECT access to other users' profiles

-- Update our security functions to be even more restrictive
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
AS $$
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
$$;

-- Update search function to be more restrictive
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
AS $$
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
$$;

-- Create a function for friend discovery that shows only basic info (no email, limited data)
CREATE OR REPLACE FUNCTION public.discover_potential_friends(search_query text DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  display_name text,
  avatar_url text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.display_name,
    p.avatar_url
  FROM public.profiles p
  WHERE p.id != auth.uid()
    AND p.display_name IS NOT NULL
    AND (
      search_query IS NULL 
      OR p.display_name ILIKE '%' || search_query || '%'
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.user_relationships ur
      WHERE (ur.follower_id = auth.uid() AND ur.following_id = p.id)
         OR (ur.follower_id = p.id AND ur.following_id = auth.uid())
    )
  LIMIT 50;
$$;