
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, Heart, Play, Archive } from "lucide-react";
import DevotionsVersesTab from "./DevotionsVersesTab";
import DevotionsContentTab from "./DevotionsContentTab";
import SermonsTab from "./SermonsTab";
import SavedDevotionsTab from "./SavedDevotionsTab";

interface DevotionsSubTabsProps {
  selectedTranslation: string;
  selectedCategory: string;
  translationDialogOpen: boolean;
  onTranslationChange: (translation: string) => void;
  onCategoryChange: (category: string) => void;
  onTranslationClick: () => void;
  onTranslationDialogOpenChange: (open: boolean) => void;
}

const DevotionsSubTabs = ({
  selectedTranslation,
  selectedCategory,
  translationDialogOpen,
  onTranslationChange,
  onCategoryChange,
  onTranslationClick,
  onTranslationDialogOpenChange
}: DevotionsSubTabsProps) => {
  return (
    <Tabs defaultValue="verses" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-4 sm:mb-6 h-10 sm:h-12">
        <TabsTrigger value="verses" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-3">
          <Book className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Verses</span>
          <span className="xs:hidden">V</span>
        </TabsTrigger>
        <TabsTrigger value="devotions" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-3">
          <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Devotions</span>
          <span className="xs:hidden">D</span>
        </TabsTrigger>
        <TabsTrigger value="sermons" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-3">
          <Play className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Sermons</span>
          <span className="xs:hidden">S</span>
        </TabsTrigger>
        <TabsTrigger value="saved" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-3">
          <Archive className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Saved</span>
          <span className="xs:hidden">★</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="verses">
        <DevotionsVersesTab
          selectedTranslation={selectedTranslation}
          selectedCategory={selectedCategory}
          translationDialogOpen={translationDialogOpen}
          onTranslationChange={onTranslationChange}
          onCategoryChange={onCategoryChange}
          onTranslationClick={onTranslationClick}
          onTranslationDialogOpenChange={onTranslationDialogOpenChange}
        />
      </TabsContent>
      
      <TabsContent value="devotions">
        <DevotionsContentTab />
      </TabsContent>
      
      <TabsContent value="sermons">
        <SermonsTab />
      </TabsContent>
      
      <TabsContent value="saved">
        <SavedDevotionsTab />
      </TabsContent>
    </Tabs>
  );
};

export default DevotionsSubTabs;
