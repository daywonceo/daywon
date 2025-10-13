import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { useTeams } from '@/hooks/useTeams';
import { LoadingSpinner } from '@/components/ui/shared/LoadingStates';

interface TeamLeaderboardProps {
  challengeId: string;
  targetValue: number;
  targetUnit: string;
}

const TeamLeaderboard = ({ challengeId, targetValue, targetUnit }: TeamLeaderboardProps) => {
  const { teams, loading } = useTeams(challengeId);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="text-status-warning" size={20} />;
      case 1:
        return <Medal className="text-muted-foreground" size={20} />;
      case 2:
        return <Award className="text-orange-600" size={20} />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>;
    }
  };

  const getProgressPercentage = (progress: number) => {
    return Math.min((progress / targetValue) * 100, 100);
  };

  if (loading) {
    return <LoadingSpinner message="Loading leaderboard..." />;
  }

  if (teams.length === 0) {
    return (
      <Card className="bg-card border">
        <CardContent className="p-8 text-center">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No Team Data</h3>
          <p className="text-sm text-muted-foreground">
            Teams will appear here once they start making progress
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy size={20} />
          <span>Team Leaderboard</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {teams.map((team, index) => {
            const progressPercentage = getProgressPercentage(team.total_progress);
            const displayName = team.profiles?.display_name || 'Team Captain';

            return (
              <div
                key={team.id}
                className={`p-3 rounded-lg border transition-all ${
                  index < 3 ? 'bg-muted/50 border-primary/20' : 'bg-background'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 flex justify-center">
                      {getRankIcon(index)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold">{team.name}</h4>
                        {index === 0 && (
                          <Badge variant="default" className="bg-status-warning text-white text-xs">
                            Leader
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={team.profiles?.avatar_url || '/placeholder.svg'} />
                          <AvatarFallback className="text-[8px]">
                            {displayName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{displayName}</span>
                        <span>•</span>
                        <span>{team.current_members} members</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {team.total_progress.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {targetUnit}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{progressPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        index === 0 ? 'bg-status-warning' : 
                        index === 1 ? 'bg-muted-foreground' : 
                        index === 2 ? 'bg-orange-600' : 
                        'bg-primary'
                      }`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {teams.length > 0 && (
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <TrendingUp size={14} />
                <span>Total Teams</span>
              </div>
              <span className="font-semibold">{teams.length}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamLeaderboard;
