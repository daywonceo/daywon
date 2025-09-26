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
        case 'apple_health':
          syncResult = await syncAppleHealth(integration, sync_type, user.id, supabaseClient);
          break;
        
        case 'myfitnesspal':
          syncResult = await syncMyFitnessPal(integration, sync_type, user.id, supabaseClient);
          break;
        
        case 'fitbit':
          syncResult = await syncFitbit(integration, sync_type, user.id, supabaseClient);
          break;
        
        case 'todoist':
          syncResult = await syncTodoist(integration, sync_type, user.id, supabaseClient);
          break;
        
        case 'rescuetime':
          syncResult = await syncRescueTime(integration, sync_type, user.id, supabaseClient);
          break;
        
        case 'headspace':
          syncResult = await syncHeadspace(integration, sync_type, user.id, supabaseClient);
          break;
        
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

// Apple Health sync implementation
async function syncAppleHealth(integration: any, syncType: string, userId: string, supabase: any) {
  const settings = integration.integration_settings;
  let recordsProcessed = 0;
  const syncDetails: any = {};

  if (settings.syncSteps && (syncType === 'import' || syncType === 'bidirectional')) {
    // In a real implementation:
    // 1. Use HealthKit data received from iOS app
    // 2. Process step counts, workouts, heart rate, sleep data
    // 3. Auto-complete related habits
    
    recordsProcessed = Math.floor(Math.random() * 7) + 1;
    syncDetails.health_data_synced = recordsProcessed;
    syncDetails.steps_processed = Math.floor(Math.random() * 50000) + 5000;
    syncDetails.workouts_processed = Math.floor(Math.random() * 5);
    syncDetails.demo_note = "Apple Health sync simulated - requires iOS HealthKit integration";
  }

  if (settings.autoCompleteHabits) {
    syncDetails.habits_auto_completed = Math.floor(Math.random() * 4);
    syncDetails.habit_types = ['Exercise', 'Steps Goal', 'Sleep Goal'];
  }

  return { records_processed: recordsProcessed, error_message: null, sync_details: syncDetails };
}

// MyFitnessPal sync implementation
async function syncMyFitnessPal(integration: any, syncType: string, userId: string, supabase: any) {
  const settings = integration.integration_settings;
  let recordsProcessed = 0;
  const syncDetails: any = {};

  if (settings.syncNutrition && (syncType === 'import' || syncType === 'bidirectional')) {
    // In a real implementation:
    // 1. Use MyFitnessPal API to get food diary entries
    // 2. Process calorie intake, macro nutrients, water intake
    // 3. Auto-complete nutrition-related habits
    
    recordsProcessed = Math.floor(Math.random() * 14) + 1; // 1-14 days of nutrition data
    syncDetails.nutrition_entries_synced = recordsProcessed;
    syncDetails.calories_tracked = Math.floor(Math.random() * 2000) + 1500;
    syncDetails.water_logged = Math.floor(Math.random() * 8) + 4; // glasses of water
    syncDetails.demo_note = "MyFitnessPal sync simulated - requires API integration";
  }

  if (settings.autoCompleteNutritionHabits) {
    syncDetails.habits_auto_completed = Math.floor(Math.random() * 3);
    syncDetails.habit_types = ['Log Food', 'Drink Water', 'Meet Calorie Goal'];
  }

  return { records_processed: recordsProcessed, error_message: null, sync_details: syncDetails };
}

// Fitbit sync implementation
async function syncFitbit(integration: any, syncType: string, userId: string, supabase: any) {
  const settings = integration.integration_settings;
  let recordsProcessed = 0;
  const syncDetails: any = {};

  if (settings.syncSteps && (syncType === 'import' || syncType === 'bidirectional')) {
    // In a real implementation:
    // 1. Use Fitbit Web API to get activity data
    // 2. Process steps, heart rate, sleep, exercise data
    // 3. Handle token refresh if needed
    // 4. Auto-complete fitness habits
    
    recordsProcessed = Math.floor(Math.random() * 30) + 1; // Up to 30 days of data
    syncDetails.activity_data_synced = recordsProcessed;
    syncDetails.avg_daily_steps = Math.floor(Math.random() * 5000) + 7000;
    syncDetails.workouts_detected = Math.floor(Math.random() * 10);
    syncDetails.sleep_records = Math.floor(Math.random() * 7) + 1;
    syncDetails.demo_note = "Fitbit sync simulated - requires OAuth 2.0 integration";
  }

  if (settings.autoCompleteStepGoals || settings.autoCompleteExerciseGoals || settings.autoCompleteSleepGoals) {
    syncDetails.habits_auto_completed = Math.floor(Math.random() * 5);
    syncDetails.habit_types = ['Daily Steps', 'Exercise', 'Sleep Goal', 'Active Minutes'];
  }

  // Check if token needs refresh (Fitbit tokens expire)
  const tokenExpiry = new Date(integration.token_expires_at);
  const now = new Date();
  if (tokenExpiry.getTime() - now.getTime() < 24 * 60 * 60 * 1000) { // Less than 24 hours
    syncDetails.token_refresh_needed = true;
  }

  return { records_processed: recordsProcessed, error_message: null, sync_details: syncDetails };
}

