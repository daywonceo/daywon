-- Create challenge comments table
CREATE TABLE public.challenge_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL,
  user_id UUID NOT NULL,
  parent_comment_id UUID NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_edited BOOLEAN DEFAULT false
);

-- Create challenge reactions table
CREATE TABLE public.challenge_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL DEFAULT 'like',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id, reaction_type)
);

-- Enable RLS on challenge comments
ALTER TABLE public.challenge_comments ENABLE ROW LEVEL SECURITY;

-- Enable RLS on challenge reactions  
ALTER TABLE public.challenge_reactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for challenge comments
CREATE POLICY "Users can view comments on challenges they participate in"
ON public.challenge_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.challenge_participants
    WHERE challenge_participants.challenge_id = challenge_comments.challenge_id
    AND challenge_participants.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.challenges
    WHERE challenges.id = challenge_comments.challenge_id
    AND challenges.creator_id = auth.uid()
  )
);

CREATE POLICY "Participants can create comments"
ON public.challenge_comments
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    EXISTS (
      SELECT 1 FROM public.challenge_participants
      WHERE challenge_participants.challenge_id = challenge_comments.challenge_id
      AND challenge_participants.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.challenges
      WHERE challenges.id = challenge_comments.challenge_id
      AND challenges.creator_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update their own comments"
ON public.challenge_comments
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.challenge_comments
FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for challenge reactions
CREATE POLICY "Users can view reactions on challenges they participate in"
ON public.challenge_reactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.challenge_participants
    WHERE challenge_participants.challenge_id = challenge_reactions.challenge_id
    AND challenge_participants.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.challenges
    WHERE challenges.id = challenge_reactions.challenge_id
    AND challenges.creator_id = auth.uid()
  )
);

CREATE POLICY "Participants can create reactions"
ON public.challenge_reactions
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    EXISTS (
      SELECT 1 FROM public.challenge_participants
      WHERE challenge_participants.challenge_id = challenge_reactions.challenge_id
      AND challenge_participants.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.challenges
      WHERE challenges.id = challenge_reactions.challenge_id
      AND challenges.creator_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can delete their own reactions"
ON public.challenge_reactions
FOR DELETE
USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_challenge_comments_updated_at
  BEFORE UPDATE ON public.challenge_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add realtime for live updates
ALTER TABLE public.challenge_comments REPLICA IDENTITY FULL;
ALTER TABLE public.challenge_reactions REPLICA IDENTITY FULL;
ALTER TABLE public.challenge_chat REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_chat;