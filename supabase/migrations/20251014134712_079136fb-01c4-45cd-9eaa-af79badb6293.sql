-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add is_day_won_member to profiles table
ALTER TABLE public.profiles
ADD COLUMN is_day_won_member BOOLEAN DEFAULT FALSE,
ADD COLUMN day_won_member_since TIMESTAMPTZ;

-- Create invite_codes table
CREATE TABLE public.invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days')
);

-- Enable RLS on invite_codes
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- RLS policies for invite_codes
CREATE POLICY "Admins can create invite codes"
  ON public.invite_codes
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all invite codes"
  ON public.invite_codes
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view unused non-expired codes for redemption"
  ON public.invite_codes
  FOR SELECT
  USING (is_used = FALSE AND expires_at > NOW());

CREATE POLICY "Authenticated users can update codes they're redeeming"
  ON public.invite_codes
  FOR UPDATE
  USING (is_used = FALSE AND expires_at > NOW() AND auth.uid() IS NOT NULL)
  WITH CHECK (used_by = auth.uid());

-- Create function to redeem invite code
CREATE OR REPLACE FUNCTION public.redeem_invite_code(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code_id UUID;
  v_user_id UUID;
  v_already_member BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Not authenticated');
  END IF;
  
  -- Check if already a Day Won Member
  SELECT is_day_won_member INTO v_already_member
  FROM public.profiles
  WHERE id = v_user_id;
  
  IF v_already_member THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Already a Day Won Member');
  END IF;
  
  -- Find and lock the invite code
  SELECT id INTO v_code_id
  FROM public.invite_codes
  WHERE code = p_code
    AND is_used = FALSE
    AND expires_at > NOW()
  FOR UPDATE;
  
  IF v_code_id IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Invalid or expired invite code');
  END IF;
  
  -- Mark code as used
  UPDATE public.invite_codes
  SET is_used = TRUE,
      used_by = v_user_id,
      used_at = NOW()
  WHERE id = v_code_id;
  
  -- Grant Day Won Member status
  UPDATE public.profiles
  SET is_day_won_member = TRUE,
      day_won_member_since = NOW()
  WHERE id = v_user_id;
  
  RETURN jsonb_build_object('success', TRUE, 'message', 'Welcome to Day Won Member!');
END;
$$;