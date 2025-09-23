-- Fix security warnings by adding SET search_path = public to functions

-- Recreate validate_username_format function with security definer and search path
CREATE OR REPLACE FUNCTION validate_username_format(username_input TEXT)
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if username matches pattern: ^[a-z0-9](?:[a-z0-9._]{1,28}[a-z0-9])?$
  -- Length 3-30, starts/ends with alphanumeric, middle can have dots/underscores
  RETURN username_input ~ '^[a-z0-9](?:[a-z0-9._]{1,28}[a-z0-9])?$' AND LENGTH(username_input) BETWEEN 3 AND 30;
END;
$$;

-- Recreate update_username_with_history function with proper search path
CREATE OR REPLACE FUNCTION update_username_with_history(user_id UUID, new_username TEXT)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;