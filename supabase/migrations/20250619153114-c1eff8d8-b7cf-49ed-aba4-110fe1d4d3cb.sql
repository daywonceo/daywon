
-- Create table to store user habit scores
CREATE TABLE public.user_habit_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  score_period TEXT NOT NULL, -- 'weekly', 'monthly', 'yearly'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  consistency_rate NUMERIC(5,2) DEFAULT 0,
  streak_score NUMERIC(5,2) DEFAULT 0,
  variety_score NUMERIC(5,2) DEFAULT 0,
  recency_score NUMERIC(5,2) DEFAULT 0,
  total_score NUMERIC(5,2) DEFAULT 0,
  rank_position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, score_period, period_start)
);

-- Create table to store habit difficulty multipliers
CREATE TABLE public.habit_difficulty (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_name TEXT NOT NULL UNIQUE,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('high', 'medium', 'low')),
  multiplier NUMERIC(4,3) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert habit difficulty data
INSERT INTO public.habit_difficulty (habit_name, difficulty_level, multiplier) VALUES
  ('WORKOUT', 'high', 1.25),
  ('No Sugar', 'high', 1.25),
  ('No Social Media Morning', 'high', 1.25),
  ('Meal Prep', 'high', 1.25),
  ('Budget Review', 'high', 1.25),
  ('Journal', 'high', 1.25),
  ('Yoga', 'high', 1.25),
  ('Sleep 8 Hours', 'high', 1.25),
  ('READ', 'medium', 1.0),
  ('DEVOTIONS', 'medium', 1.0),
  ('Focus Work', 'medium', 1.0),
  ('Gratitude Journal', 'medium', 1.0),
  ('Morning Walk', 'medium', 1.0),
  ('Evening Walk', 'medium', 1.0),
  ('Walking After Lunch', 'medium', 1.0),
  ('20-Minute Cleanup', 'medium', 1.0),
  ('Call a Loved One', 'medium', 1.0),
  ('Practice Mindfulness', 'medium', 1.0),
  ('Plan Tomorrow', 'medium', 1.0),
  ('Drink Water', 'low', 0.75),
  ('Take Vitamins', 'low', 0.75),
  ('Stretch', 'low', 0.75),
  ('Go Outside', 'low', 0.75),
  ('Eat Fruits', 'low', 0.75),
  ('Healthy Breakfast', 'low', 0.75),
  ('Skincare Routine', 'low', 0.75),
  ('Declutter Desk', 'low', 0.75),
  ('No Caffeine After 4pm', 'low', 0.75),
  ('Family Time', 'low', 0.75);

-- Enable Row Level Security
ALTER TABLE public.user_habit_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_difficulty ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_habit_scores
CREATE POLICY "Users can view all habit scores for leaderboard" 
  ON public.user_habit_scores 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own habit scores" 
  ON public.user_habit_scores 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habit scores" 
  ON public.user_habit_scores 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for habit_difficulty (read-only for all users)
CREATE POLICY "All users can view habit difficulty" 
  ON public.habit_difficulty 
  FOR SELECT 
  USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_habit_scores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_habit_scores_updated_at
  BEFORE UPDATE ON public.user_habit_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_habit_scores_updated_at();

-- Create indexes for performance
CREATE INDEX idx_user_habit_scores_user_period ON public.user_habit_scores (user_id, score_period, period_start);
CREATE INDEX idx_user_habit_scores_leaderboard ON public.user_habit_scores (score_period, period_start, total_score DESC);
CREATE INDEX idx_habit_difficulty_name ON public.habit_difficulty (habit_name);
