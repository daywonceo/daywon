
-- Create table for saved verses
CREATE TABLE public.saved_verses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  reference TEXT NOT NULL,
  text TEXT NOT NULL,
  translation_name TEXT NOT NULL,
  category TEXT,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for user reflections/journal entries
CREATE TABLE public.user_reflections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  verse_reference TEXT,
  devotion_title TEXT,
  sermon_title TEXT,
  reflection_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for saved sermons
CREATE TABLE public.saved_sermons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  url TEXT,
  description TEXT,
  category TEXT,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for saved devotions
CREATE TABLE public.saved_devotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  verse_reference TEXT,
  category TEXT,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) for all tables
ALTER TABLE public.saved_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_devotions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for saved_verses
CREATE POLICY "Users can view their own saved verses" 
  ON public.saved_verses 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save their own verses" 
  ON public.saved_verses 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved verses" 
  ON public.saved_verses 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for user_reflections
CREATE POLICY "Users can view their own reflections" 
  ON public.user_reflections 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reflections" 
  ON public.user_reflections 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reflections" 
  ON public.user_reflections 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reflections" 
  ON public.user_reflections 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for saved_sermons
CREATE POLICY "Users can view their own saved sermons" 
  ON public.saved_sermons 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save their own sermons" 
  ON public.saved_sermons 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved sermons" 
  ON public.saved_sermons 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for saved_devotions
CREATE POLICY "Users can view their own saved devotions" 
  ON public.saved_devotions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save their own devotions" 
  ON public.saved_devotions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved devotions" 
  ON public.saved_devotions 
  FOR DELETE 
  USING (auth.uid() = user_id);
