-- Create table for storing user integration settings and tokens
CREATE TABLE public.user_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  integration_type TEXT NOT NULL,
  is_connected BOOLEAN NOT NULL DEFAULT false,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  integration_settings JSONB DEFAULT '{}',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, integration_type)
);

-- Enable RLS
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own integrations"
ON public.user_integrations
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create table for storing sync logs
CREATE TABLE public.integration_sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  integration_type TEXT NOT NULL,
  sync_type TEXT NOT NULL, -- 'import', 'export', 'bidirectional'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'error'
  records_processed INTEGER DEFAULT 0,
  error_message TEXT,
  sync_details JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for sync logs
ALTER TABLE public.integration_sync_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for sync logs
CREATE POLICY "Users can view their own sync logs"
ON public.integration_sync_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can manage sync logs"
ON public.integration_sync_logs
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update sync logs"
ON public.integration_sync_logs
FOR UPDATE
USING (true);

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.update_integration_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_integrations_updated_at
  BEFORE UPDATE ON public.user_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_integration_updated_at();