
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Utensils, Clock, Star } from "lucide-react";

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
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
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
  );
};

export default RecipeCard;
