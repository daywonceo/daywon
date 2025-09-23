import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user is authenticated and get their info
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin privileges (you'll need to implement your admin check logic)
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // For now, we'll use a simple check - in production, implement proper admin role checking
    const isAdmin = profile?.email?.endsWith('@admin.com') || false; // Replace with your admin logic
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin privileges required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'POST') {
      const { target_user_id, new_username, reason } = await req.json();

      if (!target_user_id || !new_username) {
        return new Response(
          JSON.stringify({ error: 'target_user_id and new_username are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Admin ${user.id} attempting to reset username for user ${target_user_id} to ${new_username}. Reason: ${reason || 'Not provided'}`);

      // Get current user data for history
      const { data: targetProfile } = await supabase
        .from('profiles')
        .select('username, username_history')
        .eq('id', target_user_id)
        .single();

      if (!targetProfile) {
        return new Response(
          JSON.stringify({ error: 'Target user not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate new username format
      const { data: validationResult, error: validationError } = await supabase
        .rpc('validate_username_enhanced', { 
          username_input: new_username, 
          user_id: target_user_id 
        });

      if (validationError) {
        console.error('Validation error:', validationError);
        return new Response(
          JSON.stringify({ error: 'Username validation failed', details: validationError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!validationResult.valid) {
        return new Response(
          JSON.stringify({ 
            error: 'Username is invalid', 
            details: validationResult.message,
            code: validationResult.error 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update username with admin override (bypasses rate limiting)
      const currentHistory = targetProfile.username_history || [];
      const newHistory = [
        ...currentHistory,
        {
          username: targetProfile.username,
          changed_at: new Date().toISOString(),
          changed_by_admin: user.id,
          reason: reason || 'Admin reset'
        }
      ];

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: new_username,
          username_history: newHistory,
          name_changed_at: new Date().toISOString()
        })
        .eq('id', target_user_id);

      if (updateError) {
        console.error('Update error:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update username', details: updateError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Successfully reset username for user ${target_user_id} from ${targetProfile.username} to ${new_username}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Username reset successfully',
          old_username: targetProfile.username,
          new_username: new_username
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})