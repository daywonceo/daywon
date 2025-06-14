
-- Create table for user habits
CREATE TABLE public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- can be 'active' or 'archived'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add an index on user_id for faster lookups of habits
CREATE INDEX idx_habits_user_id ON public.habits(user_id);

-- Enable Row Level Security to ensure users can only access their own habits
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to view, create, update, and delete their own habits
CREATE POLICY "Users can manage their own habits" ON public.habits
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
