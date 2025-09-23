-- Make migration idempotent - safe to re-run
-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add name_changed_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'name_changed_at') THEN
    ALTER TABLE public.profiles ADD COLUMN name_changed_at TIMESTAMPTZ;
  END IF;
  
  -- Add username_history column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username_history') THEN
    ALTER TABLE public.profiles ADD COLUMN username_history JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Create function to generate unique username from text input
CREATE OR REPLACE FUNCTION generate_unique_username(base_text TEXT)
RETURNS TEXT AS $$
DECLARE
  clean_base TEXT;
  candidate TEXT;
  counter INTEGER := 0;
BEGIN
  -- Clean and normalize the base text
  clean_base := LOWER(REGEXP_REPLACE(COALESCE(base_text, 'user'), '[^a-zA-Z0-9]', '', 'g'));
  
  -- Ensure it's not empty and has reasonable length
  IF LENGTH(clean_base) < 3 THEN
    clean_base := 'user' || clean_base;
  END IF;
  
  -- Truncate to max 26 chars to leave room for numbers
  clean_base := LEFT(clean_base, 26);
  
  -- Try the base username first
  candidate := clean_base;
  
  -- If taken, try with random numbers
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE LOWER(username) = LOWER(candidate)) LOOP
    counter := counter + 1;
    candidate := clean_base || LPAD((RANDOM() * 9999)::INTEGER::TEXT, 4, '0');
    
    -- Safety valve to prevent infinite loop
    IF counter > 100 THEN
      candidate := clean_base || EXTRACT(EPOCH FROM NOW())::INTEGER::TEXT;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN candidate;
END;
$$ LANGUAGE plpgsql;

-- Backfill usernames for users who don't have them
UPDATE public.profiles 
SET username = generate_unique_username(
  COALESCE(
    display_name,
    SPLIT_PART(email, '@', 1),
    'user'
  )
)
WHERE username IS NULL OR username = '';

-- Ensure display_name is set from any existing name data
UPDATE public.profiles 
SET display_name = COALESCE(display_name, SPLIT_PART(email, '@', 1), 'User')
WHERE display_name IS NULL OR display_name = '';

-- Now make username NOT NULL since we've backfilled all data
ALTER TABLE public.profiles ALTER COLUMN username SET NOT NULL;

-- Create unique case-insensitive index on username if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'profiles' AND indexname = 'profiles_username_unique_idx') THEN
    CREATE UNIQUE INDEX profiles_username_unique_idx ON public.profiles (LOWER(username));
  END IF;
END $$;

-- Create helper function to validate username format
CREATE OR REPLACE FUNCTION validate_username_format(username_input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if username matches pattern: ^[a-z0-9](?:[a-z0-9._]{1,28}[a-z0-9])?$
  -- Length 3-30, starts/ends with alphanumeric, middle can have dots/underscores
  RETURN username_input ~ '^[a-z0-9](?:[a-z0-9._]{1,28}[a-z0-9])?$' AND LENGTH(username_input) BETWEEN 3 AND 30;
END;
$$ LANGUAGE plpgsql;

-- Create function to update username with history tracking
CREATE OR REPLACE FUNCTION update_username_with_history(user_id UUID, new_username TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  old_username TEXT;
  current_history JSONB;
BEGIN
  -- Get current username and history
  SELECT username, COALESCE(username_history, '[]'::jsonb) 
  INTO old_username, current_history
  FROM public.profiles 
  WHERE id = user_id;
  
  -- Validate new username format
  IF NOT validate_username_format(new_username) THEN
    RAISE EXCEPTION 'Invalid username format';
  END IF;
  
  -- Check if username is taken by another user
  IF EXISTS (SELECT 1 FROM public.profiles WHERE LOWER(username) = LOWER(new_username) AND id != user_id) THEN
    RAISE EXCEPTION 'Username already taken';
  END IF;
  
  -- Update username and add old one to history
  UPDATE public.profiles 
  SET 
    username = new_username,
    username_history = current_history || jsonb_build_array(jsonb_build_object(
      'username', old_username,
      'changed_at', NOW()
    )),
    name_changed_at = NOW()
  WHERE id = user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean up the temporary function
DROP FUNCTION IF EXISTS generate_unique_username(TEXT);