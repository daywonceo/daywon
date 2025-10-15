-- Make username nullable to allow OAuth signups
ALTER TABLE profiles ALTER COLUMN username DROP NOT NULL;

-- Create a function to generate username from email if not provided
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
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate username on insert
DROP TRIGGER IF EXISTS ensure_username_on_insert ON profiles;
CREATE TRIGGER ensure_username_on_insert
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_username_from_email();