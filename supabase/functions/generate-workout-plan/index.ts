
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WorkoutPlanRequest {
  planType: string;
  difficulty?: string;
}

const workoutSplits = {
  push_pull_legs: {
    push: ['chest', 'shoulders', 'triceps'],
    pull: ['lats', 'traps', 'biceps'],
    legs: ['quadriceps', 'hamstrings', 'calves', 'glutes']
  },
  upper_lower: {
    upper: ['chest', 'shoulders', 'lats', 'traps', 'biceps', 'triceps'],
    lower: ['quadriceps', 'hamstrings', 'calves', 'glutes']
  },
  full_body: {
    full_body: ['chest', 'shoulders', 'lats', 'quadriceps', 'hamstrings', 'biceps', 'triceps']
  },
  chest_back_shoulders_arms_legs: {
    chest_back: ['chest', 'lats', 'traps'],
    shoulders_arms: ['shoulders', 'biceps', 'triceps'],
    legs: ['quadriceps', 'hamstrings', 'calves', 'glutes']
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { planType, difficulty = 'beginner' } = await req.json() as WorkoutPlanRequest;
    
    console.log('Generating workout plan for:', planType, difficulty);
    
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
    
    const split = workoutSplits[planType as keyof typeof workoutSplits];
    if (!split) {
      throw new Error('Invalid workout plan type');
    }

    const workoutPlan = {};
    
    for (const [workoutName, muscles] of Object.entries(split)) {
      const exercises = [];
      
      for (const muscle of muscles) {
        try {
          const response = await fetch(`https://api.api-ninjas.com/v1/exercises?muscle=${muscle}&difficulty=${difficulty}`, {
            headers: {
              'X-Api-Key': apiKey,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const muscleExercises = await response.json();
            // Take 1-2 exercises per muscle group
            exercises.push(...muscleExercises.slice(0, 2));
          } else {
            console.error(`Failed to fetch exercises for ${muscle}: ${response.status}`);
          }
        } catch (error) {
          console.error(`Error fetching exercises for ${muscle}:`, error);
        }
      }
      
      workoutPlan[workoutName] = {
        exercises: exercises.slice(0, 8), // Limit to 8 exercises per workout
        estimatedDuration: exercises.length * 4 + 10 // ~4 min per exercise + 10 min warmup/cooldown
      };
    }

    console.log('Generated workout plan:', Object.keys(workoutPlan));

    return new Response(
      JSON.stringify(workoutPlan),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error generating workout plan:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
