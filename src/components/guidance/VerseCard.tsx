
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Book, ExternalLink } from "lucide-react";

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
  const handleVerseClick = () => {
    // Extract book and chapter from reference (e.g., "Philippians 4:13" -> "Philippians 4")
    const bookAndChapter = verse.reference.split(':')[0];
    const bibleGatewayUrl = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(bookAndChapter)}&version=ESV`;
    window.open(bibleGatewayUrl, '_blank');
  };

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
        <blockquote 
          className="border-l-4 border-green-500 pl-4 italic text-lg bg-green-50 dark:bg-green-900/20 p-4 rounded-r-lg cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
          onClick={handleVerseClick}
          title="Click to read the full chapter"
        >
          <div className="flex items-start justify-between">
            <span>"{verse.text}"</span>
            <ExternalLink className="w-4 h-4 ml-2 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors flex-shrink-0" />
          </div>
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
