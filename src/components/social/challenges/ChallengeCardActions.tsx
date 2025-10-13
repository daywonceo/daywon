import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Heart, Plus } from 'lucide-react';

interface ChallengeCardActionsProps {
  challengeId: string;
  isParticipating: boolean;
  isActive: boolean;
  isExpired: boolean;
  isFull: boolean;
  loading?: boolean;
  showQuickActions?: boolean;
  onViewDetails: (id: string) => void;
  onJoin: (id: string) => void;
  onLeave: (id: string) => void;
  onFavorite?: (id: string) => void;
  onQuickProgress?: (id: string) => void;
}

const ChallengeCardActions = ({
  challengeId,
  isParticipating,
  isActive,
  isExpired,
  isFull,
  loading,
  showQuickActions = true,
  onViewDetails,
  onJoin,
  onLeave,
  onFavorite,
  onQuickProgress,
}: ChallengeCardActionsProps) => {
  return (
    <>
      {/* Main Action buttons */}
      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(challengeId)}
          className="flex-1 h-9 text-xs"
        >
          View Details
        </Button>
        
        {isParticipating ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onLeave(challengeId)}
            disabled={loading}
            className="flex-1 h-9 text-xs"
          >
            {loading ? 'Leaving...' : 'Leave'}
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => onJoin(challengeId)}
            disabled={loading || isExpired || isFull}
            className="flex-1 h-9 text-xs"
          >
            {loading ? 'Joining...' : 'Join'}
          </Button>
        )}
      </div>
      
      {/* Quick interactions for active challenges */}
      {isActive && isParticipating && showQuickActions && (
        <div className="pt-2 border-t border-border">
          <div className="flex justify-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(challengeId);
              }}
              className="text-xs text-muted-foreground hover:text-accent px-2"
            >
              <MessageCircle size={12} className="mr-1" />
              Chat
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onFavorite?.(challengeId);
              }}
              className="text-xs text-muted-foreground hover:text-status-error px-2"
            >
              <Heart size={12} className="mr-1" />
              Like
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onQuickProgress?.(challengeId);
              }}
              className="text-xs text-muted-foreground hover:text-status-success px-2"
            >
              <Plus size={12} className="mr-1" />
              Log
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChallengeCardActions;
