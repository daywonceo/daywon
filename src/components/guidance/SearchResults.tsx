
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, BookOpen } from "lucide-react";
import { useSavedVerses } from "@/hooks/useSavedVerses";
import { useToast } from "@/hooks/use-toast";
import ReflectionPrompt from "./ReflectionPrompt";

interface SearchResult {
  reference: string;
  text: string;
  translation_name: string;
  category?: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  keyword: string;
  highlightKeyword: (text: string, keyword: string) => string;
}

const SearchResults = ({ results, keyword, highlightKeyword }: SearchResultsProps) => {
  const { saveVerse } = useSavedVerses();
  const { toast } = useToast();

  const handleSaveVerse = async (verse: SearchResult) => {
    const success = await saveVerse(verse);
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

  if (results.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardContent className="p-6 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">
            No verses found for "{keyword}". Try searching for terms like "grace", "hope", "love", or "peace".
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Search Results for "{keyword}" ({results.length} verses found)
      </h3>
      
      {results.map((result, index) => (
        <Card key={index} className="bg-white dark:bg-gray-800 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2">
                  {result.reference}
                </h4>
                {result.category && (
                  <span className="inline-block px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full mb-2">
                    {result.category}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSaveVerse(result)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Heart className="w-4 h-4" />
              </Button>
            </div>
            
            <div 
              className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2"
              dangerouslySetInnerHTML={{ 
                __html: highlightKeyword(result.text, keyword) 
              }}
            />
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {result.translation_name}
            </p>

            <ReflectionPrompt verseReference={result.reference} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SearchResults;
