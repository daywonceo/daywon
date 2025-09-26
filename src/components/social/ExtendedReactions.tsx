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
  { type: 'like', emoji: '👍' },
  { type: 'love', emoji: '❤️' },
  { type: 'heart_eyes', emoji: '😍' },
  { type: 'fire', emoji: '🔥' },
  { type: 'clap', emoji: '👏' },
  { type: 'star', emoji: '⭐' },
  { type: 'strong', emoji: '💪' },
  { type: 'mind_blown', emoji: '🤯' },
  { type: 'celebrate', emoji: '🎉' },
  { type: 'rocket', emoji: '🚀' },
  { type: 'trophy', emoji: '🏆' },
  { type: 'crown', emoji: '👑' },
  { type: 'gem', emoji: '💎' },
  { type: 'sparkles', emoji: '✨' },
  { type: 'lightning', emoji: '⚡' },
  { type: 'boom', emoji: '💥' },
  { type: 'hundred', emoji: '💯' },
  { type: 'pray', emoji: '🙏' },
  { type: 'raised_hands', emoji: '🙌' },
  { type: 'ok_hand', emoji: '👌' },
  { type: 'thumbs_down', emoji: '👎' },
  { type: 'laugh', emoji: '😂' },
  { type: 'joy', emoji: '😭' },
  { type: 'smiling_face', emoji: '😊' },
  { type: 'wink', emoji: '😉' },
  { type: 'cool', emoji: '😎' },
  { type: 'thinking', emoji: '🤔' },
  { type: 'surprised', emoji: '😮' },
  { type: 'shock', emoji: '😱' },
  { type: 'party', emoji: '🥳' },
  { type: 'flower', emoji: '🌸' },
  { type: 'sun', emoji: '☀️' },
  { type: 'rainbow', emoji: '🌈' },
  { type: 'peace', emoji: '✌️' },
  { type: 'victory', emoji: '🤝' },
  { type: 'fist_bump', emoji: '👊' },
  { type: 'wave', emoji: '👋' },
  { type: 'salute', emoji: '🫡' },
  { type: 'pinched_fingers', emoji: '🤌' },
  { type: 'crossed_fingers', emoji: '🤞' },
  { type: 'finger_heart', emoji: '🫰' },
  { type: 'heart_hands', emoji: '🫶' },
  { type: 'melting_face', emoji: '🫠' },
  { type: 'face_with_peeking_eye', emoji: '🫣' },
  { type: 'saluting_face', emoji: '🫡' },
  { type: 'dotted_line_face', emoji: '🫥' },
  { type: 'face_with_diagonal_mouth', emoji: '🫤' },
  { type: 'biting_lip', emoji: '🫦' },
  { type: 'beans', emoji: '🫘' },
  { type: 'ginger', emoji: '🫚' },
  { type: 'pea_pod', emoji: '🫛' },
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
            <span className="text-lg mr-1">{reaction.emoji}</span>
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
            
            <div className="grid grid-cols-6 gap-2">
              {REACTION_TYPES.map((reaction) => {
                const count = reactionCounts[reaction.type] || 0;
                const isSelected = currentReaction === reaction.type;
                
                return (
                  <Button
                    key={reaction.type}
                    variant="ghost"
                    onClick={() => handleReaction(reaction.type)}
                    className={`h-auto p-2 flex items-center justify-center relative transition-all duration-200 aspect-square ${
                      isSelected 
                        ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500 scale-105' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className="text-lg">{reaction.emoji}</span>
                    {count > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
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