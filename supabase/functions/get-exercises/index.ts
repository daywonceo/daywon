
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
    
    let url = 'https://api.api-ninjas.com/v1/exercises';
    const params = new URLSearchParams();
    
    if (muscle) params.append('muscle', muscle);
    if (difficulty) params.append('difficulty', difficulty);
    if (type) params.append('type', type);
    if (name) params.append('name', name);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    console.log('Fetching exercises from:', url);

    const response = await fetch(url, {
      headers: {
        'X-Api-Key': Deno.env.get('API_NINJAS_KEY') || '',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
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
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
