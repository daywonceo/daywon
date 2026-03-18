import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const BASE_PROMPT = `You are an elite endurance sports coach. Today is ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}. Be direct, specific, warm. Use markdown.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { section, profile, courseContext, planWeeks } = await req.json();

    if (!section || !profile) {
      return new Response(JSON.stringify({ error: 'Missing required fields: section, profile' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const weeks = planWeeks || 16;

    // Build section-specific system prompts
    const sectionPrompts: Record<string, string> = {
      training: `${BASE_PROMPT}\n\nATHLETE: ${profile}${courseContext || ''}\n\nGenerate a COMPLETE week-by-week training plan covering ALL ${weeks} weeks — do not stop early.\n1. 2-sentence athlete assessment + timeline flags.\n2. Phase headers: ## [emoji] Phase — Weeks X–Y, one sentence on what it builds.\n3. EVERY week from Week 1 to Week ${weeks}:\n**Week N** *(dates)*\nFocus: [note]\n• Workout 1 — type/dist/pace\n• Workout 2\n• Workout 3\n4. Race Week block at end.\n${weeks > 20 ? `\nFORMAT RULE: This is a ${weeks}-week plan. Keep each week to 4 lines max. Brevity is essential — you must reach Week ${weeks} and Race Week.` : '\nBe thorough for each week.'}`,

      nutrition: `${BASE_PROMPT}\n\nATHLETE: ${profile}${courseContext || ''}\n\nNUTRITION section.\n## Daily Targets — 3–4 sentences: calories training vs rest, macros in grams, why each.\n## The Plate Guide — one paragraph on proportions.\n## Foods Worth Prioritizing — 8 items: - **Food** — why\n## Balance Is the Strategy — 4–5 sentences endorsing 1–2 fun meals/week with examples.\n## Hydration — one sentence: daily target + electrolytes.`,

      fueling: `${BASE_PROMPT}\n\nATHLETE: ${profile}${courseContext || ''}\n\nFUELING section.\n## Why Your Body Needs Fuel — 4–5 sentences: glycogen, bonking, calorie burn.\n## Training Fueling Rules — under/over threshold rules.\n## Race Day Schedule — hour/segment by hour, one line each.\n## Best Pick Per Category — Gel / Chews / Real Food / Drink: product + one reason.\n## Gut Training — 3 sentences: what, why, how.`,

      mental: `${BASE_PROMPT}\n\nATHLETE: ${profile}${courseContext || ''}\n\nMENTAL PERFORMANCE section — deeply personal, emotionally resonant.\n\n## Pre-Race Visualization\nWrite a vivid 2nd-person script (5–7 sentences) for the night before. Include a hard patch and the finish.\n\n## Race Day Mantras\n6 personalized mantras:\n- **"[mantra]"** — [when to use it]\n\n## The Dark Patch Protocol\nAction plan for when they want to quit. What to think, say, do, and the reframe. 2nd person. 6–8 sentences.`,

      recovery: `${BASE_PROMPT}\n\nATHLETE: ${profile}\n\nPOST-RACE RECOVERY — 4 weeks.\n## The First 48 Hours — body response, what to eat, sleep, what not to do.\n## Week 1 — Celebrate & Rest — movement, food, sleep, warning signs.\n## Week 2 — Gentle Return — first easy movement, what "easy" means.\n## Week 3 — Rebuild Begins — first structured workout, readiness gauge.\n## Week 4 — Assess & Look Ahead — return criteria, next goal.\n## Are You Really Recovered? — 5 specific clinical signs.`,

      rebuild: `${BASE_PROMPT}\n\nATHLETE: ${profile}${courseContext || ''}\n\nThis athlete missed training days. Rebuild their plan from today forward. Acknowledge warmly in one sentence then regenerate a complete week-by-week plan to race day — no cramming, no injury risk. Adjust volume intelligently. Same format: phase headers, weekly blocks with 3 bullet workouts.`,
    };

    const systemPrompt = sectionPrompts[section];
    if (!systemPrompt) {
      return new Response(JSON.stringify({ error: `Unknown section: ${section}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const trainingTokens = Math.min(8000, Math.max(4000, weeks * 180));
    const maxTokens = section === 'training' || section === 'rebuild' ? trainingTokens : 4000;

    console.log(`Generating race training plan section: ${section}, tokens: ${maxTokens}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate this section now, be thorough.' },
        ],
        temperature: 0.7,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required, please add funds to your Lovable AI workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI gateway error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    console.log(`Section ${section} generated: ${content.length} chars`);

    return new Response(JSON.stringify({ content, section }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-race-training-plan:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
