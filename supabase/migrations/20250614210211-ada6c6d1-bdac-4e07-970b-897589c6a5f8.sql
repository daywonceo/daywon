
-- Create table for user top habits, with per-month storage
CREATE TABLE public.user_top_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  month TEXT NOT NULL, -- e.g. "2024-06"
  habits TEXT[] NOT NULL, -- Array of 3 habit names
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Keep only one record per user per month
CREATE UNIQUE INDEX idx_user_month_unique ON public.user_top_habits (user_id, month);

-- Enable Row Level Security
ALTER TABLE public.user_top_habits ENABLE ROW LEVEL SECURITY;

-- RLS Policies so users can only manage their own records
CREATE POLICY "Users can read their own top habits" ON public.user_top_habits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own top habits" ON public.user_top_habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own top habits" ON public.user_top_habits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own top habits" ON public.user_top_habits
  FOR DELETE USING (auth.uid() = user_id);
