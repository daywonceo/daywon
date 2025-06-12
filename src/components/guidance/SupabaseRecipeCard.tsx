
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Utensils, AlertTriangle } from "lucide-react";
import { useSaveRecipe } from "@/hooks/useSaveRecipe";

interface SupabaseRecipe {
  title: string;
  ingredients: string[];
  instructions_url?: string;
  category?: string;
  is_dessert?: boolean;
}

interface SupabaseRecipeCardProps {
  recipe: SupabaseRecipe;
  index: number;
}

const SupabaseRecipeCard = ({ recipe, index }: SupabaseRecipeCardProps) => {
  const { saveRecipe, isSaving } = useSaveRecipe();

  const handleSaveRecipe = () => {
    saveRecipe({
      title: recipe.title,
      ingredients: recipe.ingredients,
      instructions_url: recipe.instructions_url,
      category: recipe.category,
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
        {recipe.is_dessert && (
          <div className="flex items-center text-orange-600 dark:text-orange-400">
            <AlertTriangle className="w-4 h-4 mr-1" />
            <span className="text-sm">Treat - Practice portion control!</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
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
