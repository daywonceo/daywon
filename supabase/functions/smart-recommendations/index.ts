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

    const { category } = await req.json();

    console.log('Generating smart recommendations for category:', category);

    // Get user's activity history and preferences
    const { data: habits } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active');

    const { data: activities } = await supabase
      .from('habit_activities')
      .select('*')
      .eq('user_id', user.id)
      .order('activity_date', { ascending: false })
      .limit(30);

    const systemPrompt = `You are a personalized recommendation engine for activities, books, podcasts, and resources. Provide tailored suggestions based on user interests and habits.

Generate recommendations in JSON format:
{
  "recommendations": [
    {
      "title": "Item title",
      "type": "book/podcast/video/article/activity",
      "description": "Why this is recommended",
      "category": "Category",
      "time_commitment": "Time needed",
      "difficulty": "easy/medium/hard",
      "link": "URL (if applicable)",
      "why_recommended": "Personal reason for this user",
      "tags": ["tag1", "tag2"]
    }
  ],
  "summary": "Brief overview of recommendations"
}`;

    let userPrompt = '';
    
    if (category === 'reading') {
      userPrompt = `Recommend books for someone with these habits: ${habits?.map(h => h.name).join(', ')}

Focus on:
- Personal development
- Health and fitness
- Spiritual growth
- Productivity
- Science and psychology

Provide 5-7 specific book recommendations that align with their interests.`;

    } else if (category === 'podcasts') {
      userPrompt = `Recommend podcasts for someone with these habits: ${habits?.map(h => h.name).join(', ')}

Focus on:
- Health and wellness
- Personal growth
- Motivation
- Science and learning
- Spirituality

Provide 5-7 specific podcast recommendations.`;

    } else if (category === 'activities') {
      userPrompt = `Recommend new activities and habits for someone currently tracking: ${habits?.map(h => h.name).join(', ')}

Recent engagement: ${activities && activities.length > 0 ? 
        `Active in ${activities.filter(a => a.status === 'completed').length} of ${activities.length} recent activities` : 
        'Building new habits'}

Suggest complementary activities that would enhance their current routine.`;

    } else if (category === 'learning') {
      userPrompt = `Recommend learning resources (courses, videos, articles) for someone with these interests: ${habits?.map(h => h.name).join(', ')}

Focus on skills and knowledge that would support their habit journey.`;
    }

    console.log('Calling Lovable AI for recommendations...');

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
    
    console.log('Recommendations generated');

    // Parse the JSON response
    let recommendations;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing recommendations:', parseError);
      throw new Error('Failed to parse recommendations');
    }

    return new Response(JSON.stringify({ ...recommendations, category }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in smart-recommendations:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});