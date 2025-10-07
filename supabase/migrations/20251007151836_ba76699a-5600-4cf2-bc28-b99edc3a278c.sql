-- Create friend invitations table
CREATE TABLE public.friend_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  accepted_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create index for faster lookups
CREATE INDEX idx_friend_invitations_email ON public.friend_invitations(email);
CREATE INDEX idx_friend_invitations_token ON public.friend_invitations(token);
CREATE INDEX idx_friend_invitations_inviter ON public.friend_invitations(inviter_id);

-- Enable RLS
ALTER TABLE public.friend_invitations ENABLE ROW LEVEL SECURITY;

-- Users can view their own sent invitations
CREATE POLICY "Users can view their sent invitations"
ON public.friend_invitations
FOR SELECT
USING (auth.uid() = inviter_id);

-- Users can create invitations
CREATE POLICY "Users can create invitations"
ON public.friend_invitations
FOR INSERT
WITH CHECK (auth.uid() = inviter_id);

-- Create privacy settings table
CREATE TABLE public.privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_visibility TEXT NOT NULL DEFAULT 'friends' CHECK (profile_visibility IN ('public', 'friends', 'private')),
  allow_friend_requests TEXT NOT NULL DEFAULT 'everyone' CHECK (allow_friend_requests IN ('everyone', 'friends_of_friends', 'nobody')),
  show_online_status BOOLEAN NOT NULL DEFAULT true,
  show_activity BOOLEAN NOT NULL DEFAULT true,
  show_habits BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;

-- Users can manage their own privacy settings
CREATE POLICY "Users can manage their own privacy settings"
ON public.privacy_settings
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_privacy_settings_updated_at
BEFORE UPDATE ON public.privacy_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check if user can send friend request based on privacy settings
CREATE OR REPLACE FUNCTION public.can_send_friend_request(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  privacy_setting TEXT;
  requester_id UUID;
BEGIN
  requester_id := auth.uid();
  
  -- Can't send request to yourself
  IF requester_id = target_user_id THEN
    RETURN false;
  END IF;
  
  -- Check if already friends or request exists
  IF EXISTS (
    SELECT 1 FROM public.user_relationships
    WHERE (follower_id = requester_id AND following_id = target_user_id)
       OR (follower_id = target_user_id AND following_id = requester_id)
  ) THEN
    RETURN false;
  END IF;
  
  -- Get target user's privacy setting
  SELECT allow_friend_requests INTO privacy_setting
  FROM public.privacy_settings
  WHERE user_id = target_user_id;
  
  -- Default to everyone if no settings found
  IF privacy_setting IS NULL THEN
    privacy_setting := 'everyone';
  END IF;
  
  -- Check based on privacy setting
  IF privacy_setting = 'nobody' THEN
    RETURN false;
  ELSIF privacy_setting = 'friends_of_friends' THEN
    -- Check if they have mutual friends
    RETURN EXISTS (
      SELECT 1 FROM public.user_relationships ur1
      JOIN public.user_relationships ur2 ON ur1.following_id = ur2.follower_id
      WHERE ur1.follower_id = requester_id
        AND ur2.following_id = target_user_id
        AND ur1.status = 'accepted'
        AND ur2.status = 'accepted'
    );
  ELSE
    RETURN true;
  END IF;
END;
$$;