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

    console.log('Generating personalized meal plan for user:', user.id);

    // Get user's saved recipes for personalization
    const { data: savedRecipes } = await supabase
      .from('saved_recipes')
      .select('*')
      .eq('user_id', user.id)
      .limit(10);

    const systemPrompt = `You are a professional nutritionist and meal planning expert. Create personalized, healthy meal plans based on user preferences and dietary goals.

Generate a weekly meal plan in the following JSON format:
{
  "plan": {
    "name": "Plan name",
    "total_calories_daily": 2000,
    "macros": {
      "protein": "30%",
      "carbs": "40%",
      "fats": "30%"
    },
    "description": "Brief overview"
  },
  "meals": [
    {
      "day": "Monday",
      "breakfast": {
        "name": "Meal name",
        "calories": 400,
        "protein": 20,
        "carbs": 40,
        "fats": 15,
        "ingredients": ["ingredient1", "ingredient2"],
        "instructions": "Brief cooking instructions"
      },
      "lunch": { /* same structure */ },
      "dinner": { /* same structure */ },
      "snacks": [{ /* smaller portions */ }]
    }
  ],
  "shopping_list": {
    "proteins": ["chicken", "fish"],
    "vegetables": ["broccoli", "spinach"],
    "carbs": ["rice", "oats"],
    "other": ["olive oil", "spices"]
  },
  "meal_prep_tips": "How to prep meals ahead"
}`;

    const userPrompt = `Create a personalized weekly meal plan with these preferences:
Goal: ${preferences.goal || 'maintain weight'}
Diet type: ${preferences.dietType || 'balanced'}
Calories: ${preferences.calories || 2000} per day
Restrictions: ${preferences.restrictions || 'none'}
Cuisine preferences: ${preferences.cuisinePreferences || 'varied'}
Cooking time: ${preferences.cookingTime || 'moderate'}
Meal prep: ${preferences.mealPrep ? 'yes' : 'no'}

${savedRecipes && savedRecipes.length > 0 ? `User likes these recipes: ${savedRecipes.slice(0, 3).map(r => r.recipe_title).join(', ')}` : ''}

Create a delicious, nutritious, and practical meal plan.`;

    console.log('Calling Lovable AI for meal plan generation...');

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
    
    console.log('Meal plan generated');

    // Parse the JSON response
    let mealPlan;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        mealPlan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing meal plan:', parseError);
      throw new Error('Failed to parse meal plan');
    }

    // Save the meal plan to database
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const { data: savedPlan, error: saveError } = await supabase
      .from('meal_plans')
      .insert({
        user_id: user.id,
        title: mealPlan.plan.name,
        plan_start: startDate.toISOString().split('T')[0],
        plan_end: endDate.toISOString().split('T')[0],
        goals: { calories: mealPlan.plan.total_calories_daily, ...preferences },
        preferences: preferences,
        total_daily_targets: mealPlan.plan.macros,
        meals: mealPlan.meals,
        shopping_list: mealPlan.shopping_list,
        status: 'active'
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving meal plan:', saveError);
    } else {
      console.log('Meal plan saved:', savedPlan.id);
      mealPlan.plan.id = savedPlan.id;
    }

    return new Response(JSON.stringify({ mealPlan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-personalized-meal-plan:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});