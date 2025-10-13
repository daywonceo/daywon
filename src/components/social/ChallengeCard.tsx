import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow, isAfter, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';
import SocialProofIndicators from './SocialProofIndicators';
import ChallengeCardHeader from './challenges/ChallengeCardHeader';
import ChallengeCardStats from './challenges/ChallengeCardStats';
import ChallengeCardActions from './challenges/ChallengeCardActions';
import SwipeActions from './challenges/SwipeActions';
import { useChallengeCardSwipe } from '@/hooks/useChallengeCardSwipe';

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
  const { swipeOffset, showActions, handleTouchStart, handleTouchMove, handleTouchEnd, resetSwipe } = useChallengeCardSwipe();
  
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

  const getStatus = (): 'upcoming' | 'active' | 'completed' | 'draft' => {
    if (isUpcoming) return 'upcoming';
    if (isActive) return 'active';
    if (isExpired) return 'completed';
    return 'draft';
  };

  const isFull = challenge.max_participants ? (challenge.participant_count || 0) >= challenge.max_participants : false;

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Quick Actions (revealed on swipe) */}
      {showQuickActions && showActions && (
        <SwipeActions
          challengeId={challenge.id}
          onFavorite={onFavorite}
          onShare={onShare}
          onQuickProgress={onQuickProgress}
          showProgress={!!challenge.user_participation && isActive}
          onActionComplete={resetSwipe}
        />
      )}

      <Card 
        className={cn(
          "bg-card backdrop-blur-sm border hover:shadow-lg transition-all duration-200 relative",
          isSelected && "ring-2 ring-primary border-primary",
          onSelect && "cursor-pointer"
        )}
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => onSelect?.(challenge.id)}
      >
        <CardHeader className="pb-3">
          <ChallengeCardHeader
            type={challenge.challenge_type}
            title={challenge.title}
            status={getStatus()}
          />
        </CardHeader>
      
        <CardContent className="space-y-4">
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {challenge.description}
          </p>

          {/* Social Proof Indicators */}
          <SocialProofIndicators
            challenge={{
              id: challenge.id,
              participant_count: challenge.participant_count || 0,
              friends_participating: [],
              is_trending: (challenge.participant_count || 0) > 20,
              popularity_score: (challenge.participant_count || 0) * 2,
              time_left_days: Math.ceil((new Date(challenge.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
            }}
            className="mb-2"
          />
        
          {/* Challenge Details */}
          <ChallengeCardStats
            targetValue={challenge.target_value}
            targetUnit={challenge.target_unit}
            participantCount={challenge.participant_count || 0}
            maxParticipants={challenge.max_participants}
            startDate={challenge.start_date}
            endDate={challenge.end_date}
            isTeamBased={challenge.is_team_based}
            maxTeamSize={challenge.max_team_size}
          />
        
          {/* Progress (if participating) */}
          {challenge.user_participation && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Your Progress</span>
                <span className="font-medium">
                  {challenge.user_participation.current_progress} / {challenge.target_value}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}
          
          {/* Time indicators */}
          {daysUntilStart && (
            <div className="text-xs text-accent font-medium">
              Starts {daysUntilStart}
            </div>
          )}
          {daysUntilEnd && (
            <div className="text-xs text-status-warning font-medium">
              Ends {daysUntilEnd}
            </div>
          )}
          
          {/* Action buttons */}
          <ChallengeCardActions
            challengeId={challenge.id}
            isParticipating={!!challenge.user_participation}
            isActive={isActive}
            isExpired={isExpired}
            isFull={isFull}
            loading={loading}
            showQuickActions={showQuickActions}
            onViewDetails={onViewDetails}
            onJoin={onJoin}
            onLeave={onLeave}
            onFavorite={onFavorite}
            onQuickProgress={onQuickProgress}
          />

          {/* Selection indicator */}
          {isSelected && (
            <div className="absolute top-2 right-2">
              <CheckCircle2 className="text-primary bg-background rounded-full" size={20} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChallengeCard;