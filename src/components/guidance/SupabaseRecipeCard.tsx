
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Utensils, AlertTriangle, Clock, Users } from "lucide-react";
import { useSaveRecipe } from "@/hooks/useSaveRecipe";

interface SupabaseRecipe {
  title: string;
  ingredients: string[];
  instructions_url?: string;
  category?: string;
  is_dessert?: boolean;
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    sugar?: number;
  };
  readyInMinutes?: number;
  servings?: number;
}

interface SupabaseRecipeCardProps {
  recipe: SupabaseRecipe;
  index: number;
}

const SupabaseRecipeCard = ({ recipe, index }: SupabaseRecipeCardProps) => {
  const { saveRecipe, isSaving } = useSaveRecipe();

  // Debug logging
  console.log(`Recipe ${index} - ${recipe.title}:`, {
    hasNutrition: !!recipe.nutrition,
    nutritionData: recipe.nutrition,
    fullRecipe: recipe
  });

  const formatNutritionValue = (value: number | undefined, unit: string) => {
    return value ? `${Math.round(value)}${unit}` : 'N/A';
  };

  const handleSaveRecipe = () => {
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

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
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
        {recipe.is_dessert && (
          <div className="flex items-center text-orange-600 dark:text-orange-400">
            <AlertTriangle className="w-4 h-4 mr-1" />
            <span className="text-sm">Treat - Practice portion control!</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Debug nutrition data display */}
        <div className="bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded text-xs">
          <strong>Debug:</strong> Nutrition data present: {recipe.nutrition ? 'YES' : 'NO'}
          {recipe.nutrition && (
            <div>Calories: {recipe.nutrition.calories}, Protein: {recipe.nutrition.protein}</div>
          )}
        </div>

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
            onClick={handleSaveRecipe}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Recipe"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupabaseRecipeCard;
