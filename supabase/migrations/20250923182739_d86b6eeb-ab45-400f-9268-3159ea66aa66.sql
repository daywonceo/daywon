-- Create function to search users for mentions and global search
CREATE OR REPLACE FUNCTION search_users_for_mentions(search_query TEXT)
RETURNS TABLE(
  id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.bio
  FROM public.profiles p
  WHERE p.id != auth.uid()
    AND p.username IS NOT NULL
    AND p.display_name IS NOT NULL
    AND (
      LOWER(p.username) LIKE LOWER(search_query) || '%'
      OR LOWER(p.display_name) LIKE LOWER(search_query) || '%'
    )
  ORDER BY 
    -- Prioritize exact username matches first
    CASE WHEN LOWER(p.username) = LOWER(search_query) THEN 1 ELSE 2 END,
    -- Then exact display name matches
    CASE WHEN LOWER(p.display_name) = LOWER(search_query) THEN 1 ELSE 2 END,
    -- Then username prefix matches
    CASE WHEN LOWER(p.username) LIKE LOWER(search_query) || '%' THEN 1 ELSE 2 END,
    -- Finally display name prefix matches
    CASE WHEN LOWER(p.display_name) LIKE LOWER(search_query) || '%' THEN 1 ELSE 2 END,
    p.display_name
  LIMIT 10;
END;
$$;