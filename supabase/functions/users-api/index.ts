import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    
    // GET /users/check-username?u=<str>
    if (req.method === 'GET' && pathParts[2] === 'check-username') {
      const username = url.searchParams.get('u')
      
      if (!username) {
        return new Response(
          JSON.stringify({ error: 'Username parameter required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: result, error } = await supabase.rpc('check_username_availability', {
        username_input: username
      })

      if (error) {
        console.error('Username check error:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to check username' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const response = {
        available: result.valid,
        ...(result.valid ? {} : { 
          reason: result.error === 'USERNAME_TAKEN' ? 'taken' : 
                  result.error === 'USERNAME_RESERVED' ? 'reserved' : 'invalid'
        })
      }

      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // PATCH /users/:id
    if (req.method === 'PATCH' && pathParts[1] === 'users' && pathParts[2]) {
      const userId = pathParts[2]
      
      // Get the authorization header
      const authHeader = req.headers.get('authorization')
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Authorization required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Set the auth header for the supabase client
      const supabaseWithAuth = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
        global: { headers: { Authorization: authHeader } }
      })

      // Verify user can update this profile
      const { data: authUser, error: authError } = await supabaseWithAuth.auth.getUser()
      if (authError || !authUser.user || authUser.user.id !== userId) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const body = await req.json()
      const { display_name, username, bio } = body

      // Get current profile
      const { data: currentProfile, error: profileError } = await supabaseWithAuth
        .from('profiles')
        .select('display_name, username, bio, name_changed_at')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.error('Profile fetch error:', profileError)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch profile' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      let updateData: any = {}
      let shouldUpdateUsername = false

      // Handle username change
      if (username && username !== currentProfile.username) {
        const { data: usernameResult, error: usernameError } = await supabase.rpc('update_username_enhanced', {
          user_id: userId,
          new_username: username
        })

        if (usernameError || !usernameResult.success) {
          const errorMessage = usernameResult?.message || 'Username update failed'
          return new Response(
            JSON.stringify({ error: errorMessage }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        shouldUpdateUsername = true
      }

      // Handle other fields
      if (display_name !== undefined) updateData.display_name = display_name
      if (bio !== undefined) updateData.bio = bio

      // Update profile if there are changes (excluding username which was handled above)
      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabaseWithAuth
          .from('profiles')
          .update(updateData)
          .eq('id', userId)

        if (updateError) {
          console.error('Profile update error:', updateError)
          return new Response(
            JSON.stringify({ error: 'Failed to update profile' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      // Fetch updated profile
      const { data: updatedProfile, error: fetchError } = await supabaseWithAuth
        .from('profiles')
        .select('id, display_name, username, bio, name_changed_at')
        .eq('id', userId)
        .single()

      if (fetchError) {
        console.error('Updated profile fetch error:', fetchError)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch updated profile' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(updatedProfile),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})