import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Crown, TrendingUp, UserPlus } from 'lucide-react';
import { useTeams } from '@/hooks/useTeams';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/shared/LoadingStates';
import { ErrorMessage } from '@/components/ui/shared/ErrorStates';

interface TeamsListProps {
  challengeId: string;
  maxTeamSize: number;
  onTeamSelect?: (teamId: string) => void;
}

const TeamsList = ({ challengeId, maxTeamSize, onTeamSelect }: TeamsListProps) => {
  const { teams, loading, fetchTeams, joinTeam, leaveTeam } = useTeams(challengeId);
  const [userTeamId, setUserTeamId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const checkUserTeam = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('challenge_participants')
        .select('team_id')
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id)
        .single();

      setUserTeamId(data?.team_id || null);
    };

    checkUserTeam();
  }, [challengeId, teams]);

  const handleJoinTeam = async (teamId: string) => {
    setActionLoading(teamId);
    const result = await joinTeam(teamId, challengeId);
    if (result.success) {
      setUserTeamId(teamId);
    }
    setActionLoading(null);
  };

  const handleLeaveTeam = async (teamId: string) => {
    setActionLoading(teamId);
    const result = await leaveTeam(teamId, challengeId);
    if (result.success) {
      setUserTeamId(null);
    }
    setActionLoading(null);
  };

  if (loading) {
    return <LoadingSpinner message="Loading teams..." />;
  }

  if (teams.length === 0) {
    return (
      <Card className="bg-card border">
        <CardContent className="p-8 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No Teams Yet</h3>
          <p className="text-sm text-muted-foreground">
            Be the first to create a team for this challenge!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {teams.map((team, index) => {
        const isUserTeam = team.id === userTeamId;
        const isFull = team.current_members >= maxTeamSize;
        const displayName = team.profiles?.display_name || 'Team Captain';

        return (
          <Card 
            key={team.id} 
            className={`bg-card border transition-all cursor-pointer hover:shadow-md ${
              isUserTeam ? 'ring-2 ring-primary border-primary' : ''
            }`}
            onClick={() => onTeamSelect?.(team.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    {index === 0 && (
                      <Badge variant="default" className="bg-status-warning text-white">
                        <Crown size={12} className="mr-1" />
                        1st
                      </Badge>
                    )}
                    {index === 1 && (
                      <Badge variant="outline">
                        2nd
                      </Badge>
                    )}
                    {index === 2 && (
                      <Badge variant="outline">
                        3rd
                      </Badge>
                    )}
                    <h3 className="font-semibold">{team.name}</h3>
                  </div>
                  {team.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {team.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={team.profiles?.avatar_url || '/placeholder.svg'} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {displayName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center space-x-1">
                      <Crown size={12} className="text-status-warning" />
                      <span className="text-muted-foreground">{displayName}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Users size={12} />
                    <span>{team.current_members}/{maxTeamSize}</span>
                  </div>

                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <TrendingUp size={12} />
                    <span>{team.total_progress}</span>
                  </div>
                </div>

                {!isUserTeam ? (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoinTeam(team.id);
                    }}
                    disabled={isFull || actionLoading === team.id || userTeamId !== null}
                  >
                    {actionLoading === team.id ? (
                      'Joining...'
                    ) : isFull ? (
                      'Full'
                    ) : (
                      <>
                        <UserPlus size={14} className="mr-1" />
                        Join
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLeaveTeam(team.id);
                    }}
                    disabled={actionLoading === team.id}
                  >
                    {actionLoading === team.id ? 'Leaving...' : 'Leave'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TeamsList;
