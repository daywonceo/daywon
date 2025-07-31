-- Add username column with unique constraint to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Add constraint to ensure username format (lowercase, alphanumeric, dots, underscores)
ALTER TABLE public.profiles 
ADD CONSTRAINT username_format_check 
CHECK (username ~ '^[a-z0-9._]+$' AND length(username) >= 3 AND length(username) <= 30);

-- Update the handle_new_user function to include display_name and username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    display_name, 
    username
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'display_name',
    LOWER(NEW.raw_user_meta_data ->> 'username')  -- Enforce lowercase
  );

  RETURN NEW;
END;
$$;