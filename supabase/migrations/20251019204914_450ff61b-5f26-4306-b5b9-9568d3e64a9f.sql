-- Create exercise_library table for local exercise storage
CREATE TABLE IF NOT EXISTS public.exercise_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  equipment TEXT,
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  exercise_type TEXT NOT NULL DEFAULT 'strength',
  instructions TEXT,
  video_url TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_exercise_muscle ON public.exercise_library(muscle_group);
CREATE INDEX IF NOT EXISTS idx_exercise_difficulty ON public.exercise_library(difficulty);
CREATE INDEX IF NOT EXISTS idx_exercise_type ON public.exercise_library(exercise_type);
CREATE INDEX IF NOT EXISTS idx_exercise_name ON public.exercise_library(name);

-- Enable RLS
ALTER TABLE public.exercise_library ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read exercises
CREATE POLICY "Anyone can view exercises" ON public.exercise_library
  FOR SELECT USING (true);

-- Add timer sync fields to workout_sessions
ALTER TABLE public.workout_sessions 
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS total_pause_duration_seconds INTEGER DEFAULT 0;

-- Create index for efficient date range queries on workout_sessions
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date ON public.workout_sessions(user_id, workout_date DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_completed ON public.workout_sessions(user_id, is_completed, workout_date DESC);

-- Seed initial exercise data with common exercises
INSERT INTO public.exercise_library (name, muscle_group, equipment, difficulty, exercise_type, instructions) VALUES
  ('Bench Press', 'chest', 'barbell', 'intermediate', 'strength', 'Lie on bench, lower bar to chest, press up'),
  ('Squat', 'legs', 'barbell', 'intermediate', 'strength', 'Stand with bar on shoulders, lower hips, stand back up'),
  ('Deadlift', 'back', 'barbell', 'intermediate', 'strength', 'Lift bar from ground to standing position'),
  ('Overhead Press', 'shoulders', 'barbell', 'intermediate', 'strength', 'Press bar overhead from shoulders'),
  ('Barbell Row', 'back', 'barbell', 'intermediate', 'strength', 'Bend over, pull bar to lower chest'),
  ('Pull-ups', 'back', 'body_only', 'intermediate', 'strength', 'Hang from bar, pull chin over bar'),
  ('Push-ups', 'chest', 'body_only', 'beginner', 'strength', 'Lower body to ground, push back up'),
  ('Dumbbell Curl', 'biceps', 'dumbbell', 'beginner', 'strength', 'Curl dumbbells from sides to shoulders'),
  ('Tricep Dips', 'triceps', 'body_only', 'intermediate', 'strength', 'Lower body between parallel bars, push up'),
  ('Leg Press', 'legs', 'machine', 'beginner', 'strength', 'Push platform away with legs'),
  ('Lunges', 'legs', 'body_only', 'beginner', 'strength', 'Step forward, lower back knee, return to start'),
  ('Plank', 'core', 'body_only', 'beginner', 'strength', 'Hold body straight on forearms and toes'),
  ('Lat Pulldown', 'back', 'cable', 'beginner', 'strength', 'Pull bar down to chest while seated'),
  ('Leg Curl', 'legs', 'machine', 'beginner', 'strength', 'Curl legs up while lying face down'),
  ('Shoulder Shrugs', 'traps', 'dumbbell', 'beginner', 'strength', 'Lift shoulders toward ears with weights'),
  ('Cable Crossover', 'chest', 'cable', 'intermediate', 'strength', 'Cross cables in front of chest'),
  ('Face Pulls', 'shoulders', 'cable', 'beginner', 'strength', 'Pull rope toward face, spreading handles'),
  ('Romanian Deadlift', 'hamstrings', 'barbell', 'intermediate', 'strength', 'Lower bar to shins keeping legs straight'),
  ('Incline Bench Press', 'chest', 'barbell', 'intermediate', 'strength', 'Press on inclined bench'),
  ('Dumbbell Flyes', 'chest', 'dumbbell', 'beginner', 'strength', 'Lower dumbbells out to sides, bring back together'),
  ('Hammer Curls', 'biceps', 'dumbbell', 'beginner', 'strength', 'Curl with palms facing each other'),
  ('Skull Crushers', 'triceps', 'barbell', 'intermediate', 'strength', 'Lower bar to forehead, extend arms'),
  ('Calf Raises', 'calves', 'body_only', 'beginner', 'strength', 'Rise up on toes, lower back down'),
  ('Mountain Climbers', 'core', 'body_only', 'beginner', 'cardio', 'Alternate bringing knees to chest in plank'),
  ('Burpees', 'full_body', 'body_only', 'intermediate', 'cardio', 'Drop to plank, push up, jump up'),
  ('Jumping Jacks', 'full_body', 'body_only', 'beginner', 'cardio', 'Jump while spreading arms and legs'),
  ('Box Jumps', 'legs', 'other', 'intermediate', 'plyometrics', 'Jump onto elevated platform'),
  ('Kettlebell Swings', 'full_body', 'kettlebells', 'intermediate', 'strength', 'Swing kettlebell between legs and up'),
  ('Turkish Get-up', 'core', 'kettlebells', 'advanced', 'strength', 'Stand up from lying while holding weight'),
  ('Farmer Walk', 'full_body', 'dumbbell', 'beginner', 'strength', 'Walk while carrying heavy weights')
ON CONFLICT DO NOTHING;