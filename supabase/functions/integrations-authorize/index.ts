import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const provider = url.searchParams.get('provider');

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

    // Build state parameter with user ID
    const state = btoa(JSON.stringify({ userId, provider }));

    // Get redirect URI (the callback edge function URL)
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    const redirectUri = `https://${projectRef}.supabase.co/functions/v1/integrations-callback/${provider}`;

    let connectUrl: string;

    if (provider === 'todoist') {
      const clientId = Deno.env.get('TODOIST_CLIENT_ID');
      if (!clientId) {
        throw new Error('Todoist credentials not configured');
      }

      const scope = 'data:read';
      connectUrl = `https://todoist.com/oauth/authorize?client_id=${clientId}&scope=${scope}&state=${state}`;
      
      console.log('[Todoist Auth] Generated OAuth URL for user:', userId);
    } else if (provider === 'strava') {
      const clientId = Deno.env.get('STRAVA_CLIENT_ID');
      if (!clientId) {
        throw new Error('Strava credentials not configured');
      }

      const scope = 'activity:read_all';
      connectUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&approval_prompt=auto&scope=${scope}&state=${state}`;
      
      console.log('[Strava Auth] Generated OAuth URL for user:', userId);
    } else {
      throw new Error('Unsupported provider');
    }

    return new Response(
      JSON.stringify({ connectUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Integrations Authorize] Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
