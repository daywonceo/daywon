
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import SavedRecipesTab from "./SavedRecipesTab";
import NutritionTabContent from "./NutritionTabContent";
import MealPlannerTab from "./MealPlannerTab";

const NutritionTab = () => {
  const [showSavedRecipes, setShowSavedRecipes] = useState(false);

  const handleBackToNutrition = () => {
    setShowSavedRecipes(false);
  };

  if (showSavedRecipes) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-bold text-green-800 dark:text-green-400">
              Saved Recipes
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToNutrition}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Nutrition
          </Button>
        </div>

        <SavedRecipesTab />
      </div>
    );
  }

  return (
    <Tabs defaultValue="browse" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
        <TabsTrigger value="browse">Browse</TabsTrigger>
        <TabsTrigger value="planner">Planner</TabsTrigger>
      </TabsList>
      <TabsContent value="browse">
        <NutritionTabContent onShowSavedRecipes={() => setShowSavedRecipes(true)} />
      </TabsContent>
      <TabsContent value="planner">
        <MealPlannerTab />
      </TabsContent>
    </Tabs>
  );
};

export default NutritionTab;
