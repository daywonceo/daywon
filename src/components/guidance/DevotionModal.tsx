
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import ReflectionPrompt from "./ReflectionPrompt";

interface Devotion {
  id: number;
  title: string;
  author: string;
  excerpt: string;
  fullContent?: string;
  verse: string;
  category: string;
}

interface DevotionModalProps {
  devotion: Devotion;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

const DevotionModal = ({ devotion, isOpen, onClose, onSave }: DevotionModalProps) => {
  const fullContent = devotion.fullContent || `
    ${devotion.excerpt}

    When we think about ${devotion.category.toLowerCase()}, we often overlook the profound depth that Scripture reveals to us. The verse in ${devotion.verse} speaks directly to our hearts, reminding us that God's character is unchanging and His promises are sure.

    In our daily walk, we encounter moments that test our understanding of these truths. Yet, it is precisely in these moments that we can lean into the wisdom of God's Word and find the strength we need.

    As you reflect on this devotion today, consider how these truths might transform your perspective on the challenges you're facing. Remember that God's love for you is not dependent on your circumstances, but is rooted in His eternal character.

    Take time to meditate on ${devotion.verse} and ask the Holy Spirit to reveal new insights as you apply these truths to your life today.
  `;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-primary leading-tight">
                {devotion.title}
              </DialogTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                by {devotion.author}
              </p>
            </div>
            {onSave && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSave}
                className="text-destructive hover:bg-destructive/10 flex-shrink-0"
                aria-label="Save devotion"
              >
                <Heart className="w-5 h-5" />
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="inline-block px-3 py-1 text-sm bg-success/10 text-success rounded-full">
              {devotion.category}
            </span>
            <span className="text-sm font-medium text-success">
              Key Verse: {devotion.verse}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {fullContent}
            </div>
          </div>

          <div className="border-t pt-6">
            <ReflectionPrompt devotionTitle={devotion.title} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DevotionModal;
