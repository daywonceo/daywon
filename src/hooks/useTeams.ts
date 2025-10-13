import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Team {
  id: string;
  challenge_id: string;
  name: string;
  description: string | null;
  captain_id: string;
  current_members: number;
  total_progress: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name: string;
    avatar_url: string;
    username: string;
  };
}

interface TeamMember {
  id: string;
  user_id: string;
  team_id: string;
  current_progress: number;
  profiles?: {
    display_name: string;
    avatar_url: string;
    username: string;
  };
}

export const useTeams = (challengeId?: string) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = async (challenge_id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('challenge_teams')
        .select(`
          *,
          profiles:captain_id (
            display_name,
            avatar_url,
            username
          )
        `)
        .eq('challenge_id', challenge_id)
        .order('total_progress', { ascending: false });

      if (fetchError) throw fetchError;
      
      setTeams(data || []);
      return { success: true, teams: data };
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error loading teams",
        description: err.message,
        variant: "destructive",
      });
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (data: {
    challenge_id: string;
    name: string;
    description?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if user is already in a team for this challenge
      const { data: existingParticipation } = await supabase
        .from('challenge_participants')
        .select('team_id')
        .eq('challenge_id', data.challenge_id)
        .eq('user_id', user.id)
        .single();

      if (existingParticipation?.team_id) {
        throw new Error('You are already in a team for this challenge');
      }

      // Create team
      const { data: newTeam, error: teamError } = await supabase
        .from('challenge_teams')
        .insert({
          challenge_id: data.challenge_id,
          name: data.name,
          description: data.description,
          captain_id: user.id,
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Update participant to join the team
      const { error: updateError } = await supabase
        .from('challenge_participants')
        .update({ team_id: newTeam.id })
        .eq('challenge_id', data.challenge_id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Team created!",
        description: `${data.name} has been created successfully.`,
      });

      if (challengeId) {
        await fetchTeams(challengeId);
      }

      return { success: true, team: newTeam };
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error creating team",
        description: err.message,
        variant: "destructive",
      });
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const joinTeam = async (teamId: string, challengeId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check team capacity
      const { data: team } = await supabase
        .from('challenge_teams')
        .select('current_members, challenge_id')
        .eq('id', teamId)
        .single();

      if (!team) throw new Error('Team not found');

      // Get challenge max team size
      const { data: challenge } = await supabase
        .from('challenges')
        .select('max_team_size')
        .eq('id', team.challenge_id)
        .single();

      if (challenge && team.current_members >= challenge.max_team_size) {
        throw new Error('Team is full');
      }

      // Update participant to join team
      const { error: updateError } = await supabase
        .from('challenge_participants')
        .update({ team_id: teamId })
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Increment team member count
      const { error: incrementError } = await supabase
        .from('challenge_teams')
        .update({ current_members: team.current_members + 1 })
        .eq('id', teamId);

      if (incrementError) throw incrementError;

      toast({
        title: "Joined team!",
        description: "You've successfully joined the team.",
      });

      if (challengeId) {
        await fetchTeams(challengeId);
      }

      return { success: true };
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error joining team",
        description: err.message,
        variant: "destructive",
      });
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const leaveTeam = async (teamId: string, challengeId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if user is team captain
      const { data: team } = await supabase
        .from('challenge_teams')
        .select('captain_id, current_members')
        .eq('id', teamId)
        .single();

      if (!team) throw new Error('Team not found');

      if (team.captain_id === user.id) {
        throw new Error('Team captain cannot leave. Please transfer captaincy first.');
      }

      // Remove from team
      const { error: updateError } = await supabase
        .from('challenge_participants')
        .update({ team_id: null })
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id)
        .eq('team_id', teamId);

      if (updateError) throw updateError;

      // Decrement team member count
      const { error: decrementError } = await supabase
        .from('challenge_teams')
        .update({ current_members: Math.max(0, team.current_members - 1) })
        .eq('id', teamId);

      if (decrementError) throw decrementError;

      toast({
        title: "Left team",
        description: "You've successfully left the team.",
      });

      if (challengeId) {
        await fetchTeams(challengeId);
      }

      return { success: true };
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error leaving team",
        description: err.message,
        variant: "destructive",
      });
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getTeamMembers = async (teamId: string): Promise<{ success: boolean; members?: TeamMember[]; error?: string }> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('challenge_participants')
        .select(`
          id,
          user_id,
          team_id,
          current_progress,
          profiles:user_id (
            display_name,
            avatar_url,
            username
          )
        `)
        .eq('team_id', teamId)
        .order('current_progress', { ascending: false });

      if (fetchError) throw fetchError;

      return { success: true, members: data as any };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    if (challengeId) {
      fetchTeams(challengeId);
    }
  }, [challengeId]);

  return {
    teams,
    loading,
    error,
    fetchTeams,
    createTeam,
    joinTeam,
    leaveTeam,
    getTeamMembers,
  };
};
