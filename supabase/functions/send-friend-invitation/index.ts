import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Create Supabase client with user's auth token
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { email, message }: InvitationRequest = await req.json();

    // Validate email
    if (!email || !email.includes("@")) {
      throw new Error("Invalid email address");
    }

    // Check if user is already registered
    const { data: existingProfile } = await supabaseClient
      .from("profiles")
      .select("id, email")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (existingProfile) {
      return new Response(
        JSON.stringify({ 
          error: "User already registered",
          userId: existingProfile.id 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get inviter's profile
    const { data: inviterProfile } = await supabaseClient
      .from("profiles")
      .select("display_name, email")
      .eq("id", user.id)
      .single();

    // Generate unique token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // Create invitation record
    const { error: inviteError } = await supabaseClient
      .from("friend_invitations")
      .insert({
        inviter_id: user.id,
        email: email.toLowerCase(),
        token,
        expires_at: expiresAt.toISOString(),
      });

    if (inviteError) {
      console.error("Error creating invitation:", inviteError);
      throw new Error("Failed to create invitation");
    }

    // Create invitation link
    const appUrl = "https://174b4693-b539-4415-85b6-f15f0d4d07a6.lovableproject.com";
    const inviteLink = `${appUrl}/signup?invite=${token}`;

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "Daywon <onboarding@resend.dev>",
      to: [email],
      subject: `${inviterProfile?.display_name || "Your friend"} invited you to join Daywon!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">You're invited to join Daywon!</h1>
          
          <p style="font-size: 16px; color: #555;">
            ${inviterProfile?.display_name || "Your friend"} has invited you to join Daywon, 
            the habit tracking and personal growth platform.
          </p>
          
          ${message ? `
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-style: italic; color: #666;">
                "${message}"
              </p>
            </div>
          ` : ''}
          
          <p style="font-size: 16px; color: #555;">
            Click the link below to create your account and connect with ${inviterProfile?.display_name || "your friend"}:
          </p>
          
          <a href="${inviteLink}" 
             style="display: inline-block; background-color: #4F46E5; color: white; 
                    padding: 12px 24px; text-decoration: none; border-radius: 6px; 
                    font-weight: bold; margin: 20px 0;">
            Accept Invitation
          </a>
          
          <p style="font-size: 14px; color: #888; margin-top: 30px;">
            This invitation will expire in 7 days. If you didn't expect this invitation, 
            you can safely ignore this email.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        inviteLink,
        expiresAt: expiresAt.toISOString()
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-friend-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: error.message === "Unauthorized" ? 401 : 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);