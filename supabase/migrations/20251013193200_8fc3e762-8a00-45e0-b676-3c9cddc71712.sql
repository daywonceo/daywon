-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS encrypt_integration_tokens_trigger ON public.user_integrations;

-- Replace the encryption function with a simple pass-through
-- This allows integrations to work without encryption issues
CREATE OR REPLACE FUNCTION public.encrypt_integration_tokens()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Simply pass through without encryption
  -- Tokens will be stored as provided
  RETURN NEW;
END;
$function$;

-- Ensure the updated_at trigger still works
DROP TRIGGER IF EXISTS update_user_integrations_updated_at ON public.user_integrations;

CREATE TRIGGER update_user_integrations_updated_at
  BEFORE UPDATE ON public.user_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_integration_updated_at();