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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find integrations that need token refresh (expires within 5 minutes)
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    
    const { data: expiring, error: fetchError } = await supabase
      .from('user_integrations')
      .select('*')
      .not('expires_at', 'is', null)
      .lt('expires_at', fiveMinutesFromNow)
      .eq('integration_status', 'connected')
      .not('refresh_token', 'is', null);

    if (fetchError) {
      throw fetchError;
    }

    console.log(`[Token Refresh] Found ${expiring?.length || 0} integrations needing refresh`);

    let refreshed = 0;
    let failed = 0;

    for (const integration of expiring || []) {
      try {
        console.log(`[Token Refresh] Refreshing ${integration.integration_type} for user ${integration.user_id}`);

        let newAccessToken: string | null = null;
        let newRefreshToken: string | null = null;
        let newExpiresAt: string | null = null;

        // Only Strava has refresh tokens (Todoist tokens don't expire)
        if (integration.integration_type === 'strava') {
          const clientId = Deno.env.get('STRAVA_CLIENT_ID');
          const clientSecret = Deno.env.get('STRAVA_CLIENT_SECRET');

          if (!clientId || !clientSecret) {
            console.error('[Token Refresh] Strava credentials not configured');
            throw new Error('Strava credentials not configured');
          }

          const refreshResponse = await fetch('https://www.strava.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              client_id: clientId,
              client_secret: clientSecret,
              grant_type: 'refresh_token',
              refresh_token: integration.refresh_token,
            }),
          });

          if (!refreshResponse.ok) {
            const errorText = await refreshResponse.text();
            console.error('[Token Refresh] Strava refresh failed:', errorText);
            throw new Error(`Strava refresh failed: ${errorText}`);
          }

          const tokenData = await refreshResponse.json();
          newAccessToken = tokenData.access_token;
          newRefreshToken = tokenData.refresh_token;
          newExpiresAt = new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString();

          console.log('[Token Refresh] Strava token refreshed successfully');
        } else {
          // Todoist tokens don't expire, skip
          console.log('[Token Refresh] Skipping non-expiring token type:', integration.integration_type);
          continue;
        }

        // Update the integration with new tokens
        const { error: updateError } = await supabase
          .from('user_integrations')
          .update({
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
            expires_at: newExpiresAt,
            integration_status: 'connected',
            updated_at: new Date().toISOString(),
          })
          .eq('id', integration.id);

        if (updateError) {
          throw updateError;
        }

        refreshed++;
        console.log(`[Token Refresh] Updated integration ${integration.id}`);

      } catch (error) {
        console.error(`[Token Refresh] Failed to refresh ${integration.integration_type}:`, error.message);
        
        // Mark as needs_reauth on failure
        await supabase
          .from('user_integrations')
          .update({
            integration_status: 'needs_reauth',
            updated_at: new Date().toISOString(),
          })
          .eq('id', integration.id);

        failed++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        checked: expiring?.length || 0,
        refreshed,
        failed,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Token Refresh] Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
