
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Utensils, Clock, Users, Star } from "lucide-react";
import { useSaveRecipe } from "@/hooks/useSaveRecipe";

interface Recipe {
  title: string;
  prep: string;
  difficulty: string;
  rating: number;
  ingredients: string[];
  instructions: string;
  category: string;
}

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const { saveRecipe, isSaving } = useSaveRecipe();

  const handleSaveRecipe = () => {
    saveRecipe({
      title: recipe.title,
      ingredients: recipe.ingredients,
      category: recipe.category,
      is_dessert: false,
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
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {recipe.prep}
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            {recipe.rating}
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
        <div>
          <h4 className="font-semibold mb-2">Instructions:</h4>
          <p className="text-gray-600 dark:text-gray-300 text-sm">{recipe.instructions}</p>
        </div>
        <Button 
          className="w-full bg-green-600 hover:bg-green-700"
          onClick={handleSaveRecipe}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Recipe"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecipeCard;
