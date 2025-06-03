
import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dumbbell, Utensils, Book, Search, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import WorkoutCard from "@/components/guidance/WorkoutCard";
import RecipeCard from "@/components/guidance/RecipeCard";
import VerseCard from "@/components/guidance/VerseCard";
import TranslationSelector from "@/components/guidance/TranslationSelector";
import { useBibleVerses } from "@/hooks/useBibleVerses";
import { workoutSuggestions, healthyRecipes } from "@/data/guidanceData";

const Guidance = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedTranslation, setSelectedTranslation] = useState("esv");
  const [translationDialogOpen, setTranslationDialogOpen] = useState(false);

  const { bibleVerses, isLoadingVerses, versesError, fetchBibleVerses } = useBibleVerses(selectedTranslation);

  const filteredWorkouts = workoutSuggestions.filter(workout => 
    (selectedDifficulty === "all" || workout.difficulty === selectedDifficulty) &&
    (searchQuery === "" || workout.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredRecipes = healthyRecipes.filter(recipe => 
    (selectedDifficulty === "all" || recipe.difficulty === selectedDifficulty) &&
    (searchQuery === "" || recipe.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredVerses = bibleVerses.filter(verse => 
    searchQuery === "" || 
    verse.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
    verse.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTranslationClick = () => {
    setTranslationDialogOpen(true);
  };

  const handleTranslationChange = (translation: string) => {
    setSelectedTranslation(translation);
    setTranslationDialogOpen(false);
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

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search for workouts, recipes, or verses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-green-200 dark:border-green-800 focus:border-green-400"
            />
          </div>
          <div className="flex gap-2">
            {["all", "beginner", "intermediate"].map((level) => (
              <Button
                key={level}
                variant={selectedDifficulty === level ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDifficulty(level)}
                className={selectedDifficulty === level ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="workouts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-10 shadow-sm h-12">
            <TabsTrigger value="workouts" className="py-3 text-base">
              <Dumbbell className="w-4 h-4 mr-2" />
              WORKOUTS
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="py-3 text-base">
              <Utensils className="w-4 h-4 mr-2" />
              NUTRITION
            </TabsTrigger>
            <TabsTrigger value="devotions" className="py-3 text-base">
              <Book className="w-4 h-4 mr-2" />
              DEVOTIONS
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="workouts" className="animate-fade-in">
            <div className="grid gap-6">
              {filteredWorkouts.map((workout, index) => (
                <WorkoutCard key={index} workout={workout} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="nutrition" className="animate-fade-in">
            <div className="grid gap-6">
              {filteredRecipes.map((recipe, index) => (
                <RecipeCard key={index} recipe={recipe} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="devotions" className="animate-fade-in">
            <div className="mb-6 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Daily Verses</h3>
              <div className="flex gap-4 items-center">
                <Dialog open={translationDialogOpen} onOpenChange={setTranslationDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Translation: {selectedTranslation.toUpperCase()}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Select Bible Translation</DialogTitle>
                    </DialogHeader>
                    <TranslationSelector 
                      currentTranslation={selectedTranslation}
                      onTranslationChange={handleTranslationChange}
                    />
                  </DialogContent>
                </Dialog>
                <Button
                  onClick={fetchBibleVerses}
                  disabled={isLoadingVerses}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingVerses ? 'animate-spin' : ''}`} />
                  Refresh Verses
                </Button>
              </div>
            </div>

            {versesError && (
              <Card className="mb-6 border-red-200 dark:border-red-800">
                <CardContent className="p-4">
                  <p className="text-red-600 dark:text-red-400">{versesError}</p>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6">
              {isLoadingVerses ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="bg-white dark:bg-gray-800 shadow-sm">
                    <CardHeader>
                      <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-4 w-24" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                filteredVerses.map((verse, index) => (
                  <VerseCard 
                    key={index} 
                    verse={verse} 
                    onTranslationClick={handleTranslationClick}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Guidance;
