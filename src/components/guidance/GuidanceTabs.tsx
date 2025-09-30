
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
      <TabsList className="grid w-full grid-cols-5 mb-10 h-16 p-2 gap-2 bg-white/80 backdrop-blur-md shadow-lg border border-white/20">
        <TabsTrigger value="workouts" className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 text-[9px] h-full text-muted-foreground data-[state=active]:text-foreground hover:text-foreground">
          <Dumbbell className="w-3.5 h-3.5" />
          <span className="leading-tight font-semibold">WORKOUTS</span>
        </TabsTrigger>
        <TabsTrigger value="nutrition" className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 text-[9px] h-full text-muted-foreground data-[state=active]:text-foreground hover:text-foreground">
          <Utensils className="w-3.5 h-3.5" />
          <span className="leading-tight font-semibold">NUTRITION</span>
        </TabsTrigger>
        <TabsTrigger value="devotions" className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 text-[9px] h-full text-muted-foreground data-[state=active]:text-foreground hover:text-foreground">
          <Book className="w-3.5 h-3.5" />
          <span className="leading-tight font-semibold">SPIRITUAL</span>
        </TabsTrigger>
        <TabsTrigger value="mindful" className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 text-[9px] h-full text-muted-foreground data-[state=active]:text-foreground hover:text-foreground">
          <Heart className="w-3.5 h-3.5" />
          <span className="leading-tight font-semibold">MINDFUL</span>
        </TabsTrigger>
        <TabsTrigger value="bored" className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 text-[9px] h-full text-muted-foreground data-[state=active]:text-foreground hover:text-foreground">
          <Zap className="w-3.5 h-3.5" />
          <span className="leading-tight font-semibold">BORED</span>
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
