
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
    <div className="min-h-screen gradient-subtle">
      <Header />
      
      {/* Enhanced hero section with color and spacing */}
      <div className="gradient-warm border-b border-primary-light/20">
        <div className="container-responsive pt-8 pb-6">
          <div className="text-center">
            <div className="mb-4">
              <h1 className="text-gradient-primary text-3xl sm:text-4xl font-bold mb-3">
                Daily Guidance
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto text-base">
                Workouts, nutrition, and spiritual guidance for your journey
              </p>
            </div>
            
            {/* Decorative accent */}
            <div className="flex justify-center mb-2">
              <div className="w-16 h-1 gradient-primary rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
      
      <main className="container-responsive py-8 pb-32">

        {showSearchBar && (
          <div className="mb-8">
            <SearchBar 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
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
