
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, ExternalLink } from "lucide-react";

interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  nutrition: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
  summary: string;
  sourceUrl: string;
}

interface SpoonacularRecipeCardProps {
  recipe: SpoonacularRecipe;
}

const SpoonacularRecipeCard = ({ recipe }: SpoonacularRecipeCardProps) => {
  const calories = recipe.nutrition?.nutrients?.find(n => n.name === 'Calories');
  const protein = recipe.nutrition?.nutrients?.find(n => n.name === 'Protein');
  const carbs = recipe.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates');
  const fat = recipe.nutrition?.nutrients?.find(n => n.name === 'Fat');

  const handleViewRecipe = () => {
    window.open(recipe.sourceUrl, '_blank');
  };

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle className="text-green-800 dark:text-green-400 text-lg">
              {recipe.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 mt-2 flex-wrap">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {recipe.readyInMinutes} min
              </span>
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {recipe.servings} servings
              </span>
              {calories && (
                <Badge variant="secondary">
                  {Math.round(calories.amount)} cal
                </Badge>
              )}
              {protein && (
                <Badge variant="outline">
                  {Math.round(protein.amount)}g protein
                </Badge>
              )}
              {carbs && (
                <Badge variant="outline">
                  {Math.round(carbs.amount)}g carbs
                </Badge>
              )}
              {fat && (
                <Badge variant="outline">
                  {Math.round(fat.amount)}g fat
                </Badge>
              )}
            </CardDescription>
          </div>
          {recipe.image && (
            <img 
              src={recipe.image} 
              alt={recipe.title}
              className="w-20 h-20 object-cover rounded-lg"
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recipe.summary && (
          <div>
            <p 
              className="text-gray-600 dark:text-gray-300 text-sm"
              dangerouslySetInnerHTML={{ 
                __html: recipe.summary.slice(0, 150) + (recipe.summary.length > 150 ? '...' : '') 
              }}
            />
          </div>
        )}
        <Button 
          onClick={handleViewRecipe}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View Full Recipe
        </Button>
      </CardContent>
    </Card>
  );
};

export default SpoonacularRecipeCard;
