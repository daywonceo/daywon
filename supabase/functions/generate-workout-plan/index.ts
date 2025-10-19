
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Fallback exercises when API fails
const fallbackExercises = {
  chest: [
    { name: "Push-ups", type: "strength", muscle: "chest", equipment: "body_only", difficulty: "beginner", instructions: "Start in plank position, lower body to ground, push back up" },
    { name: "Incline Push-ups", type: "strength", muscle: "chest", equipment: "body_only", difficulty: "beginner", instructions: "Place hands on elevated surface, perform push-up motion" }
  ],
  shoulders: [
    { name: "Pike Push-ups", type: "strength", muscle: "shoulders", equipment: "body_only", difficulty: "intermediate", instructions: "Start in downward dog position, lower head toward ground" },
    { name: "Arm Circles", type: "strength", muscle: "shoulders", equipment: "body_only", difficulty: "beginner", instructions: "Extend arms, make small to large circles" }
  ],
  lats: [
    { name: "Pull-ups", type: "strength", muscle: "lats", equipment: "pull_up_bar", difficulty: "intermediate", instructions: "Hang from bar, pull body up until chin over bar" },
    { name: "Superman", type: "strength", muscle: "lats", equipment: "body_only", difficulty: "beginner", instructions: "Lie face down, lift chest and arms off ground" }
  ],
  triceps: [
    { name: "Tricep Dips", type: "strength", muscle: "triceps", equipment: "body_only", difficulty: "beginner", instructions: "Sit on edge, lower body using arms, push back up" },
    { name: "Diamond Push-ups", type: "strength", muscle: "triceps", equipment: "body_only", difficulty: "intermediate", instructions: "Push-ups with hands forming diamond shape" }
  ],
  biceps: [
    { name: "Chin-ups", type: "strength", muscle: "biceps", equipment: "pull_up_bar", difficulty: "intermediate", instructions: "Hang with palms facing you, pull up" },
    { name: "Hammer Curls", type: "strength", muscle: "biceps", equipment: "dumbbells", difficulty: "beginner", instructions: "Hold weights with neutral grip, curl up" }
  ],
  quadriceps: [
    { name: "Bodyweight Squats", type: "strength", muscle: "quadriceps", equipment: "body_only", difficulty: "beginner", instructions: "Stand with feet shoulder-width apart, squat down and up" },
    { name: "Lunges", type: "strength", muscle: "quadriceps", equipment: "body_only", difficulty: "beginner", instructions: "Step forward, lower back knee toward ground" }
  ],
  hamstrings: [
    { name: "Single-leg Deadlift", type: "strength", muscle: "hamstrings", equipment: "body_only", difficulty: "intermediate", instructions: "Stand on one leg, hinge at hip, reach toward ground" },
    { name: "Glute Bridge", type: "strength", muscle: "hamstrings", equipment: "body_only", difficulty: "beginner", instructions: "Lie on back, lift hips up" }
  ],
  glutes: [
    { name: "Glute Bridge", type: "strength", muscle: "glutes", equipment: "body_only", difficulty: "beginner", instructions: "Lie on back, squeeze glutes and lift hips" },
    { name: "Clamshells", type: "strength", muscle: "glutes", equipment: "body_only", difficulty: "beginner", instructions: "Lie on side, lift top knee while keeping feet together" }
  ],
  calves: [
    { name: "Calf Raises", type: "strength", muscle: "calves", equipment: "body_only", difficulty: "beginner", instructions: "Stand tall, rise up on toes, lower slowly" },
    { name: "Jump Rope", type: "cardio", muscle: "calves", equipment: "body_only", difficulty: "beginner", instructions: "Jump continuously with light bounces on balls of feet" }
  ]
};

interface WorkoutRequest {
  planType: string;
  difficulty: string;
}

const fetchExercises = async (muscle: string, difficulty: string = 'beginner') => {
  console.log(`Fetching exercises for muscle: ${muscle}, difficulty: ${difficulty}`);
  
  try {
    // First, try to fetch from local exercise library
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data: libraryExercises, error } = await supabase
        .from('exercise_library')
        .select('*')
        .eq('muscle_group', muscle)
        .eq('difficulty', difficulty)
        .limit(4);
      
      if (!error && libraryExercises && libraryExercises.length > 0) {
        console.log(`Found ${libraryExercises.length} exercises in local library`);
        // Transform to match expected format
        return libraryExercises.map(ex => ({
          name: ex.name,
          type: ex.exercise_type,
          muscle: ex.muscle_group,
          equipment: ex.equipment,
          difficulty: ex.difficulty,
          instructions: ex.instructions
        }));
      }
    }
    
    // If local library has no results, try external API via edge function
    try {
      const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/get-exercises`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
        },
        body: JSON.stringify({ muscle, difficulty })
      });

      if (response.ok) {
        const exercises = await response.json();
        if (exercises && exercises.length > 0) {
          console.log(`Fetched ${exercises.length} exercises from API`);
          return exercises.slice(0, 4);
        }
      }
    } catch (apiError) {
      console.warn('External API call failed, using fallback');
    }
    
    // Use fallback exercises
    console.log(`Using fallback exercises for ${muscle}`);
    return fallbackExercises[muscle as keyof typeof fallbackExercises] || [];
  } catch (error) {
    console.error(`Error fetching exercises for ${muscle}:`, error);
    return fallbackExercises[muscle as keyof typeof fallbackExercises] || [];
  }
};

const generateWorkoutPlan = async (planType: string, difficulty: string) => {
  const workoutPlans: Record<string, string[]> = {
    push_pull_legs: ['push', 'pull', 'legs'],
    upper_lower: ['upper', 'lower'],
    full_body: ['full_body'],
    chest_back_shoulders_arms_legs: ['chest_back', 'shoulders_arms', 'legs']
  };

  const muscleGroups: Record<string, string[]> = {
    push: ['chest', 'shoulders', 'triceps'],
    pull: ['lats', 'biceps'],
    legs: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
    upper: ['chest', 'lats', 'shoulders', 'biceps', 'triceps'],
    lower: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
    full_body: ['chest', 'lats', 'shoulders', 'biceps', 'triceps', 'quadriceps', 'hamstrings', 'glutes'],
    chest_back: ['chest', 'lats'],
    shoulders_arms: ['shoulders', 'biceps', 'triceps'],
  };

  const workoutTypes = workoutPlans[planType] || ['full_body'];
  console.log('Generated workout plan:', workoutTypes);

  const plan: Record<string, any> = {};

  for (const workoutType of workoutTypes) {
    const muscles = muscleGroups[workoutType] || [];
    const exercises: any[] = [];

    for (const muscle of muscles) {
      const muscleExercises = await fetchExercises(muscle, difficulty);
      exercises.push(...muscleExercises);
    }

    plan[workoutType] = {
      exercises: exercises.slice(0, 8), // Limit total exercises per workout
      estimatedDuration: Math.max(10, Math.min(60, exercises.length * 3)) // 3 minutes per exercise, min 10, max 60
    };
  }

  return plan;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { planType, difficulty } = await req.json() as WorkoutRequest;
    
    console.log('Generating workout plan for:', planType, difficulty);
    
    const workoutPlan = await generateWorkoutPlan(planType, difficulty);
    
    console.log('Workout plan generated:', workoutPlan);

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
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
