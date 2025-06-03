
import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dumbbell, Utensils, Book, Search, Clock, Users, Star } from "lucide-react";

const Guidance = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

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

  const biblePassages = [
    {
      reference: "Philippians 4:13",
      text: "I can do all things through Christ who strengthens me.",
      reflection: "Remember that your strength comes from above. When habits feel difficult, lean on this truth.",
      theme: "Strength",
      rating: 5.0
    },
    {
      reference: "1 Corinthians 10:31",
      text: "So whether you eat or drink or whatever you do, do it all for the glory of God.",
      reflection: "Every healthy choice you make can be an act of worship and stewardship of the body God gave you.",
      theme: "Purpose",
      rating: 4.9
    },
    {
      reference: "Proverbs 27:17",
      text: "As iron sharpens iron, so one person sharpens another.",
      reflection: "Surround yourself with people who encourage your growth and hold you accountable.",
      theme: "Community",
      rating: 4.8
    },
    {
      reference: "Galatians 6:9",
      text: "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.",
      reflection: "Persistence in building good habits will yield fruit. Don't give up when progress feels slow.",
      theme: "Perseverance",
      rating: 4.9
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

  const filteredPassages = biblePassages.filter(passage => 
    searchQuery === "" || 
    passage.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
    passage.theme.toLowerCase().includes(searchQuery.toLowerCase())
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
            <div className="grid gap-6">
              {filteredPassages.map((passage, index) => (
                <Card key={index} className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-green-800 dark:text-green-400 flex items-center">
                        <Book className="w-5 h-5 mr-2" />
                        {passage.reference}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{passage.theme}</Badge>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-500" />
                          <span>{passage.rating}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <blockquote className="border-l-4 border-green-500 pl-4 italic text-lg bg-green-50 dark:bg-green-900/20 p-4 rounded-r-lg">
                      "{passage.text}"
                    </blockquote>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-400">Reflection:</h4>
                      <p className="text-gray-600 dark:text-gray-300">{passage.reflection}</p>
                    </div>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Save for Later
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Guidance;
