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
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    console.log('[Strava OAuth] Callback received:', { code: !!code, state, error });

    if (error) {
      console.error('[Strava OAuth] Error from provider:', error);
      return new Response(
        JSON.stringify({ error: 'OAuth error', details: error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!code) {
      console.error('[Strava OAuth] No code provided');
      return new Response(
        JSON.stringify({ error: 'No authorization code provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Exchange code for access token
    const clientId = Deno.env.get('STRAVA_CLIENT_ID');
    const clientSecret = Deno.env.get('STRAVA_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      console.error('[Strava OAuth] Missing client credentials');
      throw new Error('Strava OAuth credentials not configured');
    }

    console.log('[Strava OAuth] Exchanging code for token');
    
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('[Strava OAuth] Token exchange failed:', errorText);
      throw new Error(`Token exchange failed: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('[Strava OAuth] Token received successfully');

    // Get user from state parameter (it should contain the user ID)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Parse state to get user ID
    let userId: string;
    try {
      const stateData = JSON.parse(atob(state || ''));
      userId = stateData.userId;
    } catch (error) {
      console.error('[Strava OAuth] Failed to parse state:', error);
      throw new Error('Invalid state parameter');
    }

    console.log('[Strava OAuth] Storing token for user:', userId);

    // Calculate token expiration
    const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString();

    // Store the access token and refresh token in user_integrations
    const { error: dbError } = await supabaseClient
      .from('user_integrations')
      .upsert({
        user_id: userId,
        integration_type: 'strava',
        is_connected: true,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt,
        integration_settings: {
          syncActivities: true,
          activityTypes: ['Run', 'Ride', 'Swim', 'Workout'],
          createHabitsFromActivities: true,
          athlete: tokenData.athlete,
        },
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,integration_type'
      });

    if (dbError) {
      console.error('[Strava OAuth] Database error:', dbError);
      throw dbError;
    }

    console.log('[Strava OAuth] Integration saved successfully');

    // Redirect back to the app
    const appUrl = req.headers.get('origin') || 'https://ncjbvdbkulnekwsjzicq.supabase.co';
    return Response.redirect(`${appUrl}/profile?tab=integrations&connected=strava`, 302);

  } catch (error) {
    console.error('[Strava OAuth] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
