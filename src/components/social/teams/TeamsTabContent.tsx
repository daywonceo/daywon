import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Users } from 'lucide-react';
import TeamsContent from './TeamsContent';

interface Challenge {
  id: string;
  title: string;
  max_team_size: number;
  target_value: number | null;
  target_unit: string | null;
  is_team_based: boolean;
  user_participation?: any;
}

interface TeamsTabContentProps {
  challenges: Challenge[];
}

const TeamsTabContent = ({ challenges }: TeamsTabContentProps) => {
  // Filter to only show team-based challenges the user is participating in
  const teamChallenges = challenges.filter(
    c => c.is_team_based && c.user_participation
  );

  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(
    teamChallenges[0]?.id || ''
  );

  const selectedChallenge = teamChallenges.find(c => c.id === selectedChallengeId);

  if (teamChallenges.length === 0) {
    return (
      <Card className="bg-card border">
        <CardContent className="p-8 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No Team Challenges</h3>
          <p className="text-sm text-muted-foreground">
            Join a team-based challenge to access team features
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {teamChallenges.length > 1 && (
        <Card className="bg-card border">
          <CardContent className="p-4">
            <Label htmlFor="challenge-select" className="text-sm font-medium mb-2 block">
              Select Challenge
            </Label>
            <Select value={selectedChallengeId} onValueChange={setSelectedChallengeId}>
              <SelectTrigger id="challenge-select">
                <SelectValue placeholder="Choose a challenge" />
              </SelectTrigger>
              <SelectContent>
                {teamChallenges.map((challenge) => (
                  <SelectItem key={challenge.id} value={challenge.id}>
                    {challenge.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {selectedChallenge && (
        <TeamsContent
          challengeId={selectedChallenge.id}
          maxTeamSize={selectedChallenge.max_team_size}
          targetValue={selectedChallenge.target_value || 100}
          targetUnit={selectedChallenge.target_unit || 'points'}
        />
      )}
    </div>
  );
};

export default TeamsTabContent;
