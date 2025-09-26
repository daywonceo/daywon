
import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/guidance/SearchBar";
import GuidanceTabs from "@/components/guidance/GuidanceTabs";

const Guidance = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("beginner");
  const [selectedTranslation, setSelectedTranslation] = useState("esv");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [translationDialogOpen, setTranslationDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("workouts");

  const showSearchBar = activeTab === "workouts";

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light/20 via-background to-accent/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Header />
      
      <main className="max-w-4xl mx-auto px-responsive pb-32">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Daily Guidance
            </h1>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Workouts, nutrition, and spiritual guidance for your journey
            </p>
          </div>
        </div>

        {showSearchBar && (
          <SearchBar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

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
      </main>
      
      <Footer />
    </div>
  );
};

export default Guidance;
