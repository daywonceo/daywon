import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Trophy, MessageCircle, Plus } from 'lucide-react';
import TeamFormation from './TeamFormation';
import TeamsList from './TeamsList';
import TeamLeaderboard from './TeamLeaderboard';
import TeamChat from './TeamChat';
import { supabase } from '@/integrations/supabase/client';

interface TeamsContentProps {
  challengeId: string;
  maxTeamSize: number;
  targetValue: number;
  targetUnit: string;
}

const TeamsContent = ({ 
  challengeId, 
  maxTeamSize, 
  targetValue, 
  targetUnit 
}: TeamsContentProps) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'leaderboard' | 'chat'>('browse');
  const [userTeam, setUserTeam] = useState<any>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  useEffect(() => {
    checkUserTeam();
  }, [challengeId]);

  const checkUserTeam = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: participant } = await supabase
      .from('challenge_participants')
      .select(`
        team_id,
        challenge_teams (
          id,
          name,
          description,
          current_members
        )
      `)
      .eq('challenge_id', challengeId)
      .eq('user_id', user.id)
      .single();

    if (participant?.team_id && participant.challenge_teams) {
      setUserTeam(participant.challenge_teams);
      setSelectedTeamId(participant.team_id);
    }
  };

  const handleTeamCreated = () => {
    checkUserTeam();
    setActiveTab('browse');
  };

  const displayedTeamId = selectedTeamId || userTeam?.id;

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse" className="flex items-center space-x-2">
            <Users size={16} />
            <span className="hidden sm:inline">Browse Teams</span>
            <span className="sm:hidden">Teams</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center space-x-2">
            <Trophy size={16} />
            <span className="hidden sm:inline">Leaderboard</span>
            <span className="sm:hidden">Ranks</span>
          </TabsTrigger>
          <TabsTrigger 
            value="chat" 
            className="flex items-center space-x-2"
            disabled={!userTeam}
          >
            <MessageCircle size={16} />
            <span className="hidden sm:inline">Team Chat</span>
            <span className="sm:hidden">Chat</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4 mt-4">
          {!userTeam && (
            <TeamFormation 
              challengeId={challengeId} 
              onSuccess={handleTeamCreated}
            />
          )}
          
          <TeamsList
            challengeId={challengeId}
            maxTeamSize={maxTeamSize}
            onTeamSelect={setSelectedTeamId}
          />
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-4">
          <TeamLeaderboard
            challengeId={challengeId}
            targetValue={targetValue}
            targetUnit={targetUnit}
          />
        </TabsContent>

        <TabsContent value="chat" className="mt-4">
          {userTeam && displayedTeamId ? (
            <TeamChat
              challengeId={challengeId}
              teamId={displayedTeamId}
              teamName={userTeam.name}
            />
          ) : (
            <Card className="bg-card border">
              <CardContent className="p-8 text-center">
                <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Join a Team First</h3>
                <p className="text-sm text-muted-foreground">
                  You need to be part of a team to access team chat
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamsContent;
