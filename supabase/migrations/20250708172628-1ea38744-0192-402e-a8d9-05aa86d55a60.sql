-- Add onboarding-related columns to profiles table
ALTER TABLE public.profiles ADD COLUMN focus_areas TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN reminder_opt_in BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN reminder_time TIME DEFAULT '09:00:00';
ALTER TABLE public.profiles ADD COLUMN user_intent TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN onboarding_complete BOOLEAN DEFAULT false;