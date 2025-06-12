
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Utensils, Clock, Users, ArrowLeft, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import RecipeList from "./RecipeList";
import { useRecipeData } from "./useRecipeData";
import NutritionCategoryGrid from "./NutritionCategoryGrid";
import NutritionRecipeResults from "./NutritionRecipeResults";
import SavedRecipesTab from "./SavedRecipesTab";
import NutritionTabContent from "./NutritionTabContent";

interface NutritionTabProps {
  searchQuery: string;
}

const NutritionTab = ({ searchQuery }: NutritionTabProps) => {
  const [showSavedRecipes, setShowSavedRecipes] = useState(false);

  const handleBackToNutrition = () => {
    setShowSavedRecipes(false);
  };

  // If saved recipes view is active
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

        <SavedRecipesTab searchQuery={searchQuery} />
      </div>
    );
  }

  return (
    <NutritionTabContent 
      searchQuery={searchQuery}
      onShowSavedRecipes={() => setShowSavedRecipes(true)}
    />
  );
};

export default NutritionTab;
