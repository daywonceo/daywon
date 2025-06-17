
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Header />
      
      <main className="max-w-3xl mx-auto px-4 pb-32">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-green-800 dark:text-green-400 mb-2">
              Daily Guidance
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
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
