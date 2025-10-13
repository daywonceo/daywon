import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Users } from 'lucide-react';

interface ChallengeParticipationFormProps {
  formData: {
    max_participants: string;
    is_team_based: boolean;
    max_team_size: number;
  };
  onChange: (field: string, value: any) => void;
}

const ChallengeParticipationForm = ({ formData, onChange }: ChallengeParticipationFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Users size={18} />
          <span>Participation</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="max_participants">Max Participants (optional)</Label>
          <Input
            id="max_participants"
            type="number"
            value={formData.max_participants}
            onChange={(e) => onChange('max_participants', e.target.value)}
            placeholder="Leave empty for unlimited"
            min="1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Leave empty for unlimited participants
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Team-based Challenge</Label>
            <p className="text-xs text-muted-foreground">
              Allow participants to form teams
            </p>
          </div>
          <Switch
            checked={formData.is_team_based}
            onCheckedChange={(checked) => onChange('is_team_based', checked)}
          />
        </div>

        {formData.is_team_based && (
          <div>
            <Label htmlFor="max_team_size">Max Team Size</Label>
            <Input
              id="max_team_size"
              type="number"
              value={formData.max_team_size}
              onChange={(e) => onChange('max_team_size', parseInt(e.target.value))}
              min="2"
              max="20"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChallengeParticipationForm;
