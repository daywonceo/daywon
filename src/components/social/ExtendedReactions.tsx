import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface ExtendedReactionsProps {
  postId: string;
  currentReaction?: string;
  reactionCounts?: Record<string, number>;
  onReact: (postId: string, reactionType: string) => void;
  className?: string;
}

const REACTION_TYPES = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'fire', emoji: '🔥', label: 'Fire' },
  { type: 'clap', emoji: '👏', label: 'Clap' },
  { type: 'star', emoji: '⭐', label: 'Star' },
  { type: 'strong', emoji: '💪', label: 'Strong' },
  { type: 'mind_blown', emoji: '🤯', label: 'Mind Blown' },
  { type: 'celebrate', emoji: '🎉', label: 'Celebrate' },
];

const ExtendedReactions = ({ 
  postId, 
  currentReaction, 
  reactionCounts = {}, 
  onReact, 
  className 
}: ExtendedReactionsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Get the most popular reactions to show by default
  const topReactions = REACTION_TYPES
    .filter(reaction => (reactionCounts[reaction.type] || 0) > 0)
    .sort((a, b) => (reactionCounts[b.type] || 0) - (reactionCounts[a.type] || 0))
    .slice(0, 3);

  // If user has reacted, make sure their reaction is included
  if (currentReaction && !topReactions.find(r => r.type === currentReaction)) {
    const userReaction = REACTION_TYPES.find(r => r.type === currentReaction);
    if (userReaction) {
      topReactions.unshift(userReaction);
      if (topReactions.length > 3) {
        topReactions.pop();
      }
    }
  }

  const handleReaction = (reactionType: string) => {
    onReact(postId, reactionType);
    setIsOpen(false);
  };

  const getTotalReactions = () => {
    return Object.values(reactionCounts).reduce((sum, count) => sum + count, 0);
  };

  const totalReactions = getTotalReactions();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Quick reaction buttons for top reactions */}
      {topReactions.map((reaction) => {
        const count = reactionCounts[reaction.type] || 0;
        const isSelected = currentReaction === reaction.type;
        
        return (
          <Button
            key={reaction.type}
            variant="ghost"
            size="sm"
            onClick={() => handleReaction(reaction.type)}
            className={`h-8 px-2 text-sm transition-all duration-200 ${
              isSelected 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 scale-105' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <span className="text-base mr-1">{reaction.emoji}</span>
            {count > 0 && <span className="text-xs font-medium">{count}</span>}
          </Button>
        );
      })}

      {/* Reaction picker popover */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <span className="text-lg">😊</span>
            <span className="text-xs ml-1">+</span>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-3" align="start">
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-900 dark:text-white">
              Choose your reaction
            </h4>
            
            <div className="grid grid-cols-4 gap-2">
              {REACTION_TYPES.map((reaction) => {
                const count = reactionCounts[reaction.type] || 0;
                const isSelected = currentReaction === reaction.type;
                
                return (
                  <Button
                    key={reaction.type}
                    variant="ghost"
                    onClick={() => handleReaction(reaction.type)}
                    className={`h-auto p-3 flex flex-col items-center space-y-1 relative transition-all duration-200 ${
                      isSelected 
                        ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500 scale-105' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className="text-2xl">{reaction.emoji}</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium text-center leading-tight">
                      {reaction.label}
                    </span>
                    {count > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {count}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>

            {totalReactions > 0 && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {totalReactions} total reaction{totalReactions === 1 ? '' : 's'}
                </p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Total reactions summary (only show if there are reactions and no individual counts shown) */}
      {totalReactions > 0 && topReactions.length === 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="h-8 px-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          {totalReactions} reaction{totalReactions === 1 ? '' : 's'}
        </Button>
      )}
    </div>
  );
};

export default ExtendedReactions;