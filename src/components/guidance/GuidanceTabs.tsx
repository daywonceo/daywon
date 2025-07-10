
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
      <TabsList className="grid w-full grid-cols-5 mb-10 shadow-sm h-16 p-1 gap-1">
        <TabsTrigger value="workouts" className="flex flex-col items-center justify-center py-1 px-0.5 text-[10px] h-full">
          <Dumbbell className="w-3 h-3 mb-0.5" />
          <span className="leading-none font-medium">WORKOUTS</span>
        </TabsTrigger>
        <TabsTrigger value="nutrition" className="flex flex-col items-center justify-center py-1 px-0.5 text-[10px] h-full">
          <Utensils className="w-3 h-3 mb-0.5" />
          <span className="leading-none font-medium">NUTRITION</span>
        </TabsTrigger>
        <TabsTrigger value="devotions" className="flex flex-col items-center justify-center py-1 px-0.5 text-[10px] h-full">
          <Book className="w-3 h-3 mb-0.5" />
          <span className="leading-none font-medium">SPIRITUAL</span>
        </TabsTrigger>
        <TabsTrigger value="mindful" className="flex flex-col items-center justify-center py-1 px-0.5 text-[10px] h-full">
          <Heart className="w-3 h-3 mb-0.5" />
          <span className="leading-none font-medium">MINDFUL</span>
        </TabsTrigger>
        <TabsTrigger value="bored" className="flex flex-col items-center justify-center py-1 px-0.5 text-[10px] h-full">
          <Zap className="w-3 h-3 mb-0.5" />
          <span className="leading-none font-medium">BORED</span>
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
        <NutritionTab />
      </TabsContent>
      
      <TabsContent value="devotions">
        <DevotionsTab
          selectedTranslation={selectedTranslation}
          selectedCategory={selectedCategory}
          translationDialogOpen={translationDialogOpen}
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
        <BoredTab />
      </TabsContent>
    </Tabs>
  );
};

export default GuidanceTabs;
