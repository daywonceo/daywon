
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RefreshCw, ToggleLeft, ToggleRight } from "lucide-react";
import VerseCard from "./VerseCard";
import TranslationSelector from "./TranslationSelector";
import CategorySelector from "./CategorySelector";
import { useBibleVerses } from "@/hooks/useBibleVerses";

interface DevotionsVersesTabProps {
  selectedTranslation: string;
  selectedCategory: string;
  translationDialogOpen: boolean;
  onTranslationChange: (translation: string) => void;
  onCategoryChange: (category: string) => void;
  onTranslationClick: () => void;
  onTranslationDialogOpenChange: (open: boolean) => void;
}

const DevotionsVersesTab = ({
  selectedTranslation,
  selectedCategory,
  translationDialogOpen,
  onTranslationChange,
  onCategoryChange,
  onTranslationClick,
  onTranslationDialogOpenChange
}: DevotionsVersesTabProps) => {
  const [isFullPassage, setIsFullPassage] = useState(false);

  const {
    bibleVerses,
    isLoadingVerses,
    versesError,
    fetchBibleVerses
  } = useBibleVerses(selectedTranslation, selectedCategory, isFullPassage);

  const handleTranslationChange = (translation: string) => {
    onTranslationChange(translation);
    onTranslationDialogOpenChange(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Curated Daily Verses
            </h3>
            
            {/* Mobile-optimized controls */}
            <div className="space-y-3">
              {/* Full Passage Toggle */}
              <div className="flex items-center justify-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Quick Read
                </span>
                <button
                  onClick={() => setIsFullPassage(!isFullPassage)}
                  className="text-green-600 hover:text-green-700 transition-colors"
                  aria-label={isFullPassage ? "Switch to quick read" : "Switch to full passage"}
                >
                  {isFullPassage ? (
                    <ToggleRight className="w-8 h-8" />
                  ) : (
                    <ToggleLeft className="w-8 h-8" />
                  )}
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Full Passage
                </span>
              </div>

              {/* Category and Translation controls */}
              <div className="space-y-3">
                <div className="w-full">
                  <CategorySelector 
                    currentCategory={selectedCategory}
                    onCategoryChange={onCategoryChange}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Dialog open={translationDialogOpen} onOpenChange={onTranslationDialogOpenChange}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-sm h-9"
                      >
                        <span className="truncate">{selectedTranslation.toUpperCase()}</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-md mx-auto">
                      <DialogHeader>
                        <DialogTitle className="text-lg">Select Bible Translation</DialogTitle>
                      </DialogHeader>
                      <TranslationSelector 
                        currentTranslation={selectedTranslation}
                        onTranslationChange={handleTranslationChange}
                      />
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    onClick={fetchBibleVerses}
                    disabled={isLoadingVerses}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 px-3 h-9"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingVerses ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline text-sm">Refresh</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {versesError && (
            <Card className="mb-4 border-destructive">
              <CardContent className="p-3">
                <p className="text-destructive text-sm">{versesError}</p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {isLoadingVerses ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="bg-white dark:bg-gray-800 shadow-sm">
                  <CardContent className="p-3 sm:p-4 space-y-3">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                </Card>
              ))
            ) : (
              bibleVerses.map((verse, index) => (
                <VerseCard 
                  key={index}
                  verse={verse} 
                  isFullPassage={isFullPassage}
                  onTranslationClick={onTranslationClick}
                />
              ))
            )}
          </div>
        </div>
    </div>
  );
};

export default DevotionsVersesTab;
