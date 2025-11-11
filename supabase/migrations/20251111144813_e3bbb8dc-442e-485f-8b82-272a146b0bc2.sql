-- Update existing user_integrations table with new columns
ALTER TABLE public.user_integrations 
  ADD COLUMN IF NOT EXISTS provider_user_id TEXT,
  ADD COLUMN IF NOT EXISTS integration_scopes TEXT[],
  ADD COLUMN IF NOT EXISTS integration_status TEXT DEFAULT 'connected',
  ADD COLUMN IF NOT EXISTS connected_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ignore_before TIMESTAMPTZ;

-- Add check constraint for integration_status
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_integrations_status_check'
  ) THEN
    ALTER TABLE public.user_integrations 
      ADD CONSTRAINT user_integrations_status_check 
      CHECK (integration_status IN ('connected', 'needs_reauth', 'revoked'));
  END IF;
END $$;

-- Update ignore_before for existing records to their connected_at or created_at
UPDATE public.user_integrations 
SET ignore_before = COALESCE(connected_at, created_at)
WHERE ignore_before IS NULL;

-- Create integration_rules table
CREATE TABLE IF NOT EXISTS public.integration_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('todoist', 'strava')),
  match_type TEXT NOT NULL CHECK (match_type IN ('title_exact', 'title_contains', 'tag', 'type')),
  match_value TEXT NOT NULL,
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create integration_events table
CREATE TABLE IF NOT EXISTS public.integration_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('todoist', 'strava')),
  external_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  title TEXT,
  tags TEXT[],
  completed_at TIMESTAMPTZ,
  payload JSONB NOT NULL,
  dedupe_hash TEXT NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (dedupe_hash)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_integrations_user_id ON public.user_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_rules_user_id ON public.integration_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_rules_habit_id ON public.integration_rules(habit_id);
CREATE INDEX IF NOT EXISTS idx_integration_events_user_id ON public.integration_events(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_events_processed ON public.integration_events(processed) WHERE processed = false;
CREATE INDEX IF NOT EXISTS idx_integration_events_external_id ON public.integration_events(provider, external_id);

-- Enable RLS on new tables
ALTER TABLE public.integration_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for integration_rules
CREATE POLICY "Users can view their own integration rules"
  ON public.integration_rules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own integration rules"
  ON public.integration_rules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integration rules"
  ON public.integration_rules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integration rules"
  ON public.integration_rules FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for integration_events
CREATE POLICY "Users can view their own integration events"
  ON public.integration_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own integration events"
  ON public.integration_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integration events"
  ON public.integration_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integration events"
  ON public.integration_events FOR DELETE
  USING (auth.uid() = user_id);