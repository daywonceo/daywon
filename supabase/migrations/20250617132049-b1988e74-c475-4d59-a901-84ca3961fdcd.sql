
-- Create storage bucket for habit photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('habit-photos', 'habit-photos', false);

-- Create table to track habit photos
CREATE TABLE public.habit_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_name TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  activity_date DATE NOT NULL,
  caption TEXT,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies for habit photos
ALTER TABLE public.habit_photos ENABLE ROW LEVEL SECURITY;

-- Users can view their own photos
CREATE POLICY "Users can view their own habit photos" 
  ON public.habit_photos 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own photos
CREATE POLICY "Users can insert their own habit photos" 
  ON public.habit_photos 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own photos
CREATE POLICY "Users can update their own habit photos" 
  ON public.habit_photos 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own photos
CREATE POLICY "Users can delete their own habit photos" 
  ON public.habit_photos 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Storage policies for habit photos bucket
CREATE POLICY "Users can upload their own habit photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'habit-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own habit photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'habit-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own habit photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'habit-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own habit photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'habit-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
