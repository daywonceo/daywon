
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Heart, Smile } from "lucide-react";

interface ReactionPickerProps {
  onReaction: (emoji: string) => void;
  selectedReactions: string[];
}

const REACTION_EMOJIS = ["❤️", "🔥", "🎉", "💪", "✅", "👏", "🚀", "⭐"];

const ReactionPicker = ({ onReaction, selectedReactions }: ReactionPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleReaction = (emoji: string) => {
    onReaction(emoji);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-500 hover:text-red-500 h-8 px-2 text-xs"
        >
          <Heart size={14} className="mr-1" /> 
          Like
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <div className="grid grid-cols-4 gap-1">
          {REACTION_EMOJIS.map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 text-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                selectedReactions.includes(emoji) ? 'bg-green-100 dark:bg-green-900/30' : ''
              }`}
              onClick={() => handleReaction(emoji)}
            >
              {emoji}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ReactionPicker;
