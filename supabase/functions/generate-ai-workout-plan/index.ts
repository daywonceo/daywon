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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { preferences } = await req.json();

    console.log('Generating AI workout plan for user:', user.id);

    // Get user's workout history
    const { data: workoutHistory } = await supabase
      .from('workout_sessions')
      .select('*, exercise_logs(*)')
      .eq('user_id', user.id)
      .order('workout_date', { ascending: false })
      .limit(10);

    // Get user progress
    const { data: userProgress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id);

    const systemPrompt = `You are an expert fitness coach and workout program designer. Create personalized workout plans based on user preferences, history, and progress.

Generate a comprehensive workout plan in the following JSON format:
{
  "plan": {
    "name": "Plan name",
    "duration_weeks": 4-12,
    "description": "Brief overview",
    "goal": "Primary goal",
    "difficulty": "beginner/intermediate/advanced"
  },
  "weekly_schedule": [
    {
      "day": "Monday",
      "workout_type": "Type",
      "duration_minutes": 45,
      "focus": "Muscle groups/cardio",
      "exercises": [
        {
          "name": "Exercise name",
          "sets": 3,
          "reps": "12-15",
          "rest_seconds": 60,
          "notes": "Form tips"
        }
      ]
    }
  ],
  "progression": "How to progress week by week",
  "nutrition_tips": "Diet recommendations",
  "recovery": "Rest and recovery guidance"
}`;

    const userPrompt = `Create a personalized workout plan with these preferences:
Fitness Level: ${preferences.fitnessLevel || 'intermediate'}
Goals: ${preferences.goals || 'general fitness'}
Days per week: ${preferences.daysPerWeek || 3}
Duration per session: ${preferences.duration || 45} minutes
Equipment: ${preferences.equipment || 'full gym'}
Focus areas: ${preferences.focusAreas || 'full body'}

${workoutHistory && workoutHistory.length > 0 ? `Recent workout history: ${workoutHistory.slice(0, 3).map(w => w.workout_type).join(', ')}` : ''}

${userProgress && userProgress.length > 0 ? `Current strength levels (recent exercises): ${userProgress.slice(0, 3).map(p => `${p.exercise_name}: ${p.current_weight_lbs}lbs`).join(', ')}` : ''}

Create a detailed, progressive workout plan that matches their level and goals.`;

    console.log('Calling Lovable AI for workout plan generation...');

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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('Workout plan generated');

    // Parse the JSON response
    let workoutPlan;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        workoutPlan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing workout plan:', parseError);
      throw new Error('Failed to parse workout plan');
    }

    // Save the workout plan to database
    const { data: savedPlan, error: saveError } = await supabase
      .from('workout_plans')
      .insert({
        user_id: user.id,
        name: workoutPlan.plan.name,
        plan_type: workoutPlan.plan.goal,
        is_active: true
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving workout plan:', saveError);
    } else {
      console.log('Workout plan saved:', savedPlan.id);
      workoutPlan.plan.id = savedPlan.id;
    }

    return new Response(JSON.stringify({ workoutPlan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-ai-workout-plan:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});