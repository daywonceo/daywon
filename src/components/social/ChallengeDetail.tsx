import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, Users, Target, Trophy, Clock, Share2, 
  MessageCircle, Heart, ArrowLeft, Crown, Medal,
  TrendingUp, Activity, Flame, BookOpen, Brain, Star
} from 'lucide-react';
import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns';

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_value: number | null;
  target_unit: string | null;
  start_date: string;
  end_date: string;
  max_participants: number | null;
  is_team_based: boolean;
  max_team_size: number;
  status: string;
  creator_id: string;
  participant_count?: number;
  user_participation?: {
    current_progress: number;
    status: string;
    team_id?: string;
  };
}

interface ChallengeDetailProps {
  challenge: Challenge;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoin: (challengeId: string) => void;
  onLeave: (challengeId: string) => void;
  onShare?: (challengeId: string) => void;
  loading?: boolean;
}

const ChallengeDetail = ({ 
  challenge, 
  open, 
  onOpenChange, 
  onJoin, 
  onLeave, 
  onShare,
  loading 
}: ChallengeDetailProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const now = new Date();
  const startDate = new Date(challenge.start_date);
  const endDate = new Date(challenge.end_date);
  
  const isUpcoming = isAfter(startDate, now);
  const isActive = !isUpcoming && isBefore(now, endDate);
  const isExpired = isAfter(now, endDate);
  
  const daysUntilStart = isUpcoming ? formatDistanceToNow(startDate, { addSuffix: true }) : null;
  const daysUntilEnd = isActive ? formatDistanceToNow(endDate, { addSuffix: true }) : null;
  
  const progressPercentage = challenge.user_participation 
    ? Math.min((challenge.user_participation.current_progress / (challenge.target_value || 100)) * 100, 100)
    : 0;

  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case 'habit_streak': return <Flame size={20} className="text-orange-500" />;
      case 'workout_count': return <Trophy size={20} className="text-blue-500" />;
      case 'steps': return <Target size={20} className="text-green-500" />;
      case 'reading': return <BookOpen size={20} className="text-purple-500" />;
      case 'meditation': return <Brain size={20} className="text-indigo-500" />;
      default: return <Star size={20} className="text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    if (isUpcoming) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    if (isActive) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    if (isExpired) return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const getStatusText = () => {
    if (isUpcoming) return 'Upcoming';
    if (isActive) return 'Active';
    if (isExpired) return 'Completed';
    return 'Draft';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden mx-2 sm:mx-0 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="p-2 h-8 w-8"
                >
                  <ArrowLeft size={16} />
                </Button>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getChallengeTypeIcon(challenge.challenge_type)}</span>
                  <div>
                    <DialogTitle className="text-lg sm:text-xl">{challenge.title}</DialogTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={`${getStatusColor()} border-0 text-xs`}>
                        {getStatusText()}
                      </Badge>
                      {challenge.is_team_based && (
                        <Badge variant="outline" className="text-xs">
                          <Users size={12} className="mr-1" />
                          Team Challenge
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {onShare && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onShare(challenge.id)}
                    className="h-8 px-3"
                  >
                    <Share2 size={14} className="mr-1" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                )}
                
                {challenge.user_participation ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onLeave(challenge.id)}
                    disabled={loading}
                    className="h-8 px-3"
                  >
                    {loading ? 'Leaving...' : 'Leave'}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => onJoin(challenge.id)}
                    disabled={loading || isExpired || (challenge.max_participants && (challenge.participant_count || 0) >= challenge.max_participants)}
                    className="h-8 px-3"
                  >
                    {loading ? 'Joining...' : 'Join Challenge'}
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 sm:px-6 py-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users size={16} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {challenge.participant_count || 0}
                    </div>
                    <div className="text-xs text-blue-600/70 dark:text-blue-400/70">
                      Participants
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <CardContent className="p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Target size={16} className="text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {challenge.target_value}
                    </div>
                    <div className="text-xs text-green-600/70 dark:text-green-400/70">
                      {challenge.target_unit}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                  <CardContent className="p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Calendar size={16} className="text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {format(endDate, 'MMM d')}
                    </div>
                    <div className="text-xs text-orange-600/70 dark:text-orange-400/70">
                      Ends
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                  <CardContent className="p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Trophy size={16} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      Active
                    </div>
                    <div className="text-xs text-purple-600/70 dark:text-purple-400/70">
                      Status
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* User Progress (if participating) */}
              {challenge.user_participation && (
                <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Your Progress</h3>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {challenge.user_participation.current_progress} / {challenge.target_value} {challenge.target_unit}
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-3 mb-2" />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{Math.round(progressPercentage)}% complete</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Time indicators */}
              {(daysUntilStart || daysUntilEnd) && (
                <div className="mb-6">
                  {daysUntilStart && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 text-center">
                      <Clock size={16} className="inline mr-2 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Starts {daysUntilStart}
                      </span>
                    </div>
                  )}
                  {daysUntilEnd && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-3 text-center">
                      <Clock size={16} className="inline mr-2 text-orange-600 dark:text-orange-400" />
                      <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                        Ends {daysUntilEnd}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                  <TabsTrigger value="participants" className="text-xs">Participants</TabsTrigger>
                  <TabsTrigger value="discussion" className="text-xs">Discussion</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">About this Challenge</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-600 dark:text-gray-300">{challenge.description}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Calendar size={14} className="text-gray-500" />
                            <span className="font-medium">Duration:</span>
                            <span>{format(startDate, 'MMM d')} - {format(endDate, 'MMM d')}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Target size={14} className="text-gray-500" />
                            <span className="font-medium">Goal:</span>
                            <span>{challenge.target_value} {challenge.target_unit}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Users size={14} className="text-gray-500" />
                            <span className="font-medium">Participants:</span>
                            <span>
                              {challenge.participant_count || 0}
                              {challenge.max_participants && ` / ${challenge.max_participants}`}
                            </span>
                          </div>
                          {challenge.is_team_based && (
                            <div className="flex items-center space-x-2">
                              <Trophy size={14} className="text-gray-500" />
                              <span className="font-medium">Team Size:</span>
                              <span>Max {challenge.max_team_size} members</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="participants" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <Users className="text-blue-500" size={18} />
                        <span>Participants</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Users className="mx-auto h-12 w-12 mb-3 opacity-50" />
                        <p>Participant details coming soon...</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="discussion" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <MessageCircle className="text-green-500" size={18} />
                        <span>Discussion</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <MessageCircle className="mx-auto h-12 w-12 mb-3 opacity-50" />
                        <p>Challenge discussions coming soon...</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChallengeDetail;