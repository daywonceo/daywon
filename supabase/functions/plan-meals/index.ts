import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function nextMonday(from: Date = new Date()) {
  const d = new Date(from);
  const day = d.getDay(); // 0=Sun..6=Sat
  const diff = (8 - day) % 7 || 7; // days until next Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0,0,0,0);
  return d;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const user_id = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const goals = body?.goals || {};
    const preferences = body?.preferences || {};
    const calories_target = body?.calories_target || null;
    let plan_start: string = body?.plan_start;

    if (!plan_start) {
      plan_start = toISODate(nextMonday(new Date()));
    }
    const start = new Date(plan_start);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const plan_end = toISODate(end);

    // Build prompt for strict JSON
    const prompt = `Create a 7-day meal plan. Output MUST be pure JSON matching this schema with no extra text or code fences:\n\n{
  "plan_start": "YYYY-MM-DD",
  "plan_end": "YYYY-MM-DD",
  "days": [
    {
      "date": "YYYY-MM-DD",
      "meals": [
        {
          "name": "string",
          "ingredients": ["string", "string"],
          "macros": { "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number },
          "instructions_url": "string | null"
        }
      ],
      "totals": { "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number }
    }
  ],
  "shopping_list": [
    { "item": "string", "quantity": number, "unit": "string", "category": "produce|protein|dairy|grains|pantry|spices|other" }
  ]
}

User goals: ${JSON.stringify(goals)}\nPreferences: ${JSON.stringify(preferences)}\nCalories target per day: ${calories_target || 'auto'}\nPlan dates: ${plan_start} to ${plan_end}. Ensure day dates are within range and totals per day roughly match the target.`;

    let planJson: any = null;

    if (OPENAI_API_KEY) {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            { role: 'system', content: 'You are a meal planning assistant. Always return strict JSON only.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.5,
          max_tokens: 1800,
        }),
      });

      const text = await resp.text();
      if (!resp.ok) {
        console.error('OpenAI error', resp.status, text);
      }
      // Try parse JSON (strip code fences if any)
      const cleaned = text.trim().replace(/^```(json)?/i, '').replace(/```$/i, '');
      try {
        const parsed = JSON.parse(cleaned);
        planJson = parsed;
      } catch (e) {
        console.error('Failed to parse plan JSON', e);
      }
    }

    // If we still don't have a plan, make a minimal fallback
    if (!planJson) {
      const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const date = toISODate(d);
        return {
          date,
          meals: [
            {
              name: 'Oatmeal with Berries',
              ingredients: ['rolled oats', 'berries', 'milk or water', 'honey'],
              macros: { calories: 350, protein_g: 12, carbs_g: 55, fat_g: 8 },
              instructions_url: null,
            },
            {
              name: 'Grilled Chicken Salad',
              ingredients: ['chicken breast', 'mixed greens', 'olive oil', 'lemon'],
              macros: { calories: 500, protein_g: 35, carbs_g: 20, fat_g: 25 },
              instructions_url: null,
            },
            {
              name: 'Salmon, Rice & Broccoli',
              ingredients: ['salmon', 'rice', 'broccoli', 'soy sauce'],
              macros: { calories: 650, protein_g: 35, carbs_g: 60, fat_g: 25 },
              instructions_url: null,
            },
          ],
          totals: { calories: 1500, protein_g: 82, carbs_g: 135, fat_g: 58 },
        };
      });
      planJson = {
        plan_start,
        plan_end,
        days,
        shopping_list: [
          { item: 'chicken breast', quantity: 7, unit: 'servings', category: 'protein' },
          { item: 'rice', quantity: 7, unit: 'cups', category: 'grains' },
          { item: 'broccoli', quantity: 7, unit: 'cups', category: 'produce' },
        ],
      };
    }

    // Persist
    const title = body?.title || `Meal Plan – Week of ${planJson.plan_start || plan_start}`;
    const insertPayload = {
      user_id,
      title,
      plan_start: planJson.plan_start || plan_start,
      plan_end: planJson.plan_end || plan_end,
      goals,
      preferences,
      total_daily_targets: calories_target ? { calories: calories_target } : null,
      meals: planJson.days,
      shopping_list: planJson.shopping_list,
      status: 'active',
    };

    const { data: saved, error: saveErr } = await supabase
      .from('meal_plans')
      .insert(insertPayload)
      .select('*')
      .single();

    if (saveErr) throw saveErr;

    return new Response(JSON.stringify({ plan: saved }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('plan-meals error', e);
    return new Response(JSON.stringify({ error: e?.message || 'Internal error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
