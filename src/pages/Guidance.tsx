import React, { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import SearchBar from "@/components/guidance/SearchBar";
import GuidanceTabs from "@/components/guidance/GuidanceTabs";
import { FeatureErrorBoundary } from "@/lib/errors/ErrorHandler";

const Guidance = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("beginner");
  const [selectedTranslation, setSelectedTranslation] = useState("esv");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [translationDialogOpen, setTranslationDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("workouts");

  const showSearchBar = activeTab === "workouts";

  return (
    <PageLayout>
      <PageHeader 
        title="Daily Guidance" 
        subtitle="Workouts, nutrition, and spiritual guidance for your journey"
      />

        {showSearchBar && (
          <div className="mb-8">
            <SearchBar 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
        )}

        <FeatureErrorBoundary featureName="Guidance">
          <GuidanceTabs
            searchQuery={searchQuery}
            selectedDifficulty={selectedDifficulty}
            selectedTranslation={selectedTranslation}
            selectedCategory={selectedCategory}
            translationDialogOpen={translationDialogOpen}
            onDifficultyChange={setSelectedDifficulty}
            onTranslationChange={setSelectedTranslation}
            onCategoryChange={setSelectedCategory}
            onTranslationClick={() => setTranslationDialogOpen(true)}
            onTranslationDialogOpenChange={setTranslationDialogOpen}
          />
        </FeatureErrorBoundary>
    </PageLayout>
  );
};

export default Guidance;
