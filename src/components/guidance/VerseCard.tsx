
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Book } from "lucide-react";

interface BibleVerse {
  reference: string;
  text: string;
  translation_name: string;
  translation_note?: string;
}

interface VerseCardProps {
  verse: BibleVerse;
  onTranslationClick: (reference: string) => void;
}

const VerseCard = ({ verse, onTranslationClick }: VerseCardProps) => {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-green-800 dark:text-green-400 flex items-center">
          <Book className="w-5 h-5 mr-2" />
          {verse.reference}
        </CardTitle>
        <CardDescription>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => onTranslationClick(verse.reference)}
          >
            {verse.translation_name}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <blockquote className="border-l-4 border-green-500 pl-4 italic text-lg bg-green-50 dark:bg-green-900/20 p-4 rounded-r-lg">
          "{verse.text}"
        </blockquote>
        {verse.translation_note && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {verse.translation_note}
          </p>
        )}
        <Button className="w-full bg-green-600 hover:bg-green-700">
          Save for Later
        </Button>
      </CardContent>
    </Card>
  );
};

export default VerseCard;
