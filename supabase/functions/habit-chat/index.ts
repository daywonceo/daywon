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

    const { messages, action } = await req.json();

    console.log('Chat request from user:', user.id, 'Action:', action || 'chat');

    // Get user's current habits and recent activities for context
    const { data: habits } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active');

    const today = new Date().toISOString().split('T')[0];
    const { data: todayActivities } = await supabase
      .from('habit_activities')
      .select('*')
      .eq('user_id', user.id)
      .eq('activity_date', today);

    // Calculate stats for context
    const completedToday = todayActivities?.filter(a => a.status === 'completed').length || 0;
    const totalHabits = habits?.length || 0;

    const systemPrompt = `You are an enthusiastic AI habit coach assistant. You help users:
1. Track and log their habits through natural conversation
2. Get insights about their progress and patterns
3. Receive motivation and encouragement
4. Create new habits or modify existing ones
5. Answer questions about their habit journey

Current User Context:
- Active Habits: ${habits?.map(h => h.name).join(', ') || 'None'}
- Completed Today: ${completedToday}/${totalHabits}

When users want to log habits, respond with enthusiasm and use this format at the end of your message:
ACTION: LOG_HABIT | habit_name | status (completed/failed)

When users want to create a new habit, use:
ACTION: CREATE_HABIT | habit_name | description | category

When users want insights, use:
ACTION: GET_INSIGHTS

Keep responses conversational, encouraging, and concise (2-3 sentences max).`;

    console.log('Calling Lovable AI for conversation...');

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
          ...messages
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
    const assistantMessage = data.choices[0].message.content;
    
    console.log('Chat response generated');

    // Parse any actions from the response
    let parsedAction = null;
    const actionMatch = assistantMessage.match(/ACTION:\s*([A-Z_]+)(?:\s*\|\s*(.+))?/);
    
    if (actionMatch) {
      const [, actionType, actionData] = actionMatch;
      parsedAction = {
        type: actionType,
        data: actionData ? actionData.split('|').map(s => s.trim()) : []
      };
      
      // Execute the action
      if (actionType === 'LOG_HABIT' && actionData) {
        const [habitName, status] = actionData.split('|').map(s => s.trim());
        const habit = habits?.find(h => h.name.toLowerCase() === habitName.toLowerCase());
        
        if (habit) {
          await supabase
            .from('habit_activities')
            .upsert({
              user_id: user.id,
              habit_id: habit.id,
              habit_name: habit.name,
              activity_date: today,
              status: status || 'completed'
            }, {
              onConflict: 'user_id,habit_id,activity_date'
            });
          
          console.log('Habit logged:', habitName, status);
        }
      }
    }

    // Remove action text from display message
    const displayMessage = assistantMessage.replace(/ACTION:.*$/, '').trim();

    return new Response(JSON.stringify({ 
      message: displayMessage,
      action: parsedAction
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in habit-chat:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});