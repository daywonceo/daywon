
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Utensils, Clock, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSaveRecipe } from "@/hooks/useSaveRecipe";

interface RecipeWithNutrition {
  title: string;
  ingredients: string[];
  instructions_url?: string;
  category?: string;
  is_dessert?: boolean;
  readyInMinutes?: number;
  servings?: number;
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    sugar?: number;
  };
}

interface NutritionRecipeResultsProps {
  recipes: RecipeWithNutrition[];
  isLoading: boolean;
  error: string | null;
  categoryName: string;
}

const NutritionRecipeResults = ({ 
  recipes, 
  isLoading, 
  error, 
  categoryName 
}: NutritionRecipeResultsProps) => {
  const { saveRecipe, isSaving } = useSaveRecipe();

  const formatNutritionValue = (value: number | undefined, unit: string) => {
    return value ? `${Math.round(value)}${unit}` : 'N/A';
  };

  const handleSaveRecipe = (recipe: RecipeWithNutrition) => {
    saveRecipe({
      title: recipe.title,
      ingredients: recipe.ingredients,
      instructions_url: recipe.instructions_url,
      category: recipe.category,
      nutrition: recipe.nutrition,
      readyInMinutes: recipe.readyInMinutes,
      servings: recipe.servings,
      is_dessert: recipe.is_dessert || false,
    });
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="bg-white dark:bg-gray-800">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-800">
        <CardContent className="p-6">
          <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // No Results
  if (recipes.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-800">
        <CardContent className="p-6 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            No recipes found for {categoryName}. Try another category.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Recipe Results
  return (
    <div className="grid gap-6">
      {recipes.map((recipe, index) => (
        <Card key={index} className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-green-800 dark:text-green-400 flex items-center">
                <Utensils className="w-5 h-5 mr-2" />
                {recipe.title}
              </CardTitle>
              {recipe.category && (
                <Badge variant="secondary">{recipe.category}</Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              {recipe.readyInMinutes && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {recipe.readyInMinutes} min
                </div>
              )}
              {recipe.servings && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {recipe.servings} servings
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nutrition Facts */}
            {recipe.nutrition && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-green-800 dark:text-green-400">
                  Nutrition Per Serving
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Calories:</span>
                    <div>{formatNutritionValue(recipe.nutrition.calories, '')}</div>
                  </div>
                  <div>
                    <span className="font-medium">Protein:</span>
                    <div>{formatNutritionValue(recipe.nutrition.protein, 'g')}</div>
                  </div>
                  <div>
                    <span className="font-medium">Carbs:</span>
                    <div>{formatNutritionValue(recipe.nutrition.carbs, 'g')}</div>
                  </div>
                  <div>
                    <span className="font-medium">Fat:</span>
                    <div>{formatNutritionValue(recipe.nutrition.fat, 'g')}</div>
                  </div>
                  <div>
                    <span className="font-medium">Sugar:</span>
                    <div>{formatNutritionValue(recipe.nutrition.sugar, 'g')}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Ingredients */}
            <div>
              <h4 className="font-semibold mb-2">Ingredients:</h4>
              <ul className="space-y-1">
                {recipe.ingredients.slice(0, 5).map((ingredient, idx) => (
                  <li key={idx} className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    {ingredient}
                  </li>
                ))}
                {recipe.ingredients.length > 5 && (
                  <li className="text-sm text-gray-500 dark:text-gray-400 ml-5">
                    +{recipe.ingredients.length - 5} more ingredients
                  </li>
                )}
              </ul>
            </div>

            {/* Updated buttons section */}
            <div className="space-y-3">
              {recipe.instructions_url && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(recipe.instructions_url, '_blank')}
                >
                  View Full Recipe
                </Button>
              )}
              
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => handleSaveRecipe(recipe)}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Recipe"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NutritionRecipeResults;
