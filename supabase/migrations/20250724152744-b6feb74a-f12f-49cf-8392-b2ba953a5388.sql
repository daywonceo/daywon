-- Enhance profiles table for social features
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'away', 'offline'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create user_relationships table for friends/following
CREATE TABLE IF NOT EXISTS public.user_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Enable RLS on user_relationships
ALTER TABLE public.user_relationships ENABLE ROW LEVEL SECURITY;

-- Create policies for user_relationships
CREATE POLICY "Users can view their own relationships" 
ON public.user_relationships 
FOR SELECT 
USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can create their own relationship requests" 
ON public.user_relationships 
FOR INSERT 
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can update relationships they're involved in" 
ON public.user_relationships 
FOR UPDATE 
USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can delete their own relationships" 
ON public.user_relationships 
FOR DELETE 
USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- Create social_posts table for user activity sharing
CREATE TABLE IF NOT EXISTS public.social_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  habit_name TEXT NOT NULL,
  habit_type TEXT,
  content TEXT NOT NULL,
  caption TEXT,
  streak_count INTEGER DEFAULT 0,
  is_milestone BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on social_posts
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for social_posts
CREATE POLICY "Users can view posts from their friends or public posts" 
ON public.social_posts 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.user_relationships 
    WHERE follower_id = auth.uid() 
    AND following_id = social_posts.user_id 
    AND status = 'accepted'
  )
);

CREATE POLICY "Users can create their own posts" 
ON public.social_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.social_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
ON public.social_posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create post_reactions table for likes/reactions
CREATE TABLE IF NOT EXISTS public.post_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'fire', 'clap', 'star')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id, reaction_type)
);

-- Enable RLS on post_reactions
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

-- Create policies for post_reactions
CREATE POLICY "Users can view reactions on posts they can see" 
ON public.post_reactions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.social_posts 
    WHERE id = post_reactions.post_id 
    AND (
      user_id = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM public.user_relationships 
        WHERE follower_id = auth.uid() 
        AND following_id = social_posts.user_id 
        AND status = 'accepted'
      )
    )
  )
);

CREATE POLICY "Users can create reactions on posts they can see" 
ON public.post_reactions 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.social_posts 
    WHERE id = post_reactions.post_id 
    AND (
      user_id = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM public.user_relationships 
        WHERE follower_id = auth.uid() 
        AND following_id = social_posts.user_id 
        AND status = 'accepted'
      )
    )
  )
);

CREATE POLICY "Users can delete their own reactions" 
ON public.post_reactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_relationships_updated_at
  BEFORE UPDATE ON public.user_relationships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_posts_updated_at
  BEFORE UPDATE ON public.social_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_relationships_follower ON public.user_relationships(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_relationships_following ON public.user_relationships(following_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON public.social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON public.social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON public.post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON public.profiles(last_active DESC);