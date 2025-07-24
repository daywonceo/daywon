-- Create challenges table
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL, -- 'habit_streak', 'workout_count', 'steps', 'custom'
  target_value INTEGER, -- target number (days, reps, steps, etc.)
  target_unit TEXT, -- 'days', 'workouts', 'steps', etc.
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  max_participants INTEGER DEFAULT NULL, -- NULL = unlimited
  is_team_based BOOLEAN DEFAULT false,
  max_team_size INTEGER DEFAULT 1,
  entry_requirements JSONB DEFAULT '{}', -- skill level, habits, etc.
  prizes JSONB DEFAULT '{}', -- rewards, badges, etc.
  rules TEXT,
  status TEXT DEFAULT 'draft', -- 'draft', 'active', 'completed', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create challenge participants table
CREATE TABLE public.challenge_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  team_id UUID NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_progress INTEGER DEFAULT 0,
  last_progress_update TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'dropped_out'
  UNIQUE(challenge_id, user_id)
);

-- Create challenge teams table
CREATE TABLE public.challenge_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  captain_id UUID NOT NULL,
  current_members INTEGER DEFAULT 1,
  total_progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create challenge chat table
CREATE TABLE public.challenge_chat (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  team_id UUID NULL REFERENCES public.challenge_teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- 'text', 'progress_update', 'system'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_chat ENABLE ROW LEVEL SECURITY;

-- RLS Policies for challenges
CREATE POLICY "Users can view active challenges" 
ON public.challenges 
FOR SELECT 
USING (status = 'active' OR creator_id = auth.uid());

CREATE POLICY "Users can create challenges" 
ON public.challenges 
FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their challenges" 
ON public.challenges 
FOR UPDATE 
USING (auth.uid() = creator_id);

-- RLS Policies for participants
CREATE POLICY "Users can view challenge participants" 
ON public.challenge_participants 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.challenges 
    WHERE challenges.id = challenge_participants.challenge_id 
    AND (challenges.status = 'active' OR challenges.creator_id = auth.uid())
  )
);

CREATE POLICY "Users can join challenges" 
ON public.challenge_participants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" 
ON public.challenge_participants 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for teams
CREATE POLICY "Users can view challenge teams" 
ON public.challenge_teams 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.challenges 
    WHERE challenges.id = challenge_teams.challenge_id 
    AND challenges.status = 'active'
  )
);

CREATE POLICY "Users can create teams for challenges they participate in" 
ON public.challenge_teams 
FOR INSERT 
WITH CHECK (
  auth.uid() = captain_id 
  AND EXISTS (
    SELECT 1 FROM public.challenge_participants 
    WHERE challenge_participants.challenge_id = challenge_teams.challenge_id 
    AND challenge_participants.user_id = auth.uid()
  )
);

-- RLS Policies for chat
CREATE POLICY "Users can view challenge chat they're part of" 
ON public.challenge_chat 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.challenge_participants 
    WHERE challenge_participants.challenge_id = challenge_chat.challenge_id 
    AND challenge_participants.user_id = auth.uid()
  )
  OR (team_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.challenge_participants 
    WHERE challenge_participants.team_id = challenge_chat.team_id 
    AND challenge_participants.user_id = auth.uid()
  ))
);

CREATE POLICY "Participants can send messages" 
ON public.challenge_chat 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.challenge_participants 
    WHERE challenge_participants.challenge_id = challenge_chat.challenge_id 
    AND challenge_participants.user_id = auth.uid()
  )
);

-- Add foreign key for team_id in participants
ALTER TABLE public.challenge_participants 
ADD CONSTRAINT fk_team FOREIGN KEY (team_id) REFERENCES public.challenge_teams(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_challenges_status ON public.challenges(status);
CREATE INDEX idx_challenges_dates ON public.challenges(start_date, end_date);
CREATE INDEX idx_participants_challenge ON public.challenge_participants(challenge_id);
CREATE INDEX idx_participants_user ON public.challenge_participants(user_id);
CREATE INDEX idx_teams_challenge ON public.challenge_teams(challenge_id);
CREATE INDEX idx_chat_challenge ON public.challenge_chat(challenge_id);

-- Create triggers for updated_at
CREATE TRIGGER update_challenges_updated_at
BEFORE UPDATE ON public.challenges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_challenge_teams_updated_at
BEFORE UPDATE ON public.challenge_teams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();