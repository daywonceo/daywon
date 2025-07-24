import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  Target,
  Clock,
  Star,
  Crown,
  Zap,
  Award
} from 'lucide-react';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';
import { formatDistanceToNow } from 'date-fns';

interface ChallengeProgressTrackerProps {
  challengeId: string;
  showLeaderboard?: boolean;
  showStats?: boolean;
  showMilestones?: boolean;
  className?: string;
}

const ChallengeProgressTracker = ({
  challengeId,
  showLeaderboard = true,
  showStats = true,
  showMilestones = true,
  className = "",
}: ChallengeProgressTrackerProps) => {
  const { progressData, loading, recentMilestones, getProgressStats } = useChallengeProgress(challengeId);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <Card className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 ${className}`}>
        <CardContent className="p-6 text-center">
          <Target className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No progress data available</p>
        </CardContent>
      </Card>
    );
  }

  const stats = getProgressStats();
  const { participants, targetValue, targetUnit, milestones, leaderboard } = progressData;

  const getMilestoneIcon = (percentage: number) => {
    if (percentage >= 100) return <Crown className="w-4 h-4 text-yellow-500" />;
    if (percentage >= 75) return <Award className="w-4 h-4 text-purple-500" />;
    if (percentage >= 50) return <Star className="w-4 h-4 text-blue-500" />;
    if (percentage >= 25) return <Zap className="w-4 h-4 text-green-500" />;
    return null;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Challenge Overview Stats */}
      {showStats && stats && (
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <TrendingUp size={20} className="text-green-500" />
              <span>Progress Overview</span>
              <div className="animate-pulse">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.activeParticipants}
                </div>
                <div className="text-xs text-green-700 dark:text-green-300 font-medium">
                  Active Participants
                </div>
              </div>
              
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(stats.averagePercentage)}%
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                  Average Progress
                </div>
              </div>
              
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.completedCount}
                </div>
                <div className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                  Completed
                </div>
              </div>
              
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {Math.round(stats.completionRate)}%
                </div>
                <div className="text-xs text-orange-700 dark:text-orange-300 font-medium">
                  Completion Rate
                </div>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-300">Challenge Progress</span>
                <span className="font-medium">{Math.round(stats.averagePercentage)}%</span>
              </div>
              <Progress value={stats.averagePercentage} useGradient className="h-3" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Milestones */}
      {showMilestones && recentMilestones.length > 0 && (
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Trophy size={20} className="text-yellow-500" />
              <span>Recent Milestones</span>
              <Badge variant="secondary" className="text-xs">
                {recentMilestones.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {recentMilestones.slice(0, 5).map((achievement, index) => (
                <div
                  key={`${achievement.participant.id}-${achievement.milestone.id}-${index}`}
                  className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                >
                  <div className="text-2xl">{achievement.milestone.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {achievement.participant.profiles?.display_name || 'Someone'} achieved{' '}
                      <span className="text-yellow-600 dark:text-yellow-400">
                        {achievement.milestone.title}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(achievement.timestamp, { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Leaderboard */}
      {showLeaderboard && (
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Crown size={20} className="text-yellow-500" />
              <span>Live Leaderboard</span>
              <div className="animate-pulse">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="text-center py-6">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No active participants yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.slice(0, 10).map((participant, index) => {
                  const progressPercentage = Math.min((participant.current_progress / targetValue) * 100, 100);
                  const displayName = participant.profiles?.display_name || participant.profiles?.email || 'Anonymous';
                  const isCompleted = participant.current_progress >= targetValue;

                  return (
                    <div
                      key={participant.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                        index === 0 
                          ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800'
                          : index <= 2
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800'
                          : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-700 border shadow-sm">
                        {index === 0 ? (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        ) : index === 1 ? (
                          <Award className="w-4 h-4 text-gray-400" />
                        ) : index === 2 ? (
                          <Star className="w-4 h-4 text-orange-400" />
                        ) : (
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                            {index + 1}
                          </span>
                        )}
                      </div>

                      {/* Avatar */}
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={participant.profiles?.avatar_url || "/placeholder.svg"} alt={displayName} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-semibold">
                          {displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* Name and Progress */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                            {displayName}
                          </p>
                          {isCompleted && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs border-0">
                              Completed
                            </Badge>
                          )}
                          {getMilestoneIcon(progressPercentage)}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex-1">
                            <Progress value={progressPercentage} className="h-2" />
                          </div>
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300 min-w-fit">
                            {participant.current_progress} / {targetValue}
                          </span>
                        </div>
                      </div>

                      {/* Progress Percentage */}
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {Math.round(progressPercentage)}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {targetUnit}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Milestone Progress */}
      {showMilestones && (
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Target size={20} className="text-purple-500" />
              <span>Milestones</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {milestones.map((milestone) => {
                const achievedCount = participants.filter(p => 
                  ((p.current_progress / targetValue) * 100) >= milestone.percentage
                ).length;
                const totalParticipants = participants.filter(p => p.status === 'active').length;
                const achievementRate = totalParticipants > 0 ? (achievedCount / totalParticipants) * 100 : 0;

                return (
                  <div key={milestone.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="text-xl">{milestone.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                          {milestone.title}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {achievedCount}/{totalParticipants} achieved
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={achievementRate} className="h-2 flex-1" />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          {Math.round(achievementRate)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChallengeProgressTracker;