-- Update the username validation function to include suggestion generation
CREATE OR REPLACE FUNCTION check_username_availability(username_input text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  validation_result JSONB;
  base_username TEXT;
  suggestions TEXT[] := ARRAY[]::TEXT[];
  suggestion TEXT;
  current_year TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
  city_codes TEXT[] := ARRAY['nyc', 'la', 'chi', 'mia', 'sf', 'bos', 'dc', 'atl'];
  i INTEGER;
BEGIN
  -- First validate the username
  validation_result := validate_username_enhanced(username_input, NULL);
  
  -- If username is valid and available, return success
  IF (validation_result->>'valid')::boolean THEN
    RETURN validation_result;
  END IF;
  
  -- If username is taken, generate suggestions
  IF validation_result->>'error' = 'USERNAME_TAKEN' THEN
    -- Create base username from input (limit to 12 chars, clean it)
    base_username := LOWER(TRIM(username_input));
    base_username := REGEXP_REPLACE(base_username, '[^a-z0-9]', '', 'g');
    base_username := LEFT(base_username, 12);
    
    -- If base is too short after cleaning, skip suggestions
    IF LENGTH(base_username) < 3 THEN
      RETURN validation_result;
    END IF;
    
    -- Generate pattern 1: {base}{number} (2-digit random numbers)
    FOR i IN 1..3 LOOP
      suggestion := base_username || (10 + FLOOR(RANDOM() * 90))::TEXT;
      IF LENGTH(suggestion) <= 30 AND NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE LOWER(username) = suggestion
      ) THEN
        suggestions := array_append(suggestions, suggestion);
      END IF;
    END LOOP;
    
    -- Generate pattern 2: {base}.{number}
    IF array_length(suggestions, 1) < 5 THEN
      FOR i IN 1..2 LOOP
        suggestion := base_username || '.' || (10 + FLOOR(RANDOM() * 90))::TEXT;
        IF LENGTH(suggestion) <= 30 AND NOT EXISTS (
          SELECT 1 FROM public.profiles WHERE LOWER(username) = suggestion
        ) THEN
          suggestions := array_append(suggestions, suggestion);
        END IF;
      END LOOP;
    END IF;
    
    -- Generate pattern 3: {base}_app
    IF array_length(suggestions, 1) < 5 THEN
      suggestion := base_username || '_app';
      IF LENGTH(suggestion) <= 30 AND NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE LOWER(username) = suggestion
      ) THEN
        suggestions := array_append(suggestions, suggestion);
      END IF;
    END IF;
    
    -- Generate pattern 4: {base}{yy} (last 2 digits of current year)
    IF array_length(suggestions, 1) < 5 THEN
      suggestion := base_username || RIGHT(current_year, 2);
      IF LENGTH(suggestion) <= 30 AND NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE LOWER(username) = suggestion
      ) THEN
        suggestions := array_append(suggestions, suggestion);
      END IF;
    END IF;
    
    -- Generate pattern 5: {base}{city-code}
    IF array_length(suggestions, 1) < 5 THEN
      FOR i IN 1..array_length(city_codes, 1) LOOP
        suggestion := base_username || city_codes[i];
        IF LENGTH(suggestion) <= 30 AND NOT EXISTS (
          SELECT 1 FROM public.profiles WHERE LOWER(username) = suggestion
        ) THEN
          suggestions := array_append(suggestions, suggestion);
          EXIT WHEN array_length(suggestions, 1) >= 5;
        END IF;
      END LOOP;
    END IF;
    
    -- Add suggestions to the result
    IF array_length(suggestions, 1) > 0 THEN
      validation_result := validation_result || jsonb_build_object('suggestions', suggestions);
    END IF;
  END IF;
  
  RETURN validation_result;
END;
$$;