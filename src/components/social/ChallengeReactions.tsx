import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Plus, Smile } from 'lucide-react';
import { useChallengeReactions } from '@/hooks/useChallengeReactions';

interface ChallengeReactionsProps {
  challengeId: string;
  compact?: boolean;
  className?: string;
}

const ChallengeReactions = ({ challengeId, compact = false, className = "" }: ChallengeReactionsProps) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showReactionDetails, setShowReactionDetails] = useState<string | null>(null);
  
  const { 
    reactionSummary, 
    loading, 
    toggleReaction, 
    getReactionEmoji, 
    getTotalReactions,
    availableReactions 
  } = useChallengeReactions(challengeId);

  const handleReactionClick = async (reactionType: string) => {
    await toggleReaction(reactionType);
    setShowReactionPicker(false);
  };

  const renderReactionButton = (reactionType: string, data: any) => {
    const emoji = getReactionEmoji(reactionType);
    const { count, userHasReacted } = data;

    return (
      <TooltipProvider key={reactionType}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Popover
              open={showReactionDetails === reactionType}
              onOpenChange={(open) => setShowReactionDetails(open ? reactionType : null)}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size={compact ? "sm" : "default"}
                  onClick={() => handleReactionClick(reactionType)}
                  className={`flex items-center space-x-1 transition-all duration-200 ${
                    userHasReacted
                      ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  } ${compact ? 'h-7 px-2 text-xs' : 'h-9 px-3 text-sm'}`}
                >
                  <span className={compact ? 'text-sm' : 'text-base'}>{emoji}</span>
                  <span className="font-medium">{count}</span>
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-64 p-3" align="start">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{emoji}</span>
                    <span className="font-semibold text-gray-900 dark:text-white capitalize">
                      {reactionType.replace('_', ' ')}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {count}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {data.users.map((user: any, index: number) => {
                      const displayName = user.display_name || user.email || 'Anonymous';
                      return (
                        <div key={`${user.user_id}-${index}`} className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={displayName} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                              {displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {displayName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </TooltipTrigger>
          <TooltipContent>
            <p className="capitalize">{reactionType.replace('_', ' ')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-pulse">
          <div className="h-9 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const existingReactions = Object.entries(reactionSummary);
  const totalReactions = getTotalReactions();

  return (
    <div className={`flex items-center space-x-2 flex-wrap gap-2 ${className}`}>
      {/* Existing Reactions */}
      {existingReactions.map(([reactionType, data]) => 
        renderReactionButton(reactionType, data)
      )}

      {/* Add Reaction Button */}
      <Popover open={showReactionPicker} onOpenChange={setShowReactionPicker}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size={compact ? "sm" : "default"}
            className={`flex items-center space-x-1 hover:bg-gray-50 dark:hover:bg-gray-800 ${
              compact ? 'h-7 px-2' : 'h-9 px-3'
            }`}
          >
            {totalReactions === 0 ? (
              <>
                <Smile size={compact ? 14 : 16} />
                <span className={compact ? 'text-xs' : 'text-sm'}>React</span>
              </>
            ) : (
              <Plus size={compact ? 14 : 16} />
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <Smile size={16} />
              <span>Add Reaction</span>
            </h4>
            
            <div className="grid grid-cols-4 gap-2">
              {availableReactions.map(reactionType => {
                const emoji = getReactionEmoji(reactionType);
                const userHasReacted = reactionSummary[reactionType]?.userHasReacted;
                
                return (
                  <TooltipProvider key={reactionType}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReactionClick(reactionType)}
                          className={`h-12 w-12 text-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ${
                            userHasReacted 
                              ? 'bg-blue-50 border border-blue-300 dark:bg-blue-900/30 dark:border-blue-700' 
                              : ''
                          }`}
                        >
                          {emoji}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="capitalize">{reactionType.replace('_', ' ')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
            
            {totalReactions > 0 && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'} total
                </p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ChallengeReactions;
