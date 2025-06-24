
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle } from "lucide-react";
import { useReflections } from "@/hooks/useReflections";
import { useToast } from "@/hooks/use-toast";

interface ReflectionPromptProps {
  verseReference?: string;
  devotionTitle?: string;
  sermonTitle?: string;
}

const ReflectionPrompt = ({ verseReference, devotionTitle, sermonTitle }: ReflectionPromptProps) => {
  const [reflection, setReflection] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { saveReflection } = useReflections();
  const { toast } = useToast();

  const handleSaveReflection = async () => {
    if (!reflection.trim()) return;

    setIsSaving(true);
    const success = await saveReflection({
      verse_reference: verseReference,
      devotion_title: devotionTitle,
      sermon_title: sermonTitle,
      reflection_text: reflection
    });

    if (success) {
      toast({
        title: "Reflection saved",
        description: "Your reflection has been added to your faith journal.",
      });
      setReflection("");
      setIsExpanded(false);
    } else {
      toast({
        title: "Error",
        description: "Failed to save reflection. Please try again.",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  };

  if (!isExpanded) {
    return (
      <Card className="mt-4 border-green-200 dark:border-green-800">
        <CardContent className="p-3 sm:p-4">
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(true)}
            className="w-full text-left flex items-start gap-3 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 p-3 text-sm sm:text-base min-h-0 h-auto"
          >
            <MessageCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="flex-1 leading-relaxed break-words">
              {devotionTitle 
                ? "What did this devotion mean to you today?" 
                : "What is God teaching me through this today?"
              }
            </span>
            <Heart className="w-4 h-4 flex-shrink-0 mt-0.5" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4 border-green-200 dark:border-green-800">
      <CardContent className="p-3 sm:p-4 space-y-4">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
          <MessageCircle className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium text-sm sm:text-base">Faith Journal Reflection</span>
        </div>
        
        <Textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder={devotionTitle 
            ? "What did this devotion mean to you today? How can you apply these insights to your life?"
            : "What is God teaching me through this today? How can I apply this to my life?"
          }
          className="min-h-[100px] border-green-200 dark:border-green-800 focus:ring-green-500 text-sm sm:text-base resize-none"
        />
        
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsExpanded(false);
              setReflection("");
            }}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSaveReflection}
            disabled={!reflection.trim() || isSaving}
            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
          >
            {isSaving ? "Saving..." : "Save Reflection"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReflectionPrompt;
