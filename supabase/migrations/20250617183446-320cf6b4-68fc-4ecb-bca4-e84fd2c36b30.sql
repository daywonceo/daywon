
-- Create workout plans table
CREATE TABLE public.workout_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  plan_type TEXT NOT NULL, -- 'push_pull_legs', 'upper_lower', 'full_body', 'chest_back_shoulders_arms_legs'
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workout sessions table
CREATE TABLE public.workout_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  workout_plan_id UUID REFERENCES public.workout_plans(id),
  workout_date DATE NOT NULL,
  workout_type TEXT NOT NULL, -- 'push', 'pull', 'legs', 'upper', 'lower', 'full_body', etc.
  duration_minutes INTEGER,
  is_completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exercise logs table for tracking weight and reps
CREATE TABLE public.exercise_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  workout_session_id UUID REFERENCES public.workout_sessions(id),
  exercise_name TEXT NOT NULL,
  muscle_group TEXT,
  equipment TEXT,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight_lbs DECIMAL(5,2),
  difficulty TEXT, -- 'beginner', 'intermediate', 'expert'
  exercise_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user progress tracking table
CREATE TABLE public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  exercise_name TEXT NOT NULL,
  current_weight_lbs DECIMAL(5,2),
  previous_weight_lbs DECIMAL(5,2),
  weight_increase_percent DECIMAL(5,2),
  last_increase_date DATE,
  total_sessions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, exercise_name)
);

-- Enable RLS on all tables
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for workout_plans
CREATE POLICY "Users can view their own workout plans" 
  ON public.workout_plans 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workout plans" 
  ON public.workout_plans 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout plans" 
  ON public.workout_plans 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout plans" 
  ON public.workout_plans 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for workout_sessions
CREATE POLICY "Users can view their own workout sessions" 
  ON public.workout_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workout sessions" 
  ON public.workout_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout sessions" 
  ON public.workout_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout sessions" 
  ON public.workout_sessions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for exercise_logs
CREATE POLICY "Users can view their own exercise logs" 
  ON public.exercise_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exercise logs" 
  ON public.exercise_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercise logs" 
  ON public.exercise_logs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercise logs" 
  ON public.exercise_logs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for user_progress
CREATE POLICY "Users can view their own progress" 
  ON public.user_progress 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress records" 
  ON public.user_progress 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress records" 
  ON public.user_progress 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress records" 
  ON public.user_progress 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to update user progress automatically
CREATE OR REPLACE FUNCTION update_user_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update progress tracking
  INSERT INTO public.user_progress (
    user_id, 
    exercise_name, 
    current_weight_lbs, 
    previous_weight_lbs,
    total_sessions,
    updated_at
  )
  VALUES (
    NEW.user_id,
    NEW.exercise_name,
    NEW.weight_lbs,
    (SELECT current_weight_lbs FROM public.user_progress WHERE user_id = NEW.user_id AND exercise_name = NEW.exercise_name),
    1,
    now()
  )
  ON CONFLICT (user_id, exercise_name) 
  DO UPDATE SET
    previous_weight_lbs = user_progress.current_weight_lbs,
    current_weight_lbs = NEW.weight_lbs,
    total_sessions = user_progress.total_sessions + 1,
    weight_increase_percent = CASE 
      WHEN user_progress.current_weight_lbs > 0 
      THEN ((NEW.weight_lbs - user_progress.current_weight_lbs) / user_progress.current_weight_lbs) * 100
      ELSE 0
    END,
    last_increase_date = CASE 
      WHEN NEW.weight_lbs > user_progress.current_weight_lbs 
      THEN CURRENT_DATE
      ELSE user_progress.last_increase_date
    END,
    updated_at = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update progress when exercise logs are created
CREATE TRIGGER update_progress_trigger
  AFTER INSERT ON public.exercise_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_user_progress();
