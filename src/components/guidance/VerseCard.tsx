
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Heart, Share2, ChevronDown, ChevronUp } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(false);
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

  // For full passages, we'll show a preview and make it collapsible
  const getPreviewText = (text: string) => {
    const words = text.split(' ');
    if (words.length <= 30) return text;
    return words.slice(0, 30).join(' ') + '...';
  };

  const shouldShowCollapsible = isFullPassage && verse.text.split(' ').length > 30;
  const previewText = shouldShowCollapsible ? getPreviewText(verse.text) : verse.text;

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow w-full">
      <CardContent className="p-3 sm:p-4">
        {/* Header with reference and actions */}
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2 text-sm sm:text-base break-words">
              {verse.reference}
            </h4>
            <span className="inline-block px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
              {verse.category}
            </span>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveVerse}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0"
              aria-label="Save verse"
            >
              <Heart className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-gray-500 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/20 h-8 w-8 p-0"
              aria-label="Share verse"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Verse text - with collapsible functionality for full passages */}
        {shouldShowCollapsible ? (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="mb-3">
            <blockquote className="text-gray-700 dark:text-gray-300 italic leading-relaxed border-l-4 border-green-200 dark:border-green-800 pl-3 text-sm sm:text-base">
              "{isExpanded ? verse.text : previewText}"
            </blockquote>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 mt-2 h-8 text-xs sm:text-sm p-2"
              >
                <span className="mr-1">
                  {isExpanded ? "Show less" : "Read full passage"}
                </span>
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        ) : (
          <blockquote className="text-gray-700 dark:text-gray-300 italic leading-relaxed mb-3 border-l-4 border-green-200 dark:border-green-800 pl-3 text-sm sm:text-base">
            "{verse.text}"
          </blockquote>
        )}
        
        {/* Footer with translation info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 text-xs sm:text-sm">
          <button 
            onClick={onTranslationClick}
            className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors text-left"
            title={verse.translation_name}
          >
            {verse.translation_name}
          </button>
          
          <span className="text-gray-400 text-xs">
            {isFullPassage ? "Full Passage" : "Quick Read"}
          </span>
        </div>

        {/* Reflection prompt */}
        <ReflectionPrompt verseReference={verse.reference} />
      </CardContent>
    </Card>
  );
};

export default VerseCard;
