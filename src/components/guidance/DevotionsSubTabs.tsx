
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
      <TabsList className="grid w-full grid-cols-4 mb-6 h-12">
        <TabsTrigger value="verses" className="flex items-center gap-2 text-xs">
          <Book className="w-4 h-4" />
          Verses
        </TabsTrigger>
        <TabsTrigger value="devotions" className="flex items-center gap-2 text-xs">
          <Heart className="w-4 h-4" />
          Devotions
        </TabsTrigger>
        <TabsTrigger value="sermons" className="flex items-center gap-2 text-xs">
          <Play className="w-4 h-4" />
          Sermons
        </TabsTrigger>
        <TabsTrigger value="saved" className="flex items-center gap-2 text-xs">
          <Archive className="w-4 h-4" />
          Saved
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
