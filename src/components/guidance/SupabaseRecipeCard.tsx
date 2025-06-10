
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, AlertTriangle } from "lucide-react";

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
  return (
    <Card key={`supabase-${index}`} className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-green-800 dark:text-green-400 flex items-center">
              {recipe.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 mt-2">
              {recipe.category && <Badge variant="secondary">{recipe.category}</Badge>}
              {recipe.is_dessert && (
                <div className="flex items-center text-orange-600 dark:text-orange-400">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  <span className="text-sm">Treat - Practice portion control!</span>
                </div>
              )}
            </CardDescription>
          </div>
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
        {recipe.instructions_url && (
          <div>
            <a 
              href={recipe.instructions_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Instructions
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SupabaseRecipeCard;
