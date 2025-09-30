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

    const { habitId } = await req.json();

    console.log('Analyzing streak risk for habit:', habitId);

    // Get habit details
    const { data: habit } = await supabase
      .from('habits')
      .select('*')
      .eq('id', habitId)
      .single();

    if (!habit) {
      throw new Error('Habit not found');
    }

    // Get last 30 days of activities for this habit
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: activities } = await supabase
      .from('habit_activities')
      .select('*')
      .eq('user_id', user.id)
      .eq('habit_id', habitId)
      .gte('activity_date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('activity_date', { ascending: false });

    // Calculate recent performance metrics
    const last7Days = activities?.slice(0, 7) || [];
    const last14Days = activities?.slice(0, 14) || [];
    const completionRate7 = last7Days.filter(a => a.status === 'completed').length / 7;
    const completionRate14 = last14Days.filter(a => a.status === 'completed').length / 14;
    
    // Calculate current streak
    let currentStreak = 0;
    for (let i = 0; i < (activities?.length || 0); i++) {
      if (activities![i].status === 'completed') {
        currentStreak++;
      } else {
        break;
      }
    }

    const systemPrompt = `You are an expert at predicting habit streak risks. Analyze the habit performance data and predict the likelihood of streak break in the next 5 days.

Provide analysis in JSON format:
{
  "riskLevel": "low" | "medium" | "high",
  "probability": 0-100,
  "analysis": "Brief explanation of the risk factors",
  "interventions": ["suggestion1", "suggestion2", "suggestion3"],
  "confidence": 0-100
}`;

    const userPrompt = `Analyze this habit:
Habit: ${habit.name}
Current Streak: ${currentStreak} days
Last 7 days completion rate: ${(completionRate7 * 100).toFixed(0)}%
Last 14 days completion rate: ${(completionRate14 * 100).toFixed(0)}%
Recent pattern: ${activities?.slice(0, 7).map(a => a.status).join(', ')}

Predict the risk of streak break in next 5 days and suggest interventions.`;

    console.log('Calling Lovable AI for streak prediction...');

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
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again in a moment.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI credits depleted. Please add funds to your workspace.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('Streak prediction generated');

    // Parse the AI response
    let prediction;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        prediction = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      prediction = {
        riskLevel: 'low',
        probability: 20,
        analysis: 'Keep up the good work!',
        interventions: ['Continue your current routine'],
        confidence: 70
      };
    }

    return new Response(JSON.stringify({ 
      habit: habit.name,
      currentStreak,
      prediction
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in streak-prediction:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});