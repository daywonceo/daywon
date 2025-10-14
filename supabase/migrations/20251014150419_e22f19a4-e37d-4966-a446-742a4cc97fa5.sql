-- Manually grant Day Won Member status to the current admin user
-- This is a one-time grant that doesn't use an invite code
UPDATE public.profiles
SET 
  is_day_won_member = true,
  day_won_member_since = NOW()
WHERE email = (
  SELECT email 
  FROM auth.users 
  WHERE id = (
    SELECT user_id 
    FROM public.user_roles 
    WHERE role = 'admin' 
    LIMIT 1
  )
)
AND is_day_won_member = false;