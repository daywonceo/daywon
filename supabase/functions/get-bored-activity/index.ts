
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Fallback activities when the API is down
const fallbackActivities = [
  {
    activity: "Take a walk around your neighborhood",
    type: "recreational",
    participants: 1,
    price: 0,
    link: "",
    key: "fallback_1",
    accessibility: 0.1
  },
  {
    activity: "Read a book you've been meaning to start",
    type: "education",
    participants: 1,
    price: 0,
    link: "",
    key: "fallback_2",
    accessibility: 0.1
  },
  {
    activity: "Try a new recipe",
    type: "cooking",
    participants: 1,
    price: 0.3,
    link: "",
    key: "fallback_3",
    accessibility: 0.2
  },
  {
    activity: "Call a friend or family member",
    type: "social",
    participants: 2,
    price: 0,
    link: "",
    key: "fallback_4",
    accessibility: 0.1
  },
  {
    activity: "Practice meditation for 10 minutes",
    type: "relaxation",
    participants: 1,
    price: 0,
    link: "",
    key: "fallback_5",
    accessibility: 0.1
  },
  {
    activity: "Organize your workspace",
    type: "busywork",
    participants: 1,
    price: 0,
    link: "",
    key: "fallback_6",
    accessibility: 0.2
  },
  {
    activity: "Learn a new skill online",
    type: "education",
    participants: 1,
    price: 0,
    link: "",
    key: "fallback_7",
    accessibility: 0.3
  },
  {
    activity: "Create a playlist of your favorite songs",
    type: "music",
    participants: 1,
    price: 0,
    link: "",
    key: "fallback_8",
    accessibility: 0.1
  },
  {
    activity: "Do some stretching exercises",
    type: "recreational",
    participants: 1,
    price: 0,
    link: "",
    key: "fallback_9",
    accessibility: 0.2
  },
  {
    activity: "Write in a journal",
    type: "relaxation",
    participants: 1,
    price: 0,
    link: "",
    key: "fallback_10",
    accessibility: 0.1
  },
  {
    activity: "Learn origami",
    type: "diy",
    participants: 1,
    price: 0.1,
    link: "",
    key: "fallback_11",
    accessibility: 0.3
  },
  {
    activity: "Volunteer at a local organization",
    type: "charity",
    participants: 1,
    price: 0,
    link: "",
    key: "fallback_12",
    accessibility: 0.4
  }
];

function getRandomFallbackActivity(type?: string) {
  let filteredActivities = fallbackActivities;
  
  if (type && type !== 'any') {
    filteredActivities = fallbackActivities.filter(activity => activity.type === type);
    
    // If no activities match the type, use all activities
    if (filteredActivities.length === 0) {
      filteredActivities = fallbackActivities;
    }
  }
  
  const randomIndex = Math.floor(Math.random() * filteredActivities.length);
  return filteredActivities[randomIndex];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json();
    const type = body?.type;
    
    // Build the BoredAPI URL
    let apiUrl = 'https://www.boredapi.com/api/activity'
    if (type && type !== 'any') {
      apiUrl += `?type=${type}`
    }

    console.log('Fetching from BoredAPI:', apiUrl)
    
    // Try to fetch from BoredAPI with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BoredActivityBot/1.0)'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`BoredAPI responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('BoredAPI response:', data);

      // Validate the response has the expected structure
      if (data && data.activity) {
        return new Response(
          JSON.stringify(data),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
      } else {
        throw new Error('Invalid response format from BoredAPI');
      }
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.warn('BoredAPI is unavailable, using fallback activity:', fetchError instanceof Error ? fetchError.message : 'Unknown error');
      
      // Use fallback activity when API is down
      const fallbackActivity = getRandomFallbackActivity(type);
      
      return new Response(
        JSON.stringify({
          ...fallbackActivity,
          _fallback: true,
          _message: "Using offline suggestion (BoredAPI temporarily unavailable)"
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    
    // Last resort fallback
    const fallbackActivity = getRandomFallbackActivity();
    
    return new Response(
      JSON.stringify({
        ...fallbackActivity,
        _fallback: true,
        _message: "Using offline suggestion"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
})
