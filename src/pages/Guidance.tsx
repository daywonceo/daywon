import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dumbbell, Utensils, Book, Search, Clock, Users, Star, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface BibleVerse {
  reference: string;
  text: string;
  translation_name: string;
  translation_note?: string;
}

const Guidance = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [bibleVerses, setBibleVerses] = useState<BibleVerse[]>([]);
  const [isLoadingVerses, setIsLoadingVerses] = useState(true);
  const [versesError, setVersesError] = useState<string | null>(null);

  // Predefined list of verses to rotate through
  const verseReferences = [
    "philippians 4:13",
    "1 corinthians 10:31", 
    "proverbs 27:17",
    "galatians 6:9",
    "psalm 23:1",
    "jeremiah 29:11",
    "romans 8:28",
    "matthew 6:26",
    "joshua 1:9"
  ];

  const fetchBibleVerses = async () => {
    setIsLoadingVerses(true);
    setVersesError(null);
    
    try {
      // Select 4 random verses from our list
      const selectedRefs = verseReferences
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
      
      const fetchPromises = selectedRefs.map(async (ref) => {
        const response = await fetch(`https://bible-api.com/${encodeURIComponent(ref)}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${ref}`);
        }
        return response.json();
      });

      const results = await Promise.all(fetchPromises);
      
      const formattedVerses: BibleVerse[] = results.map((result) => ({
        reference: result.reference,
        text: result.text.trim(),
        translation_name: result.translation_name || "KJV",
        translation_note: result.translation_note
      }));

      setBibleVerses(formattedVerses);
    } catch (error) {
      console.error('Error fetching Bible verses:', error);
      setVersesError('Failed to load verses. Please try again.');
    } finally {
      setIsLoadingVerses(false);
    }
  };

  useEffect(() => {
    fetchBibleVerses();
  }, []);

  const workoutSuggestions = [
    {
      title: "Morning Energizer",
      duration: "10 minutes",
      difficulty: "beginner",
      rating: 4.8,
      exercises: ["20 jumping jacks", "10 push-ups", "30-second plank", "15 squats", "10 burpees"],
      category: "Cardio"
    },
    {
      title: "Desk Break",
      duration: "5 minutes",
      difficulty: "beginner",
      rating: 4.5,
      exercises: ["Neck rolls", "Shoulder shrugs", "Desk push-ups", "Calf raises", "Seated spinal twist"],
      category: "Stretching"
    },
    {
      title: "Evening Wind-Down",
      duration: "15 minutes",
      difficulty: "intermediate",
      rating: 4.7,
      exercises: ["Light stretching", "Yoga poses", "Deep breathing", "Gentle core work", "Meditation"],
      category: "Yoga"
    }
  ];

  const healthyRecipes = [
    {
      title: "Green Power Smoothie",
      prep: "5 minutes",
      difficulty: "beginner",
      rating: 4.9,
      ingredients: ["1 banana", "1 cup spinach", "1/2 apple", "1 tbsp almond butter", "1 cup almond milk"],
      instructions: "Blend all ingredients until smooth. Perfect for post-workout nutrition!",
      category: "Smoothie"
    },
    {
      title: "Overnight Oats",
      prep: "5 minutes (night before)",
      difficulty: "beginner",
      rating: 4.6,
      ingredients: ["1/2 cup oats", "1/2 cup milk", "1 tbsp chia seeds", "1 tsp honey", "Fresh berries"],
      instructions: "Mix ingredients, refrigerate overnight. Top with berries in the morning.",
      category: "Breakfast"
    },
    {
      title: "Quick Veggie Bowl",
      prep: "15 minutes",
      difficulty: "intermediate",
      rating: 4.8,
      ingredients: ["1 cup quinoa", "Mixed vegetables", "Olive oil", "Lemon juice", "Herbs & spices"],
      instructions: "Cook quinoa, sauté vegetables, combine with dressing. Nutritious and filling!",
      category: "Bowl"
    }
  ];

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
                <Card key={index} className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-green-800 dark:text-green-400 flex items-center">
                          <Dumbbell className="w-5 h-5 mr-2" />
                          {workout.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {workout.duration}
                          </span>
                          <Badge variant="secondary">{workout.category}</Badge>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1 text-yellow-500" />
                            <span>{workout.rating}</span>
                          </div>
                        </CardDescription>
                      </div>
                      <Badge variant={workout.difficulty === "beginner" ? "default" : "secondary"}>
                        {workout.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {workout.exercises.map((exercise, idx) => (
                        <li key={idx} className="flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                          {exercise}
                        </li>
                      ))}
                    </ul>
                    <Button className="mt-4 w-full bg-green-600 hover:bg-green-700">
                      Start Workout
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="nutrition" className="animate-fade-in">
            <div className="grid gap-6">
              {filteredRecipes.map((recipe, index) => (
                <Card key={index} className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-green-800 dark:text-green-400 flex items-center">
                          <Utensils className="w-5 h-5 mr-2" />
                          {recipe.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {recipe.prep}
                          </span>
                          <Badge variant="secondary">{recipe.category}</Badge>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1 text-yellow-500" />
                            <span>{recipe.rating}</span>
                          </div>
                        </CardDescription>
                      </div>
                      <Badge variant={recipe.difficulty === "beginner" ? "default" : "secondary"}>
                        {recipe.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Ingredients:</h4>
                      <ul className="space-y-1">
                        {recipe.ingredients.map((ingredient, idx) => (
                          <li key={idx} className="flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                            {ingredient}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Instructions:</h4>
                      <p className="text-gray-600 dark:text-gray-300">{recipe.instructions}</p>
                    </div>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Save Recipe
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="devotions" className="animate-fade-in">
            <div className="mb-6 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Daily Verses</h3>
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

            {versesError && (
              <Card className="mb-6 border-red-200 dark:border-red-800">
                <CardContent className="p-4">
                  <p className="text-red-600 dark:text-red-400">{versesError}</p>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6">
              {isLoadingVerses ? (
                // Loading skeletons
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
                  <Card key={index} className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-green-800 dark:text-green-400 flex items-center">
                        <Book className="w-5 h-5 mr-2" />
                        {verse.reference}
                      </CardTitle>
                      <CardDescription>
                        <Badge variant="outline">{verse.translation_name}</Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <blockquote className="border-l-4 border-green-500 pl-4 italic text-lg bg-green-50 dark:bg-green-900/20 p-4 rounded-r-lg">
                        "{verse.text}"
                      </blockquote>
                      {verse.translation_note && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {verse.translation_note}
                        </p>
                      )}
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        Save for Later
                      </Button>
                    </CardContent>
                  </Card>
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
