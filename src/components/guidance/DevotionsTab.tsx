
import React from "react";
import DevotionsSubTabs from "./DevotionsSubTabs";

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
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Daily Devotions
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Explore verses, devotions, and sermons to deepen your faith journey
        </p>
      </div>

      <DevotionsSubTabs
        selectedTranslation={selectedTranslation}
        selectedCategory={selectedCategory}
        translationDialogOpen={translationDialogOpen}
        onTranslationChange={onTranslationChange}
        onCategoryChange={onCategoryChange}
        onTranslationClick={onTranslationClick}
        onTranslationDialogOpenChange={onTranslationDialogOpenChange}
      />
    </div>
  );
};

export default DevotionsTab;
