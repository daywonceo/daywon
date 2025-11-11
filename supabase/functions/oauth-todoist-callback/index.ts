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

    console.log('[Todoist OAuth] Callback received:', { code: !!code, state, error });

    if (error) {
      console.error('[Todoist OAuth] Error from provider:', error);
      return new Response(
        JSON.stringify({ error: 'OAuth error', details: error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!code) {
      console.error('[Todoist OAuth] No code provided');
      return new Response(
        JSON.stringify({ error: 'No authorization code provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Exchange code for access token
    const clientId = Deno.env.get('TODOIST_CLIENT_ID');
    const clientSecret = Deno.env.get('TODOIST_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      console.error('[Todoist OAuth] Missing client credentials');
      throw new Error('Todoist OAuth credentials not configured');
    }

    console.log('[Todoist OAuth] Exchanging code for token');
    
    const tokenResponse = await fetch('https://todoist.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('[Todoist OAuth] Token exchange failed:', errorText);
      throw new Error(`Token exchange failed: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('[Todoist OAuth] Token received successfully');

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
      console.error('[Todoist OAuth] Failed to parse state:', error);
      throw new Error('Invalid state parameter');
    }

    console.log('[Todoist OAuth] Storing token for user:', userId);

    // Store the access token in user_integrations
    const { error: dbError } = await supabaseClient
      .from('user_integrations')
      .upsert({
        user_id: userId,
        integration_type: 'todoist',
        is_connected: true,
        access_token: tokenData.access_token,
        expires_at: null, // Todoist tokens don't expire
        integration_settings: {
          syncTasks: true,
          syncProjects: true,
          autoCompleteTaskHabits: true,
          createHabitTasks: true,
          completedTasksAsHabits: true,
        },
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,integration_type'
      });

    if (dbError) {
      console.error('[Todoist OAuth] Database error:', dbError);
      throw dbError;
    }

    console.log('[Todoist OAuth] Integration saved successfully');

    // Redirect back to the app
    const appUrl = req.headers.get('origin') || 'https://ncjbvdbkulnekwsjzicq.supabase.co';
    return Response.redirect(`${appUrl}/profile?tab=integrations&connected=todoist`, 302);

  } catch (error) {
    console.error('[Todoist OAuth] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
