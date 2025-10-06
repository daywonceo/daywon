import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Users } from 'lucide-react';

interface MutualFriend {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

interface MutualFriendsIndicatorProps {
  count: number;
  mutualFriends?: MutualFriend[];
}

export const MutualFriendsIndicator = ({ count, mutualFriends = [] }: MutualFriendsIndicatorProps) => {
  if (count === 0) return null;

  const displayedFriends = mutualFriends.slice(0, 3);
  const remainingCount = count - displayedFriends.length;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="flex -space-x-2">
              {displayedFriends.length > 0 ? (
                displayedFriends.map((friend) => (
                  <Avatar key={friend.id} className="w-6 h-6 border-2 border-background">
                    <AvatarImage src={friend.avatar_url || ''} alt={friend.display_name} />
                    <AvatarFallback className="text-xs">
                      {friend.display_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                ))
              ) : (
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                  <Users className="w-3 h-3" />
                </div>
              )}
            </div>
            <span className="font-medium">
              {count} mutual friend{count !== 1 ? 's' : ''}
            </span>
          </div>
        </TooltipTrigger>
        {mutualFriends.length > 0 && (
          <TooltipContent>
            <div className="text-sm">
              {displayedFriends.map((f) => f.display_name).join(', ')}
              {remainingCount > 0 && ` and ${remainingCount} more`}
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};
