-- Enhanced username validation with strict rules and policies

-- Create enhanced username validation function with all rules
CREATE OR REPLACE FUNCTION validate_username_enhanced(username_input TEXT, user_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  clean_username TEXT;
  reserved_usernames TEXT[] := ARRAY[
    'admin', 'support', 'help', 'api', 'terms', 'privacy', 
    'daywon', 'day_won', 'daywon_official', 'official', 'system',
    'root', 'moderator', 'mod', 'staff', 'service', 'bot',
    'account', 'accounts', 'profile', 'user', 'users'
  ];
  profanity_words TEXT[] := ARRAY[
    'fuck', 'shit', 'damn', 'bitch', 'ass', 'hell', 'crap',
    'piss', 'fag', 'gay', 'lesbian', 'homo', 'retard', 'stupid',
    'idiot', 'moron', 'dumb', 'hate', 'kill', 'die', 'death'
  ];
  word TEXT;
  last_change TIMESTAMPTZ;
BEGIN
  -- Trim and convert to lowercase
  clean_username := LOWER(TRIM(username_input));
  
  -- Basic length check
  IF LENGTH(clean_username) < 3 OR LENGTH(clean_username) > 30 THEN
    RETURN jsonb_build_object('valid', false, 'error', 'USERNAME_INVALID', 'message', 'Username must be 3-30 characters');
  END IF;
  
  -- Character validation: only a-z, 0-9, dot, underscore
  IF clean_username !~ '^[a-z0-9._]+$' THEN
    RETURN jsonb_build_object('valid', false, 'error', 'USERNAME_INVALID', 'message', 'Username can only contain letters, numbers, dots, and underscores');
  END IF;
  
  -- No leading/trailing dot or underscore
  IF clean_username ~ '^[._]' OR clean_username ~ '[._]$' THEN
    RETURN jsonb_build_object('valid', false, 'error', 'USERNAME_INVALID', 'message', 'Username cannot start or end with dots or underscores');
  END IF;
  
  -- No consecutive dots or underscores
  IF clean_username ~ '[._]{2,}' THEN
    RETURN jsonb_build_object('valid', false, 'error', 'USERNAME_INVALID', 'message', 'Username cannot have consecutive dots or underscores');
  END IF;
  
  -- Check reserved usernames
  IF clean_username = ANY(reserved_usernames) THEN
    RETURN jsonb_build_object('valid', false, 'error', 'USERNAME_RESERVED', 'message', 'This username is reserved and cannot be used');
  END IF;
  
  -- Check profanity
  FOREACH word IN ARRAY profanity_words LOOP
    IF clean_username LIKE '%' || word || '%' THEN
      RETURN jsonb_build_object('valid', false, 'error', 'USERNAME_PROFANE', 'message', 'Username contains inappropriate content');
    END IF;
  END LOOP;
  
  -- Check if username is taken by another user
  IF EXISTS (SELECT 1 FROM public.profiles WHERE LOWER(username) = clean_username AND (user_id IS NULL OR id != user_id)) THEN
    RETURN jsonb_build_object('valid', false, 'error', 'USERNAME_TAKEN', 'message', 'This username is already taken');
  END IF;
  
  -- If user_id provided, check rate limiting (30 days between changes)
  IF user_id IS NOT NULL THEN
    SELECT name_changed_at INTO last_change 
    FROM public.profiles 
    WHERE id = user_id;
    
    IF last_change IS NOT NULL AND last_change > NOW() - INTERVAL '30 days' THEN
      RETURN jsonb_build_object(
        'valid', false, 
        'error', 'USERNAME_RATE_LIMIT', 
        'message', 'You can only change your username once every 30 days',
        'next_allowed', last_change + INTERVAL '30 days'
      );
    END IF;
    
    -- Check username history quarantine (90 days)
    IF EXISTS (
      SELECT 1 FROM public.profiles p,
      jsonb_array_elements(COALESCE(p.username_history, '[]'::jsonb)) AS hist
      WHERE p.id = user_id 
      AND hist->>'username' = clean_username
      AND (hist->>'changed_at')::timestamptz > NOW() - INTERVAL '90 days'
    ) THEN
      RETURN jsonb_build_object('valid', false, 'error', 'USERNAME_TAKEN', 'message', 'This username was recently used and is temporarily unavailable');
    END IF;
  END IF;
  
  RETURN jsonb_build_object('valid', true, 'username', clean_username);
END;
$$;

-- Enhanced username update function with all policies
CREATE OR REPLACE FUNCTION update_username_enhanced(user_id UUID, new_username TEXT)
RETURNS JSONB
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  validation_result JSONB;
  old_username TEXT;
  current_history JSONB;
BEGIN
  -- Validate the new username
  validation_result := validate_username_enhanced(new_username, user_id);
  
  -- Return validation error if invalid
  IF NOT (validation_result->>'valid')::boolean THEN
    RETURN validation_result;
  END IF;
  
  -- Get current username and history
  SELECT username, COALESCE(username_history, '[]'::jsonb) 
  INTO old_username, current_history
  FROM public.profiles 
  WHERE id = user_id;
  
  -- Don't update if username is the same
  IF LOWER(old_username) = LOWER(validation_result->>'username') THEN
    RETURN jsonb_build_object('success', true, 'message', 'Username unchanged');
  END IF;
  
  -- Update username and add old one to history
  UPDATE public.profiles 
  SET 
    username = validation_result->>'username',
    username_history = current_history || jsonb_build_array(jsonb_build_object(
      'username', old_username,
      'changed_at', NOW()
    )),
    name_changed_at = NOW()
  WHERE id = user_id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Username updated successfully',
    'new_username', validation_result->>'username'
  );
END;
$$;

-- Helper function to check username availability (for real-time checking)
CREATE OR REPLACE FUNCTION check_username_availability(username_input TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN validate_username_enhanced(username_input, NULL);
END;
$$;