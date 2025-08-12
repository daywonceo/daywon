import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

interface Metrics {
  week_start: string;
  week_end: string;
  workouts_completed: number;
  total_workout_minutes: number;
  average_workout_minutes: number;
  prs_count: number;
  best_weight_increase_percent: number;
  active_days: number;
  habits_logged: number;
  recipes_saved: number;
  avg_recipe_calories?: number;
}

function getLastWeekRange(refDate = new Date()) {
  // Set to Monday of current week
  const date = new Date(refDate);
  const day = date.getDay(); // 0=Sun, 1=Mon
  const diffToMonday = (day === 0 ? -6 : 1) - day; // days to Monday this week
  const mondayThisWeek = new Date(date);
  mondayThisWeek.setDate(date.getDate() + diffToMonday);
  // Last week's Monday and Sunday
  const mondayLastWeek = new Date(mondayThisWeek);
  mondayLastWeek.setDate(mondayThisWeek.getDate() - 7);
  const sundayLastWeek = new Date(mondayLastWeek);
  sundayLastWeek.setDate(mondayLastWeek.getDate() + 6);

  const toISODate = (d: Date) => d.toISOString().slice(0, 10);
  return { week_start: toISODate(mondayLastWeek), week_end: toISODate(sundayLastWeek) };
}

async function computeMetrics(supabase: any, userId: string, week_start: string, week_end: string): Promise<Metrics> {
  // Workouts
  const { data: workouts, error: workoutsErr } = await supabase
    .from('workout_sessions')
    .select('duration_minutes, is_completed, workout_date')
    .eq('is_completed', true)
    .gte('workout_date', week_start)
    .lte('workout_date', week_end)
    .eq('user_id', userId);
  if (workoutsErr) throw workoutsErr;
  const workouts_completed = workouts?.length || 0;
  const total_workout_minutes = (workouts || []).reduce((sum: number, w: any) => sum + (w.duration_minutes || 0), 0);
  const average_workout_minutes = workouts_completed ? Math.round(total_workout_minutes / workouts_completed) : 0;

  // PRs
  const { data: prs, error: prsErr } = await supabase
    .from('user_progress')
    .select('weight_increase_percent, last_increase_date')
    .gte('last_increase_date', week_start)
    .lte('last_increase_date', week_end)
    .eq('user_id', userId);
  if (prsErr) throw prsErr;
  const prs_count = prs?.length || 0;
  const best_weight_increase_percent = prs && prs.length
    ? Math.max(...prs.map((p: any) => Number(p.weight_increase_percent || 0)))
    : 0;

  // Habit activities
  const { data: habits, error: habitsErr } = await supabase
    .from('habit_activities')
    .select('activity_date, habit_id')
    .gte('activity_date', week_start)
    .lte('activity_date', week_end)
    .eq('user_id', userId);
  if (habitsErr) throw habitsErr;
  const active_days = new Set((habits || []).map((h: any) => h.activity_date)).size;
  const habits_logged = new Set((habits || []).map((h: any) => h.habit_id)).size;

  // Nutrition
  const { data: recipes, error: recipesErr } = await supabase
    .from('saved_recipes')
    .select('recipe_nutrition, saved_at')
    .gte('saved_at', week_start)
    .lte('saved_at', week_end)
    .eq('user_id', userId);
  if (recipesErr) throw recipesErr;
  const recipes_saved = recipes?.length || 0;
  const caloriesArr = (recipes || [])
    .map((r: any) => r.recipe_nutrition?.calories)
    .filter((c: any) => typeof c === 'number');
  const avg_recipe_calories = caloriesArr.length
    ? Math.round(caloriesArr.reduce((a: number, b: number) => a + b, 0) / caloriesArr.length)
    : undefined;

  return {
    week_start,
    week_end,
    workouts_completed,
    total_workout_minutes,
    average_workout_minutes,
    prs_count,
    best_weight_increase_percent,
    active_days,
    habits_logged,
    recipes_saved,
    avg_recipe_calories,
  };
}

