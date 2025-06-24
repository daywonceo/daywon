
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RefreshCw, ToggleLeft, ToggleRight } from "lucide-react";
import VerseCard from "./VerseCard";
import TranslationSelector from "./TranslationSelector";
import CategorySelector from "./CategorySelector";
import DevotionsSearchBar from "./DevotionsSearchBar";
import SearchResults from "./SearchResults";
import { useBibleVerses } from "@/hooks/useBibleVerses";
import { useBibleSearch } from "@/hooks/useBibleSearch";

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
  const [searchMode, setSearchMode] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  const {
    bibleVerses,
    isLoadingVerses,
    versesError,
    fetchBibleVerses
  } = useBibleVerses(selectedTranslation, selectedCategory, isFullPassage);

  const {
    searchResults,
    isSearching,
    searchError,
    searchBible,
    highlightKeyword
  } = useBibleSearch();

  const handleTranslationChange = (translation: string) => {
    onTranslationChange(translation);
    onTranslationDialogOpenChange(false);
  };

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    if (keyword.trim()) {
      setSearchMode(true);
      searchBible(keyword, selectedTranslation);
    } else {
      setSearchMode(false);
    }
  };

  return (
    <div className="animate-fade-in px-2 sm:px-0">
      <div className="mb-4 sm:mb-6">
        <DevotionsSearchBar 
          onSearch={handleSearch}
          isSearching={isSearching}
        />
      </div>

      {searchMode ? (
        <div className="space-y-4">
          <div className="mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchMode(false);
                setSearchKeyword("");
              }}
              className="text-xs sm:text-sm h-8 sm:h-9"
            >
              ← Back to Curated Verses
            </Button>
          </div>
          
          {searchError && (
            <Card className="mb-6 border-red-200 dark:border-red-800">
              <CardContent className="p-3 sm:p-4">
                <p className="text-red-600 dark:text-red-400 text-sm">{searchError}</p>
              </CardContent>
            </Card>
          )}

          <SearchResults 
            results={searchResults}
            keyword={searchKeyword}
            highlightKeyword={highlightKeyword}
          />
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 px-1">
              Curated Daily Verses
            </h3>
            
            {/* Mobile-optimized controls */}
            <div className="space-y-3">
              {/* Full Passage Toggle - Mobile optimized */}
              <div className="flex items-center justify-center gap-3 px-3 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg mx-1">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
                  Quick Read
                </span>
                <button
                  onClick={() => setIsFullPassage(!isFullPassage)}
                  className="text-green-600 hover:text-green-700 transition-colors"
                  aria-label={isFullPassage ? "Switch to quick read" : "Switch to full passage"}
                >
                  {isFullPassage ? (
                    <ToggleRight className="w-7 h-7 sm:w-8 sm:h-8" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 sm:w-8 sm:h-8" />
                  )}
                </button>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
                  Full Passage
                </span>
              </div>

              {/* Category and Translation controls - Mobile stacked */}
              <div className="space-y-3 px-1">
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
                        className="flex-1 text-xs sm:text-sm h-8 sm:h-9 min-w-0"
                      >
                        <span className="truncate">{selectedTranslation.toUpperCase()}</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-md mx-auto">
                      <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg">Select Bible Translation</DialogTitle>
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
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 h-8 sm:h-9"
                  >
                    <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${isLoadingVerses ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline text-xs sm:text-sm">Refresh</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {versesError && (
            <Card className="mb-4 sm:mb-6 border-red-200 dark:border-red-800 mx-1">
              <CardContent className="p-3 sm:p-4">
                <p className="text-red-600 dark:text-red-400 text-xs sm:text-sm">{versesError}</p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3 sm:space-y-4">
            {isLoadingVerses ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="bg-white dark:bg-gray-800 shadow-sm mx-1">
                  <CardContent className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
                    <Skeleton className="h-5 sm:h-6 w-28 sm:w-32" />
                    <Skeleton className="h-16 sm:h-20 w-full" />
                    <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
                  </CardContent>
                </Card>
              ))
            ) : (
              bibleVerses.map((verse, index) => (
                <div key={index} className="mx-1">
                  <VerseCard 
                    verse={verse} 
                    isFullPassage={isFullPassage}
                    onTranslationClick={onTranslationClick}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DevotionsVersesTab;
