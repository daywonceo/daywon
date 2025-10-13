import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Users, Plus } from 'lucide-react';
import { useTeams } from '@/hooks/useTeams';

interface TeamFormationProps {
  challengeId: string;
  onSuccess?: () => void;
}

const TeamFormation = ({ challengeId, onSuccess }: TeamFormationProps) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const { createTeam, loading } = useTeams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    const result = await createTeam({
      challenge_id: challengeId,
      name: formData.name,
      description: formData.description || undefined,
    });

    if (result.success) {
      setFormData({ name: '', description: '' });
      setShowForm(false);
      onSuccess?.();
    }
  };

  if (!showForm) {
    return (
      <Card className="bg-card border">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="text-primary" size={24} />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Create Your Team</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Form a team to compete together in this challenge
              </p>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus size={16} className="mr-2" />
              Create New Team
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users size={20} />
          <span>Create New Team</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="team-name">Team Name *</Label>
            <Input
              id="team-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter a team name"
              required
              maxLength={50}
            />
          </div>

          <div>
            <Label htmlFor="team-description">Description (optional)</Label>
            <Textarea
              id="team-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Tell others about your team..."
              rows={3}
              maxLength={200}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowForm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.name.trim()}
              className="flex-1"
            >
              {loading ? 'Creating...' : 'Create Team'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TeamFormation;
