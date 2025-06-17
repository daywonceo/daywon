
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RefreshCw } from "lucide-react";
import VerseCard from "./VerseCard";
import TranslationSelector from "./TranslationSelector";
import CategorySelector from "./CategorySelector";
import { useBibleVerses } from "@/hooks/useBibleVerses";

interface DevotionsTabProps {
  selectedTranslation: string;
  selectedCategory: string;
  translationDialogOpen: boolean;
  onTranslationChange: (translation: string) => void;
  onCategoryChange: (category: string) => void;
  onTranslationClick: () => void;
  onTranslationDialogOpenChange: (open: boolean) => void;
}

const DevotionsTab = ({
  selectedTranslation,
  selectedCategory,
  translationDialogOpen,
  onTranslationChange,
  onCategoryChange,
  onTranslationClick,
  onTranslationDialogOpenChange
}: DevotionsTabProps) => {
  const {
    bibleVerses,
    isLoadingVerses,
    versesError,
    fetchBibleVerses
  } = useBibleVerses(selectedTranslation, selectedCategory);

  const handleTranslationChange = (translation: string) => {
    onTranslationChange(translation);
    onTranslationDialogOpenChange(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Daily Verses</h3>
        <div className="flex flex-wrap gap-4 items-center">
          <CategorySelector 
            currentCategory={selectedCategory}
            onCategoryChange={onCategoryChange}
          />
          <Dialog open={translationDialogOpen} onOpenChange={onTranslationDialogOpenChange}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Translation: {selectedTranslation.toUpperCase()}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Bible Translation</DialogTitle>
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
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingVerses ? 'animate-spin' : ''}`} />
            Refresh Verses
          </Button>
        </div>
      </div>

      {versesError && (
        <Card className="mb-6 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <p className="text-red-600 dark:text-red-400">{versesError}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {isLoadingVerses ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="bg-white dark:bg-gray-800 shadow-sm">
              <CardContent className="p-6 space-y-4">
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
              onTranslationClick={onTranslationClick}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default DevotionsTab;
