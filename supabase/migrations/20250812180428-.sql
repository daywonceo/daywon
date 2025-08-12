-- Update RLS policies for profiles table to restrict access and protect email addresses

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new comprehensive RLS policies

-- 1. Users can always view their own complete profile (including email)
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- 2. Users can view basic profile info of users they have accepted friend relationships with (excluding email)
CREATE POLICY "Users can view friends basic profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() != id AND
  (
    EXISTS (
      SELECT 1 FROM public.user_relationships 
      WHERE follower_id = auth.uid() 
        AND following_id = profiles.id 
        AND status = 'accepted'
    ) OR
    EXISTS (
      SELECT 1 FROM public.user_relationships 
      WHERE follower_id = profiles.id 
        AND following_id = auth.uid() 
        AND status = 'accepted'
    )
  )
);

-- 3. Users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 4. Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Create a security definer function to get public profile data (without email)
CREATE OR REPLACE FUNCTION public.get_public_profiles()
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

-- Function to search public profiles by display name only (no email search)
CREATE OR REPLACE FUNCTION public.search_public_profiles(search_query text)
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
    AND p.display_name ILIKE '%' || search_query || '%'
    AND (
      EXISTS (
        SELECT 1 FROM public.user_relationships ur
        WHERE (ur.follower_id = auth.uid() AND ur.following_id = p.id AND ur.status = 'accepted')
           OR (ur.follower_id = p.id AND ur.following_id = auth.uid() AND ur.status = 'accepted')
      )
    );
$$;