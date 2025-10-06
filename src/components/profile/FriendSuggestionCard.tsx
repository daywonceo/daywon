import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UserPlus, X } from 'lucide-react';
import { MutualFriendsIndicator } from './MutualFriendsIndicator';
import type { FriendSuggestion } from '@/hooks/useFriendSuggestions';

interface FriendSuggestionCardProps {
  suggestion: FriendSuggestion;
  onAddFriend: (userId: string) => void;
  onDismiss: (userId: string) => void;
  isLoading?: boolean;
}

export const FriendSuggestionCard = ({
  suggestion,
  onAddFriend,
  onDismiss,
  isLoading
}: FriendSuggestionCardProps) => {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow bg-card/50 backdrop-blur-sm border-border/50">
      <div className="flex items-start gap-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src={suggestion.avatar_url || ''} alt={suggestion.display_name} />
          <AvatarFallback>{suggestion.display_name?.charAt(0) || '?'}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-sm truncate">{suggestion.display_name}</h4>
              <p className="text-xs text-muted-foreground truncate">@{suggestion.username}</p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0"
              onClick={() => onDismiss(suggestion.user_id)}
              disabled={isLoading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="mt-2 space-y-1.5">
            {suggestion.mutual_friends_count > 0 && (
              <MutualFriendsIndicator count={suggestion.mutual_friends_count} />
            )}
            
            <p className="text-xs text-muted-foreground line-clamp-1">
              {suggestion.suggestion_reason}
            </p>
          </div>

          <Button
            size="sm"
            className="w-full mt-3"
            onClick={() => onAddFriend(suggestion.user_id)}
            disabled={isLoading}
          >
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
            Add Friend
          </Button>
        </div>
      </div>
    </Card>
  );
};
