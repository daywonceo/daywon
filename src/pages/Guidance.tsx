
import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/guidance/SearchBar";
import GuidanceTabs from "@/components/guidance/GuidanceTabs";
import { useBibleVerses } from "@/hooks/useBibleVerses";

const Guidance = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedTranslation, setSelectedTranslation] = useState("esv");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [translationDialogOpen, setTranslationDialogOpen] = useState(false);

  const { bibleVerses, isLoadingVerses, versesError, fetchBibleVerses } = useBibleVerses(selectedTranslation, selectedCategory);

  const handleTranslationClick = () => {
    setTranslationDialogOpen(true);
  };

  const handleTranslationChange = (translation: string) => {
    setSelectedTranslation(translation);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col text-gray-800 dark:text-gray-200">
      <Header />
      
      <main className="flex-grow px-4 sm:px-6 pb-24 pt-6 max-w-4xl mx-auto w-full">
        <div className="py-4 text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            GUIDANCE CENTER
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Resources, tips, and inspiration to help you build better habits
          </p>
        </div>

        <SearchBar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <GuidanceTabs
          searchQuery={searchQuery}
          selectedDifficulty={selectedDifficulty}
          selectedTranslation={selectedTranslation}
          selectedCategory={selectedCategory}
          translationDialogOpen={translationDialogOpen}
          bibleVerses={bibleVerses}
          isLoadingVerses={isLoadingVerses}
          versesError={versesError}
          onDifficultyChange={setSelectedDifficulty}
          onTranslationChange={handleTranslationChange}
          onCategoryChange={handleCategoryChange}
          onTranslationClick={handleTranslationClick}
          onTranslationDialogOpenChange={setTranslationDialogOpen}
          onFetchBibleVerses={fetchBibleVerses}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default Guidance;
