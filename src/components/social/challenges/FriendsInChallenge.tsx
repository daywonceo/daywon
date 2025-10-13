import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';
import { useFriendsInChallenge } from '@/hooks/useFriendsInChallenge';

interface FriendsInChallengeProps {
  challengeId: string;
  maxDisplay?: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const FriendsInChallenge = ({ 
  challengeId, 
  maxDisplay = 3, 
  showCount = true,
  size = 'sm'
}: FriendsInChallengeProps) => {
  const { friends, totalFriends, loading } = useFriendsInChallenge(challengeId);

  if (loading || totalFriends === 0) {
    return null;
  }

  const displayedFriends = friends.slice(0, maxDisplay);
  const remainingCount = Math.max(0, totalFriends - maxDisplay);

  const sizeClasses = {
    sm: 'h-6 w-6 text-[8px]',
    md: 'h-8 w-8 text-xs',
    lg: 'h-10 w-10 text-sm',
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex -space-x-2">
        {displayedFriends.map((friend) => {
          const displayName = friend.profiles?.display_name || 'Friend';
          return (
            <Avatar 
              key={friend.id} 
              className={`${sizeClasses[size]} border-2 border-background`}
            >
              <AvatarImage src={friend.profiles?.avatar_url || '/placeholder.svg'} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {displayName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          );
        })}
        {remainingCount > 0 && (
          <div 
            className={`${sizeClasses[size]} border-2 border-background rounded-full bg-muted flex items-center justify-center font-semibold text-muted-foreground`}
          >
            +{remainingCount}
          </div>
        )}
      </div>
      
      {showCount && (
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          <Users size={12} />
          <span>
            {totalFriends} {totalFriends === 1 ? 'friend' : 'friends'}
          </span>
        </div>
      )}
    </div>
  );
};

export default FriendsInChallenge;
