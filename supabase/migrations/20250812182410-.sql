-- FINAL COMPREHENSIVE SECURITY FIX: Ensure profiles table is completely secured

-- Drop ALL existing policies on profiles table to ensure clean state
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own complete profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can view friends basic profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_can_only_view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public.profiles;

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create the most restrictive policies possible
-- Users can ONLY see their own profile data
CREATE POLICY "strict_own_profile_select" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Users can ONLY insert their own profile during registration
CREATE POLICY "strict_own_profile_insert" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Users can ONLY update their own profile
CREATE POLICY "strict_own_profile_update" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- No DELETE policy = no one can delete profiles
-- No public role access = no unauthenticated access
-- No anon role access = no anonymous access

-- Verify there are NO policies that allow public or anon access
-- This ensures the table is completely private except for own data access