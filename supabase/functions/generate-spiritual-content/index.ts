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

    const { type, preferences } = await req.json();

    console.log('Generating spiritual content, type:', type);

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'meditation') {
      systemPrompt = `You are a mindfulness and meditation expert. Create personalized guided meditation scripts that are calming, inspiring, and effective.

Generate meditation content in JSON format:
{
  "title": "Meditation title",
  "duration_minutes": 5-20,
  "focus": "breath/body scan/loving-kindness/gratitude",
  "difficulty": "beginner/intermediate/advanced",
  "script": {
    "introduction": "Opening words (1-2 minutes)",
    "main_practice": "Core meditation (main duration)",
    "closing": "Closing words (1 minute)"
  },
  "background_music_suggestion": "Type of music/sounds",
  "benefits": ["benefit1", "benefit2"]
}`;

      userPrompt = `Create a guided meditation with:
Duration: ${preferences.duration || 10} minutes
Focus: ${preferences.focus || 'breath awareness'}
Experience level: ${preferences.level || 'beginner'}
Goal: ${preferences.goal || 'relaxation and stress relief'}
Tone: ${preferences.tone || 'calm and gentle'}

Make it peaceful, grounding, and accessible.`;

    } else if (type === 'devotional') {
      systemPrompt = `You are a spiritual writer and teacher. Create inspiring devotional content that encourages reflection, growth, and connection with faith.

Generate devotional content in JSON format:
{
  "title": "Devotional title",
  "theme": "Main theme",
  "scripture": "Relevant scripture reference and text",
  "reflection": "Main devotional content (3-5 paragraphs)",
  "prayer": "Closing prayer",
  "action_steps": ["practical application 1", "practical application 2"],
  "questions": ["reflection question 1", "reflection question 2"]
}`;

      userPrompt = `Create an inspiring devotional with:
Theme: ${preferences.theme || 'faith and perseverance'}
Length: ${preferences.length || 'medium'}
Tone: ${preferences.tone || 'encouraging'}
Focus: ${preferences.focus || 'daily living'}

Make it relevant, practical, and spiritually enriching.`;

    } else if (type === 'affirmation') {
      systemPrompt = `You are a positive psychology expert. Create powerful, personalized affirmations that build confidence and positive mindset.

Generate affirmations in JSON format:
{
  "title": "Affirmation set title",
  "category": "Category",
  "affirmations": [
    {
      "text": "I am affirmation",
      "focus": "What it addresses"
    }
  ],
  "usage_instructions": "How to use these affirmations",
  "best_times": ["morning", "before challenges"]
}`;

      userPrompt = `Create empowering affirmations for:
Focus area: ${preferences.focus || 'self-confidence'}
Number: ${preferences.count || 10} affirmations
Tone: ${preferences.tone || 'strong and positive'}
Goal: ${preferences.goal || 'daily motivation'}

Make them personal, believable, and impactful.`;
    }

    console.log('Calling Lovable AI for spiritual content generation...');

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
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('Spiritual content generated');

    // Parse the JSON response
    let content;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        content = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing content:', parseError);
      throw new Error('Failed to parse content');
    }

    return new Response(JSON.stringify({ content, type }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-spiritual-content:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});