// Todoist sync implementation
async function syncTodoist(integration: any, syncType: string, userId: string, supabase: any) {
  const settings = integration.integration_settings;
  let recordsProcessed = 0;
  const syncDetails: any = {};

  if (settings.syncTasks && (syncType === 'import' || syncType === 'bidirectional')) {
    // In a real implementation:
    // 1. Use Todoist API to get completed tasks
    // 2. Match task completion with productivity habits
    // 3. Auto-complete habits based on task completion
    
    recordsProcessed = Math.floor(Math.random() * 15) + 1; // 1-15 tasks processed
    syncDetails.tasks_synced = recordsProcessed;
    syncDetails.projects_found = Math.floor(Math.random() * 5) + 1;
    syncDetails.completed_tasks = Math.floor(Math.random() * 8) + 1;
    syncDetails.demo_note = "Todoist sync simulated - requires API token integration";
  }

  if (settings.autoCompleteTaskHabits) {
    syncDetails.habits_auto_completed = Math.floor(Math.random() * 4);
    syncDetails.habit_types = ['Complete Tasks', 'Daily Planning', 'Project Organization'];
  }

  if (settings.createHabitTasks && (syncType === 'export' || syncType === 'bidirectional')) {
    syncDetails.habit_tasks_created = Math.floor(Math.random() * 3);
    syncDetails.task_creation_note = "Created Todoist tasks for active habits";
  }

  return { records_processed: recordsProcessed, error_message: null, sync_details: syncDetails };
}

// RescueTime sync implementation
async function syncRescueTime(integration: any, syncType: string, userId: string, supabase: any) {
  const settings = integration.integration_settings;
  let recordsProcessed = 0;
  const syncDetails: any = {};

  if (settings.trackScreenTime && (syncType === 'import' || syncType === 'bidirectional')) {
    // In a real implementation:
    // 1. Use RescueTime API to get productivity data
    // 2. Calculate daily productive time vs distracting time
    // 3. Auto-complete digital wellness habits based on screen time goals
    
    recordsProcessed = Math.floor(Math.random() * 7) + 1; // 1-7 days of data
    syncDetails.screen_time_days_synced = recordsProcessed;
    syncDetails.avg_daily_productive_time = Math.floor(Math.random() * 300) + 180; // 3-8 hours
    syncDetails.avg_daily_distracting_time = Math.floor(Math.random() * 120) + 60; // 1-3 hours
    syncDetails.productivity_score = Math.floor(Math.random() * 40) + 60; // 60-100%
    syncDetails.demo_note = "RescueTime sync simulated - requires API key integration";
  }

  if (settings.autoCompleteDigitalWellnessHabits) {
    const productiveHours = syncDetails.avg_daily_productive_time / 60;
    const goalHours = settings.dailyTimeGoals / 60;
    syncDetails.habits_auto_completed = productiveHours >= goalHours ? Math.floor(Math.random() * 3) : 0;
    syncDetails.habit_types = ['Productive Screen Time', 'Focus Sessions', 'Digital Wellness'];
  }

  return { records_processed: recordsProcessed, error_message: null, sync_details: syncDetails };
}

// Headspace sync implementation
async function syncHeadspace(integration: any, syncType: string, userId: string, supabase: any) {
  const settings = integration.integration_settings;
  let recordsProcessed = 0;
  const syncDetails: any = {};

  if (settings.trackMeditation && (syncType === 'import' || syncType === 'bidirectional')) {
    // In a real implementation:
    // 1. Use Headspace API to get meditation session data
    // 2. Track mindfulness exercises and sleep stories
    // 3. Auto-complete meditation and wellness habits
    
    recordsProcessed = Math.floor(Math.random() * 14) + 1; // 1-14 days of sessions
    syncDetails.meditation_sessions_synced = recordsProcessed;
    syncDetails.total_meditation_minutes = Math.floor(Math.random() * 200) + 50;
    syncDetails.sleep_sessions = Math.floor(Math.random() * 7) + 1;
    syncDetails.mindfulness_exercises = Math.floor(Math.random() * 10) + 1;
    syncDetails.streak_days = Math.floor(Math.random() * 14) + 1;
    syncDetails.demo_note = "Headspace sync simulated - requires account integration";
  }

  if (settings.autoCompleteMeditationHabits || settings.autoCompleteSleepHabits) {
    const dailyMinutes = syncDetails.total_meditation_minutes / recordsProcessed;
    const goalMinutes = settings.dailyMeditationGoal;
    syncDetails.habits_auto_completed = dailyMinutes >= goalMinutes ? Math.floor(Math.random() * 4) : Math.floor(Math.random() * 2);
    syncDetails.habit_types = ['Daily Meditation', 'Mindfulness Practice', 'Sleep Wellness', 'Stress Relief'];
  }

  return { records_processed: recordsProcessed, error_message: null, sync_details: syncDetails };
}

serve(handler);