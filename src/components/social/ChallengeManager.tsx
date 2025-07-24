import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Settings, 
  Users, 
  BarChart3, 
  MessageCircle, 
  Calendar,
  Trophy,
  AlertTriangle,
  Eye,
  Edit3,
  Trash2
} from 'lucide-react';
import { useChallengeManagement } from '@/hooks/useChallengeManagement';
import { format } from 'date-fns';

interface ChallengeManagerProps {
  className?: string;
}

const ChallengeManager = ({ className }: ChallengeManagerProps) => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'analytics'>('overview');
  
  const { getUserChallenges, deleteChallenge, loading } = useChallengeManagement();

  useEffect(() => {
    loadUserChallenges();
  }, []);

  const loadUserChallenges = async () => {
    const result = await getUserChallenges();
    if (result.success) {
      setChallenges(result.challenges || []);
      if (result.challenges?.length > 0) {
        setSelectedChallenge(result.challenges[0]);
      }
    }
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    if (window.confirm('Are you sure you want to cancel this challenge? This action cannot be undone.')) {
      const result = await deleteChallenge(challengeId);
      if (result.success) {
        await loadUserChallenges();
        if (selectedChallenge?.id === challengeId) {
          setSelectedChallenge(challenges.length > 1 ? challenges[0] : null);
        }
      }
    }
  };

  const getChallengeStatus = (challenge: any) => {
    const now = new Date();
    const startDate = new Date(challenge.start_date);
    const endDate = new Date(challenge.end_date);
    
    if (challenge.status === 'cancelled') return { status: 'cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' };
    if (now < startDate) return { status: 'upcoming', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' };
    if (now > endDate) return { status: 'completed', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' };
    return { status: 'active', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' };
  };

  const getParticipantProgress = (participant: any) => {
    const challenge = selectedChallenge;
    if (!challenge?.target_value) return 0;
    return Math.min((participant.current_progress / challenge.target_value) * 100, 100);
  };

  if (loading) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
        <p className="text-sm text-gray-500">Loading your challenges...</p>
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <Card className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 ${className}`}>
        <CardContent className="p-8 text-center">
          <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No Challenges Created</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You haven't created any challenges yet. Create your first challenge to get started!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Challenge Selector */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings size={20} />
            <span>Manage Challenges</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {challenges.map((challenge) => {
              const statusInfo = getChallengeStatus(challenge);
              const participantCount = challenge.challenge_participants?.length || 0;
              
              return (
                <div
                  key={challenge.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedChallenge?.id === challenge.id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                  onClick={() => setSelectedChallenge(challenge)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {challenge.title}
                      </h4>
                      <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span className="flex items-center space-x-1">
                          <Users size={12} />
                          <span>{participantCount} participants</span>
                        </span>
                        <span>{format(new Date(challenge.start_date), 'MMM d')} - {format(new Date(challenge.end_date), 'MMM d')}</span>
                      </div>
                    </div>
                    <Badge className={`${statusInfo.color} border-0 text-xs capitalize`}>
                      {statusInfo.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Challenge Details */}
      {selectedChallenge && (
        <>
          {/* Challenge Header */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedChallenge.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    {selectedChallenge.description}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit3 size={14} className="mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteChallenge(selectedChallenge.id)}
                  >
                    <Trash2 size={14} className="mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {selectedChallenge.challenge_participants?.length || 0}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">Participants</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {selectedChallenge.target_value} {selectedChallenge.target_unit}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">Target</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {format(new Date(selectedChallenge.start_date), 'MMM d')}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">Start Date</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {format(new Date(selectedChallenge.end_date), 'MMM d')}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">End Date</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Management Tabs */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {(['overview', 'participants', 'analytics'] as const).map((tab) => (
                  <Button
                    key={tab}
                    variant={activeTab === tab ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab(tab)}
                    className="capitalize flex-1"
                  >
                    {tab === 'overview' && <Eye size={16} className="mr-1" />}
                    {tab === 'participants' && <Users size={16} className="mr-1" />}
                    {tab === 'analytics' && <BarChart3 size={16} className="mr-1" />}
                    {tab}
                  </Button>
                ))}
              </div>
            </CardHeader>

            <CardContent>
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Challenge Type</h4>
                    <Badge variant="outline" className="capitalize">
                      {selectedChallenge.challenge_type.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  {selectedChallenge.is_team_based && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Team Settings</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Team-based challenge with maximum {selectedChallenge.max_team_size} members per team
                      </p>
                    </div>
                  )}

                  {selectedChallenge.rules && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Rules</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                        {selectedChallenge.rules}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'participants' && (
                <div className="space-y-4">
                  {selectedChallenge.challenge_participants?.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No participants yet. Share your challenge to get people involved!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedChallenge.challenge_participants.map((participant: any) => {
                        const displayName = participant.profiles?.display_name || participant.profiles?.email || 'Anonymous';
                        const progress = getParticipantProgress(participant);
                        
                        return (
                          <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={participant.profiles?.avatar_url || "/placeholder.svg"} alt={displayName} />
                                <AvatarFallback className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs font-semibold">
                                  {displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm text-gray-900 dark:text-white">
                                  {displayName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {participant.current_progress} / {selectedChallenge.target_value} {selectedChallenge.target_unit}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <div className="w-24">
                                <Progress value={progress} className="h-2" />
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {Math.round(progress)}%
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="text-center py-8">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Analytics Coming Soon</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Detailed analytics and insights will be available soon!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ChallengeManager;