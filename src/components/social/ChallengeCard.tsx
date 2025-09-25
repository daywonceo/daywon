import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, Target, Trophy, Clock, Share2, Heart, MessageCircle, Plus, CheckCircle2, Star } from 'lucide-react';
import { formatDistanceToNow, format, isAfter, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';

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
  onShare?: (challengeId: string) => void;
  onFavorite?: (challengeId: string) => void;
  onQuickProgress?: (challengeId: string) => void;
  loading?: boolean;
  isSelected?: boolean;
  onSelect?: (challengeId: string) => void;
  showQuickActions?: boolean;
}

const ChallengeCard = ({ 
  challenge, 
  onJoin, 
  onLeave, 
  onViewDetails, 
  onShare,
  onFavorite,
  onQuickProgress,
  loading,
  isSelected,
  onSelect,
  showQuickActions = true 
}: ChallengeCardProps) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [showActions, setShowActions] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
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

  // Touch/swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;
    
    // Only allow left swipe for actions
    if (diff < 0) {
      setSwipeOffset(Math.max(diff, -120));
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    
    // If swiped more than 60px, show actions
    if (swipeOffset < -60) {
      setShowActions(true);
      setSwipeOffset(-120);
    } else {
      setSwipeOffset(0);
      setShowActions(false);
    }
  };

  // Quick actions for mobile swipe
  const quickActions = [
    {
      icon: Heart,
      label: 'Favorite',
      action: () => onFavorite?.(challenge.id),
      color: 'bg-pink-500 hover:bg-pink-600',
    },
    {
      icon: Share2,
      label: 'Share',
      action: () => onShare?.(challenge.id),
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    ...(challenge.user_participation && isActive ? [{
      icon: Plus,
      label: 'Progress',
      action: () => onQuickProgress?.(challenge.id),
      color: 'bg-green-500 hover:bg-green-600',
    }] : []),
  ];

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Quick Actions (revealed on swipe) */}
      {showQuickActions && (
        <div className="absolute right-0 top-0 h-full flex items-center bg-gray-100 dark:bg-gray-700 z-10">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              size="sm"
              className={`${action.color} text-white h-full rounded-none px-3 transition-all duration-200`}
              onClick={(e) => {
                e.stopPropagation();
                action.action();
                setShowActions(false);
                setSwipeOffset(0);
              }}
            >
              <action.icon size={16} />
              <span className="sr-only">{action.label}</span>
            </Button>
          ))}
        </div>
      )}

      <Card 
        ref={cardRef}
        className={cn(
          "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 relative",
          isSelected && "ring-2 ring-purple-500 border-purple-300",
          onSelect && "cursor-pointer"
        )}
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => onSelect?.(challenge.id)}
      >
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
        {isActive && challenge.user_participation && showQuickActions && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(challenge.id);
                }}
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 px-2"
              >
                <MessageCircle size={12} className="mr-1" />
                Chat
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onFavorite?.(challenge.id);
                }}
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 px-2"
              >
                <Heart size={12} className="mr-1" />
                Like
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickProgress?.(challenge.id);
                }}
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 px-2"
              >
                <Plus size={12} className="mr-1" />
                Log
              </Button>
            </div>
          </div>
        )}

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2">
            <CheckCircle2 className="text-purple-600 bg-white rounded-full" size={20} />
          </div>
        )}
      </CardContent>
      </Card>
    </div>
  );
};

export default ChallengeCard;