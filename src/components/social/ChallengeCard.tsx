import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, Target, Trophy, Clock } from 'lucide-react';
import { formatDistanceToNow, format, isAfter, isBefore } from 'date-fns';

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
  participant_count?: number;
  user_participation?: {
    current_progress: number;
    status: string;
    team_id?: string;
  };
}

interface ChallengeCardProps {
  challenge: Challenge;
  onJoin: (challengeId: string) => void;
  onLeave: (challengeId: string) => void;
  onViewDetails: (challengeId: string) => void;
  loading?: boolean;
}

const ChallengeCard = ({ challenge, onJoin, onLeave, onViewDetails, loading }: ChallengeCardProps) => {
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
      case 'habit_streak': return '🔥';
      case 'workout_count': return '💪';
      case 'steps': return '👟';
      default: return '🎯';
    }
  };

  const getChallengeTypeLabel = (type: string) => {
    switch (type) {
      case 'habit_streak': return 'Habit Streak';
      case 'workout_count': return 'Workout Count';
      case 'steps': return 'Steps Challenge';
      default: return 'Custom Challenge';
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
    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getChallengeTypeIcon(challenge.challenge_type)}</span>
            <div>
              <CardTitle className="text-lg line-clamp-1">{challenge.title}</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {getChallengeTypeLabel(challenge.challenge_type)}
              </p>
            </div>
          </div>
          
          <Badge className={`${getStatusColor()} border-0 text-xs`}>
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {challenge.description}
        </p>
        
        {/* Challenge Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs">
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <Target size={12} />
            <span className="text-xs">
              {challenge.target_value} {challenge.target_unit}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <Users size={12} />
            <span className="text-xs">
              {challenge.participant_count || 0}
              {challenge.max_participants && ` / ${challenge.max_participants}`}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <Calendar size={12} />
            <span className="text-xs">{format(startDate, 'MMM d')}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <Clock size={12} />
            <span className="text-xs">{format(endDate, 'MMM d')}</span>
          </div>
        </div>

        {/* Team-based indicator */}
        {challenge.is_team_based && (
          <div className="flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-400">
            <Trophy size={14} />
            <span>Team Challenge (max {challenge.max_team_size} per team)</span>
          </div>
        )}
        
        {/* Progress (if participating) */}
        {challenge.user_participation && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Your Progress</span>
              <span className="font-medium">
                {challenge.user_participation.current_progress} / {challenge.target_value}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}
        
        {/* Time indicators */}
        {daysUntilStart && (
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            Starts {daysUntilStart}
          </div>
        )}
        {daysUntilEnd && (
          <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
            Ends {daysUntilEnd}
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(challenge.id)}
            className="flex-1 h-9 text-xs"
          >
            View Details
          </Button>
          
          {challenge.user_participation ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onLeave(challenge.id)}
              disabled={loading}
              className="flex-1 h-9 text-xs"
            >
              {loading ? 'Leaving...' : 'Leave'}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => onJoin(challenge.id)}
              disabled={loading || isExpired || (challenge.max_participants && (challenge.participant_count || 0) >= challenge.max_participants)}
              className="flex-1 h-9 text-xs"
            >
              {loading ? 'Joining...' : 'Join'}
            </Button>
          )}
        </div>
        
        {/* Quick interactions for active challenges */}
        {isActive && challenge.user_participation && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(challenge.id)}
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                💬 Join Discussion • ❤️ React • 📊 View Progress
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChallengeCard;