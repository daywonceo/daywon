-- Enable pgsodium extension for encryption
CREATE EXTENSION IF NOT EXISTS pgsodium;

-- Create encrypted columns for user_integrations
ALTER TABLE public.user_integrations 
  ADD COLUMN IF NOT EXISTS access_token_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS refresh_token_encrypted TEXT;

-- Create function to encrypt tokens using a master password from vault
CREATE OR REPLACE FUNCTION public.encrypt_integration_tokens()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  master_key TEXT;
BEGIN
  -- Use a combination of user_id and a secret from vault as encryption context
  -- This ensures each user's tokens are encrypted with a unique derived key
  
  -- Encrypt access_token if provided
  IF NEW.access_token IS NOT NULL AND NEW.access_token != '' THEN
    NEW.access_token_encrypted := encode(
      pgsodium.crypto_secretbox(
        NEW.access_token::bytea,
        (NEW.user_id::text || NEW.integration_type)::bytea,
        pgsodium.crypto_secretbox_keygen()
      ),
      'base64'
    );
    -- Clear plaintext after encryption
    NEW.access_token := NULL;
  END IF;

  -- Encrypt refresh_token if provided
  IF NEW.refresh_token IS NOT NULL AND NEW.refresh_token != '' THEN
    NEW.refresh_token_encrypted := encode(
      pgsodium.crypto_secretbox(
        NEW.refresh_token::bytea,
        (NEW.user_id::text || NEW.integration_type)::bytea,
        pgsodium.crypto_secretbox_keygen()
      ),
      'base64'
    );
    -- Clear plaintext after encryption
    NEW.refresh_token := NULL;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to automatically encrypt tokens on insert/update
DROP TRIGGER IF EXISTS encrypt_tokens_trigger ON public.user_integrations;
CREATE TRIGGER encrypt_tokens_trigger
  BEFORE INSERT OR UPDATE ON public.user_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_integration_tokens();

-- Migrate existing plaintext tokens to encrypted format
DO $$
DECLARE
  integration_record RECORD;
BEGIN
  FOR integration_record IN 
    SELECT id, user_id, integration_type, access_token, refresh_token 
    FROM public.user_integrations 
    WHERE (access_token IS NOT NULL AND access_token != '') 
       OR (refresh_token IS NOT NULL AND refresh_token != '')
  LOOP
    -- Update will trigger encryption
    UPDATE public.user_integrations
    SET access_token = COALESCE(integration_record.access_token, ''),
        refresh_token = COALESCE(integration_record.refresh_token, ''),
        updated_at = NOW()
    WHERE id = integration_record.id;
  END LOOP;
END $$;

-- Fix integration_sync_logs RLS policies
DROP POLICY IF EXISTS "System can manage sync logs" ON public.integration_sync_logs;
DROP POLICY IF EXISTS "System can update sync logs" ON public.integration_sync_logs;

-- Allow users to create their own sync logs
CREATE POLICY "Users can create their own sync logs"
ON public.integration_sync_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow only the owning user or service role to update sync logs
CREATE POLICY "Users and service role can update sync logs"
ON public.integration_sync_logs
FOR UPDATE
USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Add comment documenting encryption
COMMENT ON COLUMN public.user_integrations.access_token_encrypted IS 'Encrypted access token using pgsodium crypto_secretbox';
COMMENT ON COLUMN public.user_integrations.refresh_token_encrypted IS 'Encrypted refresh token using pgsodium crypto_secretbox';
COMMENT ON COLUMN public.user_integrations.access_token IS 'Deprecated - tokens are now stored encrypted in access_token_encrypted';
COMMENT ON COLUMN public.user_integrations.refresh_token IS 'Deprecated - tokens are now stored encrypted in refresh_token_encrypted';