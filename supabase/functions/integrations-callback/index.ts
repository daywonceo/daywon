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
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const provider = pathParts[pathParts.length - 1]; // Get provider from path
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    console.log(`[${provider} Callback] Received:`, { code: !!code, state, error });

    if (error) {
      console.error(`[${provider} Callback] OAuth error:`, error);
      const appUrl = Deno.env.get('APP_BASE_URL') || 'https://ncjbvdbkulnekwsjzicq.supabase.co';
      return Response.redirect(`${appUrl}/settings/connections?error=${error}`, 302);
    }

    if (!code || !state) {
      throw new Error('Missing code or state parameter');
    }

    if (!['todoist', 'strava'].includes(provider)) {
      throw new Error('Invalid provider');
    }

    // Parse state to get user ID
    let userId: string;
    try {
      const stateData = JSON.parse(atob(state));
      userId = stateData.userId;
    } catch (e) {
      throw new Error('Invalid state parameter');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    let accessToken: string;
    let refreshToken: string | null = null;
    let expiresAt: string | null = null;
    let providerUserId: string | null = null;
    let scopes: string[] = [];

    if (provider === 'todoist') {
      const clientId = Deno.env.get('TODOIST_CLIENT_ID');
      const clientSecret = Deno.env.get('TODOIST_CLIENT_SECRET');

      if (!clientId || !clientSecret) {
        throw new Error('Todoist credentials not configured');
      }

      console.log('[Todoist Callback] Exchanging code for token');

      const tokenResponse = await fetch('https://todoist.com/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('[Todoist Callback] Token exchange failed:', errorText);
        throw new Error(`Token exchange failed: ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      accessToken = tokenData.access_token;
      scopes = ['data:read'];

      console.log('[Todoist Callback] Token received, fetching user info');

      // Fetch Todoist user ID
      const userResponse = await fetch('https://api.todoist.com/sync/v9/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sync_token: '*',
          resource_types: ['user'],
        }),
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        providerUserId = userData.user?.id?.toString() || null;
      }

    } else if (provider === 'strava') {
      const clientId = Deno.env.get('STRAVA_CLIENT_ID');
      const clientSecret = Deno.env.get('STRAVA_CLIENT_SECRET');

      if (!clientId || !clientSecret) {
        throw new Error('Strava credentials not configured');
      }

      console.log('[Strava Callback] Exchanging code for token');

      const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('[Strava Callback] Token exchange failed:', errorText);
        throw new Error(`Token exchange failed: ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      accessToken = tokenData.access_token;
      refreshToken = tokenData.refresh_token;
      expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString();
      providerUserId = tokenData.athlete?.id?.toString() || null;
      scopes = ['activity:read_all'];

      console.log('[Strava Callback] Token and athlete data received');
    }

    // Store integration in database
    const now = new Date().toISOString();
    const { error: dbError } = await supabaseClient
      .from('user_integrations')
      .upsert({
        user_id: userId,
        integration_type: provider,
        provider_user_id: providerUserId,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt,
        integration_scopes: scopes,
        is_connected: true,
        integration_status: 'connected',
        connected_at: now,
        ignore_before: now,
        last_synced_at: now,
        updated_at: now,
      }, {
        onConflict: 'user_id,integration_type'
      });

    if (dbError) {
      console.error(`[${provider} Callback] Database error:`, dbError);
      throw dbError;
    }

    console.log(`[${provider} Callback] Integration saved successfully`);

    // Redirect to app
    const appUrl = Deno.env.get('APP_BASE_URL') || 'https://ncjbvdbkulnekwsjzicq.supabase.co';
    return Response.redirect(`${appUrl}/settings/connections?connected=${provider}`, 302);

  } catch (error) {
    console.error('[Integrations Callback] Error:', error.message);
    const appUrl = Deno.env.get('APP_BASE_URL') || 'https://ncjbvdbkulnekwsjzicq.supabase.co';
    return Response.redirect(`${appUrl}/settings/connections?error=auth_failed`, 302);
  }
});
