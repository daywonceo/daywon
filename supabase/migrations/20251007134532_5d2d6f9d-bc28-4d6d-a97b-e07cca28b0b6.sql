-- Fix the search_path warning for normalize_habit_name
CREATE OR REPLACE FUNCTION public.normalize_habit_name(habit_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized TEXT;
BEGIN
  normalized := LOWER(TRIM(habit_name));
  
  IF normalized ~ 'ies$' AND LENGTH(normalized) > 4 THEN
    normalized := SUBSTRING(normalized FROM 1 FOR LENGTH(normalized) - 3) || 'y';
  ELSIF normalized ~ '(ch|sh|ss|x|z)es$' THEN
    normalized := SUBSTRING(normalized FROM 1 FOR LENGTH(normalized) - 2);
  ELSIF normalized ~ 'ses$' AND LENGTH(normalized) > 4 THEN
    normalized := SUBSTRING(normalized FROM 1 FOR LENGTH(normalized) - 2);
  ELSIF normalized ~ 's$' AND LENGTH(normalized) > 3 THEN
    normalized := SUBSTRING(normalized FROM 1 FOR LENGTH(normalized) - 1);
  END IF;
  
  RETURN normalized;
END;
$$;