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

    console.log('Generating daily coaching for user:', user.id);

    // Fetch today's activities
    const today = new Date().toISOString().split('T')[0];
    
    const { data: todayActivities } = await supabase
      .from('habit_activities')
      .select('*, habits(*)')
      .eq('user_id', user.id)
      .eq('activity_date', today);

    // Fetch recent streak data (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentActivities } = await supabase
      .from('habit_activities')
      .select('*')
      .eq('user_id', user.id)
      .gte('activity_date', sevenDaysAgo.toISOString().split('T')[0])
      .order('activity_date', { ascending: false });

    // Get user's active habits
    const { data: activeHabits } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active');

    // Calculate current stats
    const completedToday = todayActivities?.filter(a => a.status === 'completed').length || 0;
    const totalHabits = activeHabits?.length || 0;
    const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

    // Calculate streaks
    const habitStreaks = activeHabits?.map(habit => {
      const habitActivities = recentActivities?.filter(a => a.habit_id === habit.id) || [];
      let streak = 0;
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const activity = habitActivities.find(a => a.activity_date === dateStr);
        if (activity?.status === 'completed') {
          streak++;
        } else {
          break;
        }
      }
      return { habit: habit.name, streak };
    }) || [];

    const systemPrompt = `You are an enthusiastic and supportive habit coach. Provide personalized daily coaching based on the user's current progress.

Your coaching should:
1. Be encouraging and motivational
2. Acknowledge current progress and streaks
3. Provide specific, actionable advice for today
4. Identify potential obstacles and suggest solutions
5. Celebrate achievements and milestones

Keep responses concise (2-3 short paragraphs) and friendly.`;

    const userPrompt = `Today's Progress:
- Completed: ${completedToday}/${totalHabits} habits (${completionRate}%)
- Active Habits: ${activeHabits?.map(h => h.name).join(', ') || 'None'}
- Current Streaks: ${habitStreaks.map(s => `${s.habit} (${s.streak} days)`).join(', ') || 'None'}

Provide personalized daily coaching and motivation for today.`;

    console.log('Calling Lovable AI for daily coaching...');

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
        temperature: 0.8,
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
    const coaching = data.choices[0].message.content;
    
    console.log('Coaching generated successfully');

    return new Response(JSON.stringify({ 
      coaching,
      stats: {
        completedToday,
        totalHabits,
        completionRate,
        streaks: habitStreaks
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in daily-habit-coaching:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});