
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Utensils, Book, Zap, Heart } from "lucide-react";
import WorkoutsTab from "./WorkoutsTab";
import NutritionTab from "./NutritionTab";
import DevotionsTab from "./DevotionsTab";
import BoredTab from "./BoredTab";
import MindfulReflectionTab from "./MindfulReflectionTab";

interface GuidanceTabsProps {
  searchQuery: string;
  selectedDifficulty: string;
  selectedTranslation: string;
  selectedCategory: string;
  translationDialogOpen: boolean;
  onDifficultyChange: (difficulty: string) => void;
  onTranslationChange: (translation: string) => void;
  onCategoryChange: (category: string) => void;
  onTranslationClick: () => void;
  onTranslationDialogOpenChange: (open: boolean) => void;
}

const GuidanceTabs = ({
  searchQuery,
  selectedDifficulty,
  selectedTranslation,
  selectedCategory,
  translationDialogOpen,
  onDifficultyChange,
  onTranslationChange,
  onCategoryChange,
  onTranslationClick,
  onTranslationDialogOpenChange
}: GuidanceTabsProps) => {
  return (
    <Tabs defaultValue="workouts" className="w-full">
      <TabsList className="grid w-full grid-cols-5 mb-10 shadow-sm h-12">
        <TabsTrigger value="workouts" className="py-3 text-xs">
          <Dumbbell className="w-4 h-4 mr-1" />
          WORKOUTS
        </TabsTrigger>
        <TabsTrigger value="nutrition" className="py-3 text-xs">
          <Utensils className="w-4 h-4 mr-1" />
          NUTRITION
        </TabsTrigger>
        <TabsTrigger value="devotions" className="py-3 text-xs">
          <Book className="w-4 h-4 mr-1" />
          DEVOTIONS
        </TabsTrigger>
        <TabsTrigger value="mindful" className="py-3 text-xs">
          <Heart className="w-4 h-4 mr-1" />
          MINDFUL
        </TabsTrigger>
        <TabsTrigger value="bored" className="py-3 text-xs">
          <Zap className="w-4 h-4 mr-1" />
          BORED
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
          selectedTranslation={selectedTranslation}
          selectedCategory={selectedCategory}
          translationDialogOpen={translationDialogOpen}
          searchQuery={searchQuery}
          onTranslationChange={onTranslationChange}
          onCategoryChange={onCategoryChange}
          onTranslationClick={onTranslationClick}
          onTranslationDialogOpenChange={onTranslationDialogOpenChange}
        />
      </TabsContent>
      
      <TabsContent value="mindful">
        <MindfulReflectionTab />
      </TabsContent>
      
      <TabsContent value="bored">
        <BoredTab searchQuery={searchQuery} />
      </TabsContent>
    </Tabs>
  );
};

export default GuidanceTabs;
