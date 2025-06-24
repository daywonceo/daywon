
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Share2 } from "lucide-react";
import { useSavedVerses } from "@/hooks/useSavedVerses";
import { useToast } from "@/hooks/use-toast";
import ReflectionPrompt from "./ReflectionPrompt";

interface BibleVerse {
  reference: string;
  text: string;
  translation_name: string;
  translation_note?: string;
  category: string;
}

interface VerseCardProps {
  verse: BibleVerse;
  isFullPassage?: boolean;
  onTranslationClick: () => void;
}

const VerseCard = ({ verse, isFullPassage = false, onTranslationClick }: VerseCardProps) => {
  const { saveVerse } = useSavedVerses();
  const { toast } = useToast();

  const handleSaveVerse = async () => {
    const success = await saveVerse({
      reference: verse.reference,
      text: verse.text,
      translation_name: verse.translation_name,
      category: verse.category
    });

    if (success) {
      toast({
        title: "Verse saved",
        description: "This verse has been added to your saved collection.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to save verse. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    const shareText = `"${verse.text}" - ${verse.reference} (${verse.translation_name})`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: verse.reference,
          text: shareText,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to clipboard",
        description: "Verse text has been copied to your clipboard.",
      });
    }
  };

  // Truncate text if not full passage mode
  const displayText = isFullPassage 
    ? verse.text 
    : verse.text.length > 300 
      ? verse.text.substring(0, 300) + "..." 
      : verse.text;

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2">
              {verse.reference}
            </h4>
            <span className="inline-block px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
              {verse.category}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveVerse}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Heart className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-gray-500 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/20"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <blockquote className="text-gray-700 dark:text-gray-300 italic leading-relaxed mb-4 border-l-4 border-green-200 dark:border-green-800 pl-4">
          "{displayText}"
        </blockquote>
        
        <div className="flex items-center justify-between">
          <button 
            onClick={onTranslationClick}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            {verse.translation_name}
          </button>
          
          {!isFullPassage && verse.text.length > 300 && (
            <span className="text-xs text-gray-400">
              Toggle "Full Passage" to read more
            </span>
          )}
        </div>

        <ReflectionPrompt verseReference={verse.reference} />
      </CardContent>
    </Card>
  );
};

export default VerseCard;
