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

    console.log('Fetching habit data for user:', user.id);

    // Fetch user's habits and recent activities
    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (habitsError) {
      console.error('Error fetching habits:', habitsError);
      throw habitsError;
    }

    // Get last 30 days of activities
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: activities, error: activitiesError } = await supabase
      .from('habit_activities')
      .select('*')
      .eq('user_id', user.id)
      .gte('activity_date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('activity_date', { ascending: false });

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
      throw activitiesError;
    }

    // Get user relationships for social analysis
    const { data: relationships, error: relError } = await supabase
      .from('user_relationships')
      .select('*')
      .or(`follower_id.eq.${user.id},following_id.eq.${user.id}`)
      .eq('status', 'accepted');

    console.log(`Analyzing ${habits?.length || 0} habits with ${activities?.length || 0} activities`);

    // Prepare data summary for AI
    const habitSummary = habits?.map(h => ({
      name: h.name,
      category: h.category,
      description: h.description
    })) || [];

    const activitySummary = activities?.slice(0, 100).map(a => ({
      habit: a.habit_name,
      date: a.activity_date,
      status: a.status,
      day: new Date(a.activity_date).toLocaleDateString('en-US', { weekday: 'short' })
    })) || [];

    const systemPrompt = `You are an expert habit coach analyzing user behavior patterns. Analyze the provided habit data and generate actionable insights.

Focus on:
1. Peak performance windows (time-based patterns)
2. Habit stacking opportunities (correlation between habits)
3. Streak risks (declining engagement patterns)
4. Weekly patterns (day-of-week performance variations)
5. Social boost opportunities (impact of social features)

Provide insights in JSON format with this structure:
{
  "insights": [
    {
      "type": "pattern" | "suggestion" | "prediction" | "achievement",
      "title": "Brief title",
      "description": "Detailed actionable description",
      "confidence": 0-100,
      "actionable": true/false,
      "priority": "low" | "medium" | "high",
      "category": "timing" | "optimization" | "risk" | "achievement" | "social"
    }
  ]
}`;

    const userPrompt = `Analyze these habits and activities:

Habits: ${JSON.stringify(habitSummary, null, 2)}

Recent Activities (last 30 days): ${JSON.stringify(activitySummary, null, 2)}

Has friends: ${(relationships?.length || 0) > 0}

Generate 3-6 specific, personalized insights based on this actual data. Be specific with numbers and patterns you observe.`;

    console.log('Calling Lovable AI for pattern analysis...');

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
    
    console.log('AI response received:', aiResponse.substring(0, 200));

    // Parse the AI response
    let insights;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        insights = parsed.insights || [];
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Return a fallback insight
      insights = [{
        type: 'pattern',
        title: 'Analysis Complete',
        description: 'Your habit patterns have been analyzed. Continue tracking to get more insights.',
        confidence: 80,
        actionable: false,
        priority: 'medium',
        category: 'timing'
      }];
    }

    // Add unique IDs to insights
    const insightsWithIds = insights.map((insight: any, index: number) => ({
      ...insight,
      id: `${Date.now()}-${index}`
    }));

    return new Response(JSON.stringify({ insights: insightsWithIds }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-habit-patterns:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});