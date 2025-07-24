-- Create comments table with threading support
CREATE TABLE public.post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  parent_comment_id UUID NULL, -- For threading/replies
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_edited BOOLEAN DEFAULT false,
  CONSTRAINT fk_parent_comment FOREIGN KEY (parent_comment_id) REFERENCES public.post_comments(id) ON DELETE CASCADE
);

-- Enable RLS on comments
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for comments
CREATE POLICY "Users can view comments on posts they can see" 
ON public.post_comments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM social_posts 
    WHERE social_posts.id = post_comments.post_id 
    AND (
      social_posts.user_id = auth.uid() 
      OR EXISTS (
        SELECT 1 FROM user_relationships 
        WHERE user_relationships.follower_id = auth.uid() 
        AND user_relationships.following_id = social_posts.user_id 
        AND user_relationships.status = 'accepted'
      )
    )
  )
);

CREATE POLICY "Users can create comments on posts they can see" 
ON public.post_comments 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM social_posts 
    WHERE social_posts.id = post_comments.post_id 
    AND (
      social_posts.user_id = auth.uid() 
      OR EXISTS (
        SELECT 1 FROM user_relationships 
        WHERE user_relationships.follower_id = auth.uid() 
        AND user_relationships.following_id = social_posts.user_id 
        AND user_relationships.status = 'accepted'
      )
    )
  )
);

CREATE POLICY "Users can update their own comments" 
ON public.post_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.post_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, -- recipient
  actor_id UUID NOT NULL, -- who performed the action
  type TEXT NOT NULL, -- 'comment', 'reaction', 'mention', etc.
  entity_type TEXT NOT NULL, -- 'post', 'comment'
  entity_id UUID NOT NULL, -- post_id or comment_id
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create notifications for others" 
ON public.notifications 
FOR INSERT 
WITH CHECK (auth.uid() = actor_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
ON public.notifications 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updating comments timestamp
CREATE TRIGGER update_post_comments_updated_at
BEFORE UPDATE ON public.post_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX idx_post_comments_parent_id ON public.post_comments(parent_comment_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read);

-- Extend reaction types (post_reactions table already exists)
-- Add more reaction types by updating the existing table if needed
-- The current table already supports different reaction_type values