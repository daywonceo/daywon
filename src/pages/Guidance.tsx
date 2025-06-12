import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Utensils } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/guidance/SearchBar";
import GuidanceTabs from "@/components/guidance/GuidanceTabs";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface BibleVerse {
  reference: string;
  text: string;
  translation_name: string;
  translation_note?: string;
  category: string;
}

const Guidance = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("beginner");
  const [selectedTranslation, setSelectedTranslation] = useState("esv");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [translationDialogOpen, setTranslationDialogOpen] = useState(false);
  const [bibleVerses, setBibleVerses] = useState<BibleVerse[]>([]);
  const [isLoadingVerses, setIsLoadingVerses] = useState(false);
  const [versesError, setVersesError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBibleVerses();
  }, [selectedTranslation, selectedCategory]);

  const fetchBibleVerses = async () => {
    console.log('Fetching Bible verses...');
    setIsLoadingVerses(true);
    setVersesError(null);

    try {
      let query = supabase
        .from('bible_verses')
        .select('*')
        .eq('translation_name', selectedTranslation);

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching Bible verses:', error);
        setVersesError('Failed to fetch Bible verses.');
      } else {
        setBibleVerses(data || []);
        console.log(`Successfully loaded ${data?.length || 0} Bible verses`);
      }
    } catch (err) {
      console.error('Error fetching Bible verses:', err);
      setVersesError('Failed to fetch Bible verses.');
    } finally {
      setIsLoadingVerses(false);
    }
  };

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
          
          {/* Add Nutrition Goals Button */}
          <div className="flex gap-2">
            <Button
              onClick={() => navigate('/nutrition-goals')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Utensils className="w-4 h-4 mr-2" />
              Nutrition Goals
            </Button>
          </div>
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
          onTranslationChange={setSelectedTranslation}
          onCategoryChange={setSelectedCategory}
          onTranslationClick={() => setTranslationDialogOpen(true)}
          onTranslationDialogOpenChange={setTranslationDialogOpen}
          onFetchBibleVerses={fetchBibleVerses}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default Guidance;
