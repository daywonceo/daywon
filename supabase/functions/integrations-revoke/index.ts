import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider } = await req.json();

    if (!provider || !['todoist', 'strava'].includes(provider)) {
      return new Response(
        JSON.stringify({ error: 'Invalid provider. Must be todoist or strava.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the JWT and get user
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseServiceKey,
      },
    });

    if (!userResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const user = await userResponse.json();
    const userId = user.id;

    // Get the integration
    const { data: integration, error: fetchError } = await supabase
      .from('user_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('integration_type', provider)
      .single();

    if (fetchError || !integration) {
      return new Response(
        JSON.stringify({ error: 'Integration not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Revoke] Revoking ${provider} for user ${userId}`);

    // Revoke at provider
    try {
      if (provider === 'todoist') {
        // Todoist revocation
        if (integration.access_token) {
          const revokeResponse = await fetch('https://api.todoist.com/sync/v9/access_tokens/revoke', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${integration.access_token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!revokeResponse.ok) {
            console.warn('[Revoke] Todoist revocation failed (may already be revoked)');
          } else {
            console.log('[Revoke] Todoist token revoked at provider');
          }
        }
      } else if (provider === 'strava') {
        // Strava deauthorization
        if (integration.access_token) {
          const revokeResponse = await fetch('https://www.strava.com/oauth/deauthorize', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${integration.access_token}`,
            },
          });

          if (!revokeResponse.ok) {
            console.warn('[Revoke] Strava deauthorization failed (may already be revoked)');
          } else {
            console.log('[Revoke] Strava access revoked at provider');
          }
        }
      }
    } catch (error) {
      console.warn('[Revoke] Provider revocation error (continuing):', error.message);
      // Continue even if provider revocation fails - we still want to clean up locally
    }

    // Update local database - null out tokens and set status
    const { error: updateError } = await supabase
      .from('user_integrations')
      .update({
        access_token: null,
        refresh_token: null,
        expires_at: null,
        integration_status: 'revoked',
        is_connected: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', integration.id);

    if (updateError) {
      throw updateError;
    }

    console.log(`[Revoke] Integration ${provider} revoked successfully`);

    return new Response(
      JSON.stringify({ success: true, message: 'Integration revoked successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Revoke] Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
