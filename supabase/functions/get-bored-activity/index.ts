
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    
    // Build the BoredAPI URL
    let apiUrl = 'https://www.boredapi.com/api/activity'
    if (type && type !== 'any') {
      apiUrl += `?type=${type}`
    }

    console.log('Fetching from BoredAPI:', apiUrl)
    
    // Fetch from BoredAPI
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      throw new Error(`BoredAPI responded with status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('BoredAPI response:', data)

    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error fetching from BoredAPI:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch activity',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
