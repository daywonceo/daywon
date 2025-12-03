-- Fix user_integrations security: Create a secure view that excludes sensitive token columns
-- Users should only access their integration data through this view or edge functions

-- First, ensure RLS is enabled
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to recreate them properly
DROP POLICY IF EXISTS "Users can view their own integrations" ON public.user_integrations;
DROP POLICY IF EXISTS "Users can insert their own integrations" ON public.user_integrations;
DROP POLICY IF EXISTS "Users can update their own integrations" ON public.user_integrations;
DROP POLICY IF EXISTS "Users can delete their own integrations" ON public.user_integrations;

-- Create strict RLS policies - users can only access their own data
CREATE POLICY "Users can view their own integrations"
ON public.user_integrations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own integrations"
ON public.user_integrations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations"
ON public.user_integrations
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations"
ON public.user_integrations
FOR DELETE
USING (auth.uid() = user_id);

-- Create a secure view that excludes sensitive token columns for client-side use
CREATE OR REPLACE VIEW public.user_integrations_safe AS
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
FROM public.user_integrations
WHERE auth.uid() = user_id;

-- Grant access to the view
GRANT SELECT ON public.user_integrations_safe TO authenticated;

-- Comment explaining security model
COMMENT ON VIEW public.user_integrations_safe IS 'Safe view of user_integrations that excludes sensitive token columns. Use this view for client-side queries. Token operations should only be done via edge functions with service role.';