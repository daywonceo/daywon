-- Fix search path for the generate_username_from_email function
CREATE OR REPLACE FUNCTION generate_username_from_email()
RETURNS TRIGGER AS $$
BEGIN
  -- If username is null, generate it from email
  IF NEW.username IS NULL THEN
    -- Extract the part before @ and make it unique by adding random numbers if needed
    NEW.username := LOWER(SPLIT_PART(NEW.email, '@', 1)) || '_' || FLOOR(RANDOM() * 10000)::TEXT;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;