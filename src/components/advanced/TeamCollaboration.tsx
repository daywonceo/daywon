import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, MessageCircle, Trophy, Plus, Target, Calendar, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: 'leader' | 'member' | 'coach';
  joinedAt: string;
  contribution: number;
  status: 'active' | 'inactive';
  habitCount: number;
  streakCount: number;
}

interface Team {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  maxMembers: number;
  category: string;
  visibility: 'public' | 'private' | 'invite-only';
  members: TeamMember[];
  goals: {
    title: string;
    target: number;
    current: number;
    unit: string;
  }[];
  achievements: string[];
  createdAt: string;
}

interface TeamCollaborationProps {
  userId?: string;
}

export const TeamCollaboration: React.FC<TeamCollaborationProps> = ({ userId }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading teams
    setTimeout(() => {
      const mockTeams: Team[] = [
        {
          id: '1',
          name: 'Morning Warriors',
          description: 'Early risers committed to morning routines',
          memberCount: 8,
          maxMembers: 12,
          category: 'Wellness',
          visibility: 'public',
          createdAt: '2024-01-15',
          members: [
            {
              id: '1',
              name: 'Sarah Chen',
              avatar: '/avatars/sarah.jpg',
              role: 'leader',
              joinedAt: '2024-01-15',
              contribution: 95,
              status: 'active',
              habitCount: 8,
              streakCount: 42
            },
            {
              id: '2',
              name: 'Mike Rodriguez',
              avatar: '/avatars/mike.jpg',
              role: 'member',
              joinedAt: '2024-01-20',
              contribution: 87,
              status: 'active',
              habitCount: 6,
              streakCount: 28
            },
            {
              id: '3',
              name: 'Emma Thompson',
              avatar: '/avatars/emma.jpg',
              role: 'coach',
              joinedAt: '2024-01-18',
              contribution: 92,
              status: 'active',
              habitCount: 10,
              streakCount: 35
            }
          ],
          goals: [
            { title: 'Collective Morning Workouts', target: 100, current: 73, unit: 'sessions' },
            { title: 'Team Meditation Minutes', target: 500, current: 342, unit: 'minutes' }
          ],
          achievements: ['30-Day Team Streak', 'Perfect Week', 'Motivation Master']
        },
        {
          id: '2',
          name: 'Fitness Fanatics',
          description: 'Dedicated to crushing fitness goals together',
          memberCount: 15,
          maxMembers: 20,
          category: 'Fitness',
          visibility: 'invite-only',
          createdAt: '2024-02-01',
          members: [
            {
              id: '4',
              name: 'Alex Kim',
              avatar: '/avatars/alex.jpg',
              role: 'leader',
              joinedAt: '2024-02-01',
              contribution: 98,
              status: 'active',
              habitCount: 12,
              streakCount: 56
            }
          ],
          goals: [
            { title: 'Team Weight Lifted', target: 10000, current: 7250, unit: 'lbs' },
            { title: 'Cardio Hours', target: 200, current: 145, unit: 'hours' }
          ],
          achievements: ['Strength Champions', 'Cardio Kings', 'Consistency Award']
        }
      ];
      
      setTeams(mockTeams);
      setLoading(false);
    }, 1000);
  }, []);

  const createTeam = () => {
    if (!newTeamName.trim()) return;
    
    const newTeam: Team = {
      id: Date.now().toString(),
      name: newTeamName,
      description: '',
      memberCount: 1,
      maxMembers: 10,
      category: 'General',
      visibility: 'public',
      createdAt: new Date().toISOString(),
      members: [],
      goals: [],
      achievements: []
    };
    
    setTeams([...teams, newTeam]);
    setNewTeamName('');
    setShowCreateTeam(false);
  };

  const getRoleColor = (role: TeamMember['role']) => {
    switch (role) {
      case 'leader': return 'default';
      case 'coach': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Collaboration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              My Teams
            </CardTitle>
            
            <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Team</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Team name"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCreateTeam(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createTeam}>
                      Create
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {teams.map(team => (
            <div
              key={team.id}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => setSelectedTeam(team)}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{team.name}</h3>
                  <p className="text-sm text-muted-foreground">{team.description}</p>
                </div>
                <Badge variant="outline">
                  {team.memberCount}/{team.maxMembers} members
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {team.goals.length} goals
                </span>
                <span className="flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  {team.achievements.length} achievements
                </span>
                <Badge variant="secondary" className="capitalize">
                  {team.category}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {selectedTeam && (
        <Card>
          <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-lg sm:text-xl">{selectedTeam.name}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                  <MessageCircle className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Chat</span>
                </Button>
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                  <Calendar className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Events</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Team Goals */}
            <div>
              <h4 className="font-medium mb-3">Team Goals</h4>
              <div className="grid gap-3">
                {selectedTeam.goals.map((goal, index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{goal.title}</span>
                      <span className="text-sm text-muted-foreground">
                        {goal.current}/{goal.target} {goal.unit}
                      </span>
                    </div>
                    <Progress value={(goal.current / goal.target) * 100} />
                  </div>
                ))}
              </div>
            </div>

            {/* Team Members */}
            <div>
              <h4 className="font-medium mb-3">Members</h4>
              <div className="grid gap-3">
                {selectedTeam.members.map(member => (
                  <div key={member.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm sm:text-base truncate">{member.name}</span>
                          <Badge variant={getRoleColor(member.role)} className="capitalize text-xs">
                            {member.role}
                          </Badge>
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          {member.habitCount} habits • {member.streakCount} day streak
                        </div>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="font-medium text-sm sm:text-base">{member.contribution}%</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">contribution</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div>
              <h4 className="font-medium mb-3">Team Achievements</h4>
              <div className="flex flex-wrap gap-2">
                {selectedTeam.achievements.map((achievement, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    {achievement}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};