import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-todoist-hmac-sha256',
};

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyTodoistSignature(body: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(body);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, messageData);
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const computedSignature = btoa(String.fromCharCode(...signatureArray));
  
  return computedSignature === signature;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const provider = pathParts[pathParts.length - 1];

    if (!['todoist', 'strava'].includes(provider)) {
      return new Response(
        JSON.stringify({ error: 'Invalid provider' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle Strava subscription validation (GET request)
    if (provider === 'strava' && req.method === 'GET') {
      const hubMode = url.searchParams.get('hub.mode');
      const hubChallenge = url.searchParams.get('hub.challenge');
      const hubVerifyToken = url.searchParams.get('hub.verify_token');
      
      const verifyToken = Deno.env.get('STRAVA_VERIFY_TOKEN') || 'DAYWON_STRAVA';
      
      if (hubMode === 'subscribe' && hubVerifyToken === verifyToken) {
        console.log('[Strava Webhook] Subscription validated');
        return new Response(
          JSON.stringify({ 'hub.challenge': hubChallenge }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response('Forbidden', { status: 403 });
    }

    const bodyText = await req.text();
    const payload = JSON.parse(bodyText);

    // Verify signatures
    if (provider === 'todoist') {
      const signature = req.headers.get('x-todoist-hmac-sha256');
      const clientSecret = Deno.env.get('TODOIST_CLIENT_SECRET');
      
      if (!signature || !clientSecret) {
        console.error('[Todoist Webhook] Missing signature or secret');
        return new Response('Forbidden', { status: 403 });
      }
      
      const isValid = await verifyTodoistSignature(bodyText, signature, clientSecret);
      if (!isValid) {
        console.error('[Todoist Webhook] Invalid signature');
        return new Response('Forbidden', { status: 403 });
      }
      
      console.log('[Todoist Webhook] Signature verified');
    }

    // Canonicalize the event
    let canonicalEvent: {
      external_id: string;
      type: string;
      title: string;
      tags: string[];
      completed_at: string;
      provider_user_id: string;
    } | null = null;

    if (provider === 'todoist') {
      // Todoist webhook format: { event_name, event_data: { id, content, labels, completed_at }, user_id }
      if (payload.event_name === 'item:completed') {
        const eventData = payload.event_data;
        canonicalEvent = {
          external_id: eventData.id,
          type: 'task.completed',
          title: eventData.content || '',
          tags: eventData.labels || [],
          completed_at: eventData.completed_at || new Date().toISOString(),
          provider_user_id: payload.user_id?.toString() || '',
        };
        
        console.log('[Todoist Webhook] Task completed:', canonicalEvent.title);
      } else {
        console.log('[Todoist Webhook] Ignoring event type:', payload.event_name);
        return new Response(JSON.stringify({ status: 'ignored' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    } else if (provider === 'strava') {
      // Strava webhook format: { object_type, object_id, aspect_type, owner_id, subscription_id, event_time }
      if (payload.object_type === 'activity' && ['create', 'update'].includes(payload.aspect_type)) {
        const objectId = payload.object_id?.toString();
        const ownerId = payload.owner_id?.toString();
        
        // Fetch activity details to get name and sport_type
        const { data: integration } = await supabase
          .from('user_integrations')
          .select('access_token')
          .eq('integration_type', 'strava')
          .eq('provider_user_id', ownerId)
          .single();
        
        if (integration?.access_token) {
          const activityResponse = await fetch(
            `https://www.strava.com/api/v3/activities/${objectId}`,
            {
              headers: {
                'Authorization': `Bearer ${integration.access_token}`,
              },
            }
          );
          
          if (activityResponse.ok) {
            const activity = await activityResponse.json();
            canonicalEvent = {
              external_id: objectId,
              type: 'activity.created',
              title: activity.name || '',
              tags: [activity.sport_type || activity.type || 'activity'],
              completed_at: activity.start_date_local || activity.start_date || new Date().toISOString(),
              provider_user_id: ownerId,
            };
            
            console.log('[Strava Webhook] Activity created:', canonicalEvent.title);
          }
        }
      } else {
        console.log('[Strava Webhook] Ignoring event type:', payload.object_type, payload.aspect_type);
        return new Response(JSON.stringify({ status: 'ignored' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    if (!canonicalEvent) {
      return new Response(JSON.stringify({ status: 'ignored' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Resolve user_id from provider_user_id
    const { data: integration, error: integrationError } = await supabase
      .from('user_integrations')
      .select('user_id, ignore_before')
      .eq('integration_type', provider)
      .eq('provider_user_id', canonicalEvent.provider_user_id)
      .single();

    if (integrationError || !integration) {
      console.error(`[${provider} Webhook] User not found for provider_user_id:`, canonicalEvent.provider_user_id);
      return new Response(JSON.stringify({ status: 'user_not_found' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const userId = integration.user_id;
    const ignoreBefore = new Date(integration.ignore_before);

    // Check no-backfill rule: completed_at + 90s < ignore_before
    const completedAt = new Date(canonicalEvent.completed_at);
    const completedWithBuffer = new Date(completedAt.getTime() + 90000); // +90 seconds
    
    if (completedWithBuffer < ignoreBefore) {
      console.log(`[${provider} Webhook] Event ignored (before ignore_before):`, canonicalEvent.external_id);
      return new Response(JSON.stringify({ status: 'ignored' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Compute dedupe_hash
    const dedupeString = `${provider}|${canonicalEvent.external_id}|${canonicalEvent.type}|${canonicalEvent.completed_at}`;
    const dedupeHash = await sha256(dedupeString);

    // Insert into integration_events (on conflict do nothing)
    const { data: insertedEvent, error: insertError } = await supabase
      .from('integration_events')
      .insert({
        user_id: userId,
        provider: provider,
        external_id: canonicalEvent.external_id,
        event_type: canonicalEvent.type,
        title: canonicalEvent.title,
        tags: canonicalEvent.tags,
        completed_at: canonicalEvent.completed_at,
        payload: payload,
        dedupe_hash: dedupeHash,
        processed: false,
      })
      .select()
      .single();

    if (insertError) {
      // Check if it's a duplicate (conflict on dedupe_hash)
      if (insertError.code === '23505') {
        console.log(`[${provider} Webhook] Duplicate event ignored:`, dedupeHash);
        return new Response(JSON.stringify({ status: 'duplicate' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      throw insertError;
    }

    console.log(`[${provider} Webhook] Event inserted:`, insertedEvent.id);

    // Load active integration_rules for this provider and user
    const { data: rules, error: rulesError } = await supabase
      .from('integration_rules')
      .select('*, habits(id, name)')
      .eq('user_id', userId)
      .eq('provider', provider)
      .eq('active', true)
      .order('created_at', { ascending: true });

    if (rulesError) {
      throw rulesError;
    }

    // Find the first matching rule
    let matchedRule = null;
    for (const rule of rules || []) {
      let matches = false;
      
      switch (rule.match_type) {
        case 'title_exact':
          matches = canonicalEvent.title.toLowerCase() === rule.match_value.toLowerCase();
          break;
        case 'title_contains':
          matches = canonicalEvent.title.toLowerCase().includes(rule.match_value.toLowerCase());
          break;
        case 'tag':
          matches = canonicalEvent.tags.some(tag => tag.toLowerCase() === rule.match_value.toLowerCase());
          break;
        case 'type':
          matches = canonicalEvent.tags.some(tag => tag.toLowerCase().includes(rule.match_value.toLowerCase()));
          break;
      }
      
      if (matches) {
        matchedRule = rule;
        break;
      }
    }

    if (matchedRule) {
      console.log(`[${provider} Webhook] Rule matched:`, matchedRule.match_type, matchedRule.match_value);
      
      // Mark habit as complete for the completed_at date
      const completedDate = canonicalEvent.completed_at.split('T')[0];
      
      const { error: activityError } = await supabase
        .from('habit_activities')
        .insert({
          user_id: userId,
          habit_id: matchedRule.habit_id,
          habit_name: matchedRule.habits.name,
          activity_date: completedDate,
          status: 'completed',
        });
      
      if (activityError && activityError.code !== '23505') {
        // Ignore duplicate constraint errors
        console.error(`[${provider} Webhook] Error creating habit activity:`, activityError);
      } else {
        console.log(`[${provider} Webhook] Habit marked complete:`, matchedRule.habits.name);
      }
    } else {
      console.log(`[${provider} Webhook] No matching rule found`);
    }

    // Mark event as processed
    await supabase
      .from('integration_events')
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
      })
      .eq('id', insertedEvent.id);

    return new Response(JSON.stringify({ status: 'processed', event_id: insertedEvent.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[Integrations Webhook] Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
