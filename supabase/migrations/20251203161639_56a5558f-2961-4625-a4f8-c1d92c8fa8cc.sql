-- Fix the SECURITY DEFINER view issue by dropping and recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.user_integrations_safe;

-- Recreate without SECURITY DEFINER (default is SECURITY INVOKER which is safer)
CREATE VIEW public.user_integrations_safe 
WITH (security_invoker = true)
AS
SELECT 
  id,
  user_id,
  integration_type,
  integration_status,
  is_connected,
  connected_at,
  last_sync_at,
  last_synced_at,
  provider_user_id,
  integration_scopes,
  integration_settings,
  ignore_before,
  token_expires_at,
  created_at,
  updated_at
FROM public.user_integrations;

-- Grant access to the view
GRANT SELECT ON public.user_integrations_safe TO authenticated;

COMMENT ON VIEW public.user_integrations_safe IS 'Safe view of user_integrations that excludes sensitive token columns. RLS on the underlying table controls access.';