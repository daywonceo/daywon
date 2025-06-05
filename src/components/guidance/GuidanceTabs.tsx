
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Utensils, Book } from "lucide-react";
import WorkoutsTab from "./WorkoutsTab";
import NutritionTab from "./NutritionTab";
import DevotionsTab from "./DevotionsTab";

interface BibleVerse {
  reference: string;
  text: string;
  translation_name: string;
  translation_note?: string;
  category: string;
}

interface GuidanceTabsProps {
  searchQuery: string;
  selectedDifficulty: string;
  selectedTranslation: string;
  selectedCategory: string;
  translationDialogOpen: boolean;
  bibleVerses: BibleVerse[];
  isLoadingVerses: boolean;
  versesError: string | null;
  onDifficultyChange: (difficulty: string) => void;
  onTranslationChange: (translation: string) => void;
  onCategoryChange: (category: string) => void;
  onTranslationClick: () => void;
  onTranslationDialogOpenChange: (open: boolean) => void;
  onFetchBibleVerses: () => void;
}

const GuidanceTabs = ({
  searchQuery,
  selectedDifficulty,
  selectedTranslation,
  selectedCategory,
  translationDialogOpen,
  bibleVerses,
  isLoadingVerses,
  versesError,
  onDifficultyChange,
  onTranslationChange,
  onCategoryChange,
  onTranslationClick,
  onTranslationDialogOpenChange,
  onFetchBibleVerses
}: GuidanceTabsProps) => {
  return (
    <Tabs defaultValue="workouts" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-10 shadow-sm h-12">
        <TabsTrigger value="workouts" className="py-3 text-base">
          <Dumbbell className="w-4 h-4 mr-2" />
          WORKOUTS
        </TabsTrigger>
        <TabsTrigger value="nutrition" className="py-3 text-base">
          <Utensils className="w-4 h-4 mr-2" />
          NUTRITION
        </TabsTrigger>
        <TabsTrigger value="devotions" className="py-3 text-base">
          <Book className="w-4 h-4 mr-2" />
          DEVOTIONS
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="workouts">
        <WorkoutsTab
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={onDifficultyChange}
          searchQuery={searchQuery}
        />
      </TabsContent>
      
      <TabsContent value="nutrition">
        <NutritionTab searchQuery={searchQuery} />
      </TabsContent>
      
      <TabsContent value="devotions">
        <DevotionsTab
          bibleVerses={bibleVerses}
          isLoadingVerses={isLoadingVerses}
          versesError={versesError}
          selectedTranslation={selectedTranslation}
          selectedCategory={selectedCategory}
          translationDialogOpen={translationDialogOpen}
          searchQuery={searchQuery}
          onFetchBibleVerses={onFetchBibleVerses}
          onTranslationChange={onTranslationChange}
          onCategoryChange={onCategoryChange}
          onTranslationClick={onTranslationClick}
          onTranslationDialogOpenChange={onTranslationDialogOpenChange}
        />
      </TabsContent>
    </Tabs>
  );
};

export default GuidanceTabs;
