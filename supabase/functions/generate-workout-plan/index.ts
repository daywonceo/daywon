
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
  try {
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/get-exercises`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
      },
      body: JSON.stringify({ muscle, difficulty })
    });

    if (!response.ok) {
      console.error(`Failed to fetch exercises for ${muscle}: ${response.status}`);
      return fallbackExercises[muscle as keyof typeof fallbackExercises] || [];
    }

    const exercises = await response.json();
    
    // If API returns empty or no exercises, use fallback
    if (!exercises || exercises.length === 0) {
      console.log(`No exercises returned for ${muscle}, using fallback`);
      return fallbackExercises[muscle as keyof typeof fallbackExercises] || [];
    }
    
    return exercises.slice(0, 4); // Limit to 4 exercises per muscle group
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
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
