-- Add RPE and rest tracking to exercise_logs
ALTER TABLE exercise_logs
ADD COLUMN rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10),
ADD COLUMN rest_seconds INTEGER,
ADD COLUMN notes TEXT;

-- Add workout quality metrics to workout_sessions
ALTER TABLE workout_sessions
ADD COLUMN energy_level TEXT CHECK (energy_level IN ('low', 'medium', 'high')),
ADD COLUMN rpe_overall INTEGER CHECK (rpe_overall >= 1 AND rpe_overall <= 10),
ADD COLUMN workout_quality TEXT CHECK (workout_quality IN ('poor', 'fair', 'good', 'excellent'));

-- Create workout_templates table
CREATE TABLE workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  workout_type TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  estimated_duration_minutes INTEGER,
  exercises JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  times_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on workout_templates
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for workout_templates
CREATE POLICY "Users can view their own templates"
  ON workout_templates FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own templates"
  ON workout_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
  ON workout_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
  ON workout_templates FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_templates_user ON workout_templates(user_id);
CREATE INDEX idx_templates_type ON workout_templates(workout_type);
CREATE INDEX idx_templates_public ON workout_templates(is_public) WHERE is_public = true;

-- Add trigger for updated_at
CREATE TRIGGER update_workout_templates_updated_at
  BEFORE UPDATE ON workout_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();