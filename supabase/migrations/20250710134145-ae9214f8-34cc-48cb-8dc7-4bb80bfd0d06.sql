-- Create table for storing habit activities/completions
CREATE TABLE public.habit_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  habit_name TEXT NOT NULL,
  activity_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completed', 'failed', 'empty')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, habit_name, activity_date)
);

-- Enable Row Level Security
ALTER TABLE public.habit_activities ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own habit activities" 
ON public.habit_activities 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own habit activities" 
ON public.habit_activities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habit activities" 
ON public.habit_activities 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habit activities" 
ON public.habit_activities 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_habit_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_habit_activities_updated_at
BEFORE UPDATE ON public.habit_activities
FOR EACH ROW
EXECUTE FUNCTION public.update_habit_activities_updated_at();