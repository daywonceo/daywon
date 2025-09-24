import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface SyncRequest {
  integration_type: string;
  sync_type: 'import' | 'export' | 'bidirectional';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { integration_type, sync_type }: SyncRequest = await req.json();

    // Get the integration settings
    const { data: integration, error: integrationError } = await supabaseClient
      .from('user_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('integration_type', integration_type)
      .eq('is_connected', true)
      .single();

    if (integrationError || !integration) {
      throw new Error(`Integration ${integration_type} not found or not connected`);
    }

    // Create sync log entry
    const { data: syncLog, error: logError } = await supabaseClient
      .from('integration_sync_logs')
      .insert({
        user_id: user.id,
        integration_type,
        sync_type,
        status: 'pending',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (logError) {
      throw new Error('Failed to create sync log');
    }

    let syncResult = { records_processed: 0, error_message: null, sync_details: {} };

    try {
      // Perform sync based on integration type
      switch (integration_type) {
        case 'spotify':
          syncResult = await syncSpotify(integration, sync_type, user.id, supabaseClient);
          break;
        
        case 'google_fit':
          syncResult = await syncGoogleFit(integration, sync_type, user.id, supabaseClient);
          break;
        
        case 'calendar':
          syncResult = await syncCalendar(integration, sync_type, user.id, supabaseClient);
          break;
        
        case 'zapier':
          syncResult = await syncZapier(integration, sync_type, user.id, supabaseClient);
          break;
        
        default:
          throw new Error(`Unsupported integration type: ${integration_type}`);
      }

      // Update sync log with success
      await supabaseClient
        .from('integration_sync_logs')
        .update({
          status: 'success',
          records_processed: syncResult.records_processed,
          sync_details: syncResult.sync_details,
          completed_at: new Date().toISOString(),
        })
        .eq('id', syncLog.id);

      // Update last sync time on integration
      await supabaseClient
        .from('user_integrations')
        .update({
          last_sync_at: new Date().toISOString(),
        })
        .eq('id', integration.id);

    } catch (syncError) {
      // Update sync log with error
      await supabaseClient
        .from('integration_sync_logs')
        .update({
          status: 'error',
          error_message: syncError.message,
          completed_at: new Date().toISOString(),
        })
        .eq('id', syncLog.id);

      throw syncError;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      sync_log_id: syncLog.id,
      records_processed: syncResult.records_processed 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Sync error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Sync failed' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

// Spotify sync implementation
async function syncSpotify(integration: any, syncType: string, userId: string, supabase: any) {
  const settings = integration.integration_settings;
  let recordsProcessed = 0;
  const syncDetails: any = {};

  if (settings.trackListeningHabits && (syncType === 'import' || syncType === 'bidirectional')) {
    // In a real implementation, you would:
    // 1. Use the access_token to call Spotify API
    // 2. Get recently played tracks
    // 3. Create habit events for "Listen to Music" habit
    
    // For demo purposes, simulate processing
    recordsProcessed = Math.floor(Math.random() * 10) + 1;
    syncDetails.listening_sessions = recordsProcessed;
    syncDetails.demo_note = "Spotify sync simulated - requires real OAuth integration";
  }

  return { records_processed: recordsProcessed, error_message: null, sync_details: syncDetails };
}

// Google Fit sync implementation
async function syncGoogleFit(integration: any, syncType: string, userId: string, supabase: any) {
  const settings = integration.integration_settings;
  let recordsProcessed = 0;
  const syncDetails: any = {};

  if (settings.syncSteps && (syncType === 'import' || syncType === 'bidirectional')) {
    // In a real implementation:
    // 1. Use Google Fit API to get step data
    // 2. Create or update habit events for step-related habits
    
    recordsProcessed = Math.floor(Math.random() * 7) + 1; // Simulate 1-7 days of data
    syncDetails.steps_synced = recordsProcessed;
    syncDetails.demo_note = "Google Fit sync simulated - requires real OAuth integration";
  }

  if (settings.autoCompleteHabits) {
    // Auto-complete fitness habits based on step count
    syncDetails.habits_auto_completed = Math.floor(Math.random() * 3);
  }

  return { records_processed: recordsProcessed, error_message: null, sync_details: syncDetails };
}

// Calendar sync implementation
async function syncCalendar(integration: any, syncType: string, userId: string, supabase: any) {
  const settings = integration.integration_settings;
  let recordsProcessed = 0;
  const syncDetails: any = {};

  if (settings.syncToCalendar && (syncType === 'export' || syncType === 'bidirectional')) {
    // In a real implementation:
    // 1. Get user's active habits
    // 2. Create calendar events for habit reminders
    // 3. Update existing events if habits changed
    
    recordsProcessed = Math.floor(Math.random() * 5) + 1;
    syncDetails.calendar_events_created = recordsProcessed;
    syncDetails.demo_note = "Calendar sync simulated - requires real OAuth integration";
  }

  return { records_processed: recordsProcessed, error_message: null, sync_details: syncDetails };
}

// Zapier sync implementation
async function syncZapier(integration: any, syncType: string, userId: string, supabase: any) {
  const settings = integration.integration_settings;
  let recordsProcessed = 0;
  const syncDetails: any = {};

  // For Zapier, we typically just verify the webhook is working
  if (settings.webhookUrl) {
    try {
      const response = await fetch(settings.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: true,
          message: 'Webhook connectivity test from DayWon',
          user_id: userId,
          timestamp: new Date().toISOString(),
        }),
      });

      recordsProcessed = 1;
      syncDetails.webhook_test = response.ok ? 'success' : 'failed';
      syncDetails.webhook_status = response.status;
    } catch (error) {
      syncDetails.webhook_test = 'failed';
      syncDetails.error = error.message;
    }
  }

  return { records_processed: recordsProcessed, error_message: null, sync_details: syncDetails };
}

serve(handler);