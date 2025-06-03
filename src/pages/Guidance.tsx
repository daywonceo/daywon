
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Utensils, Book } from "lucide-react";

const Guidance = () => {
  const workoutSuggestions = [
    {
      title: "Morning Energizer",
      duration: "10 minutes",
      exercises: ["20 jumping jacks", "10 push-ups", "30-second plank", "15 squats", "10 burpees"]
    },
    {
      title: "Desk Break",
      duration: "5 minutes",
      exercises: ["Neck rolls", "Shoulder shrugs", "Desk push-ups", "Calf raises", "Seated spinal twist"]
    },
    {
      title: "Evening Wind-Down",
      duration: "15 minutes",
      exercises: ["Light stretching", "Yoga poses", "Deep breathing", "Gentle core work", "Meditation"]
    }
  ];

  const healthyRecipes = [
    {
      title: "Green Power Smoothie",
      prep: "5 minutes",
      ingredients: ["1 banana", "1 cup spinach", "1/2 apple", "1 tbsp almond butter", "1 cup almond milk"],
      instructions: "Blend all ingredients until smooth. Perfect for post-workout nutrition!"
    },
    {
      title: "Overnight Oats",
      prep: "5 minutes (night before)",
      ingredients: ["1/2 cup oats", "1/2 cup milk", "1 tbsp chia seeds", "1 tsp honey", "Fresh berries"],
      instructions: "Mix ingredients, refrigerate overnight. Top with berries in the morning."
    },
    {
      title: "Quick Veggie Bowl",
      prep: "15 minutes",
      ingredients: ["1 cup quinoa", "Mixed vegetables", "Olive oil", "Lemon juice", "Herbs & spices"],
      instructions: "Cook quinoa, sauté vegetables, combine with dressing. Nutritious and filling!"
    }
  ];

  const biblePassages = [
    {
      reference: "Philippians 4:13",
      text: "I can do all things through Christ who strengthens me.",
      reflection: "Remember that your strength comes from above. When habits feel difficult, lean on this truth."
    },
    {
      reference: "1 Corinthians 10:31",
      text: "So whether you eat or drink or whatever you do, do it all for the glory of God.",
      reflection: "Every healthy choice you make can be an act of worship and stewardship of the body God gave you."
    },
    {
      reference: "Proverbs 27:17",
      text: "As iron sharpens iron, so one person sharpens another.",
      reflection: "Surround yourself with people who encourage your growth and hold you accountable."
    },
    {
      reference: "Galatians 6:9",
      text: "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.",
      reflection: "Persistence in building good habits will yield fruit. Don't give up when progress feels slow."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col text-gray-800 dark:text-gray-200">
      <Header />
      
      <main className="flex-grow px-4 sm:px-6 pb-24 pt-6 max-w-4xl mx-auto w-full">
        <div className="py-4 text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800 dark:text-green-400">GUIDANCE</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Resources to help you build better habits</p>
        </div>

        <Tabs defaultValue="workouts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-10 shadow-sm">
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
              {workoutSuggestions.map((workout, index) => (
                <Card key={index} className="bg-white dark:bg-gray-800 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-green-800 dark:text-green-400 flex items-center">
                      <Dumbbell className="w-5 h-5 mr-2" />
                      {workout.title}
                    </CardTitle>
                    <CardDescription>{workout.duration}</CardDescription>
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
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="nutrition" className="animate-fade-in">
            <div className="grid gap-6">
              {healthyRecipes.map((recipe, index) => (
                <Card key={index} className="bg-white dark:bg-gray-800 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-green-800 dark:text-green-400 flex items-center">
                      <Utensils className="w-5 h-5 mr-2" />
                      {recipe.title}
                    </CardTitle>
                    <CardDescription>Prep time: {recipe.prep}</CardDescription>
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
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="devotions" className="animate-fade-in">
            <div className="grid gap-6">
              {biblePassages.map((passage, index) => (
                <Card key={index} className="bg-white dark:bg-gray-800 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-green-800 dark:text-green-400 flex items-center">
                      <Book className="w-5 h-5 mr-2" />
                      {passage.reference}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <blockquote className="border-l-4 border-green-500 pl-4 italic text-lg">
                      "{passage.text}"
                    </blockquote>
                    <p className="text-gray-600 dark:text-gray-300 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <strong>Reflection:</strong> {passage.reflection}
                    </p>
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
