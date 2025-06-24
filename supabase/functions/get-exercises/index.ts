
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExerciseRequest {
  muscle?: string;
  difficulty?: string;
  type?: string;
  name?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { muscle, difficulty, type, name } = await req.json() as ExerciseRequest;
    
    const apiKey = Deno.env.get('API_NINJAS_KEY');
    if (!apiKey) {
      console.error('API_NINJAS_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      )
    }
    
    let url = 'https://api.api-ninjas.com/v1/exercises';
    const params = new URLSearchParams();
    
    // Map muscle group names to API-compatible values
    const muscleMapping: Record<string, string> = {
      'chest': 'chest',
      'lats': 'lats',
      'traps': 'traps',
      'shoulders': 'shoulders',
      'biceps': 'biceps',
      'triceps': 'triceps',
      'quadriceps': 'quadriceps',
      'hamstrings': 'hamstrings',
      'glutes': 'glutes',
      'calves': 'calves',
      'abdominals': 'abdominals',
      'lower_back': 'lower_back',
      'middle_back': 'middle_back'
    };
    
    if (muscle && muscleMapping[muscle]) {
      params.append('muscle', muscleMapping[muscle]);
    } else if (muscle) {
      // If muscle is not in mapping, try the original value
      params.append('muscle', muscle);
    }
    
    if (difficulty) params.append('difficulty', difficulty);
    if (type) params.append('type', type);
    if (name) params.append('name', name);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    console.log('Fetching exercises from:', url);

    const response = await fetch(url, {
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`API request failed: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('API error response:', errorText);
      
      // Return empty array instead of throwing error to allow graceful fallback
      return new Response(
        JSON.stringify([]),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    const exercises = await response.json();
    console.log('Exercises fetched:', exercises.length);

    return new Response(
      JSON.stringify(exercises),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error fetching exercises:', error);
    // Return empty array instead of error to allow graceful fallback
    return new Response(
      JSON.stringify([]),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  }
})