async function generateCoachingText(metrics: Metrics): Promise<string> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    // Fallback without AI
    return `Great work last week! You completed ${metrics.workouts_completed} workouts averaging ${metrics.average_workout_minutes} minutes. ` +
      `${metrics.prs_count > 0 ? `You hit ${metrics.prs_count} PRs (best +${Math.round(metrics.best_weight_increase_percent)}%). ` : ''}` +
      `${metrics.active_days} active days across ${metrics.habits_logged} habits. ` +
      `${metrics.recipes_saved ? `You saved ${metrics.recipes_saved} nutritious recipes${metrics.avg_recipe_calories ? ` (avg ~${metrics.avg_recipe_calories} kcal)` : ''}. ` : ''}` +
      `Keep the momentum—set a clear target for this week and schedule your sessions!`;
  }

  const prompt = `You are a concise, motivational fitness coach.
Return only a single paragraph (120-180 words). No bullet points.
Context (last week metrics): ${JSON.stringify(metrics)}
Focus on encouragement, one actionable focus, and a light nutrition tip if relevant.`;

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: 'You are a helpful fitness and habits coach.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 350,
    }),
  });

  if (!resp.ok) {
    console.error('OpenAI error', resp.status, await resp.text());
    return `Great work last week! You completed ${metrics.workouts_completed} workouts averaging ${metrics.average_workout_minutes} minutes. Keep going!`;
  }
  const data = await resp.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  return text || `Solid week—${metrics.workouts_completed} workouts and ${metrics.active_days} active days. Keep it up!`;
}

async function upsertSummary(supabase: any, payload: { user_id: string; week_start: string; week_end: string; summary_text: string; metrics: any; }) {
  const { error } = await supabase
    .from('weekly_summaries')
    .upsert(payload, { onConflict: 'user_id,week_start' });
  if (error) throw error;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const { weekStart: overrideWeekStart, bulk } = (await req.json().catch(() => ({}))) as { weekStart?: string; bulk?: boolean };
    const { week_start, week_end } = overrideWeekStart
      ? (() => { const ws = overrideWeekStart; const d = new Date(ws); const we = new Date(d); we.setDate(d.getDate() + 6); return { week_start: ws, week_end: we.toISOString().slice(0,10) }; })()
      : getLastWeekRange();

    const authHeader = req.headers.get('Authorization');

    // Bulk mode secured by CRON_SECRET
    const cronHeader = req.headers.get('x-cron-secret');
    const cronSecret = Deno.env.get('CRON_SECRET');

    if (bulk && cronHeader && cronSecret && cronHeader === cronSecret) {
      if (!SERVICE_ROLE) {
        return new Response(JSON.stringify({ error: 'SERVICE_ROLE key missing' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE);
      // Get all user ids from profiles
      const { data: profiles, error: profErr } = await serviceClient.from('profiles').select('id');
      if (profErr) throw profErr;

      let success = 0, failed = 0;
      for (const p of profiles || []) {
        try {
          const metrics = await computeMetrics(serviceClient, p.id, week_start, week_end);
          const text = await generateCoachingText(metrics);
          await upsertSummary(serviceClient, { user_id: p.id, week_start, week_end, summary_text: text, metrics });
          success++;
        } catch (e) {
          console.error('Failed for user', p.id, e);
          failed++;
        }
      }
      return new Response(JSON.stringify({ status: 'ok', week_start, week_end, processed: success, failed }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Single-user mode
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const userId = userData.user.id;

    const metrics = await computeMetrics(userClient, userId, week_start, week_end);
    const text = await generateCoachingText(metrics);
    await upsertSummary(userClient, { user_id: userId, week_start, week_end, summary_text: text, metrics });

    return new Response(JSON.stringify({ week_start, week_end, summary_text: text, metrics }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('generate-weekly-summary error', e);
    return new Response(JSON.stringify({ error: e?.message || 'Internal error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
