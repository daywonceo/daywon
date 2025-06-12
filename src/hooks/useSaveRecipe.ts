
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RecipeToSave {
  title: string;
  ingredients: string[];
  instructions_url?: string;
  category?: string;
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    sugar?: number;
  };
  readyInMinutes?: number;
  servings?: number;
  is_dessert?: boolean;
}

export const useSaveRecipe = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const saveRecipe = async (recipe: RecipeToSave) => {
    setIsSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to save recipes",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('saved_recipes')
        .insert({
          user_id: user.id,
          recipe_title: recipe.title,
          recipe_ingredients: recipe.ingredients,
          recipe_instructions_url: recipe.instructions_url,
          recipe_category: recipe.category,
          recipe_nutrition: recipe.nutrition || null,
          recipe_ready_in_minutes: recipe.readyInMinutes,
          recipe_servings: recipe.servings,
          is_dessert: recipe.is_dessert || false,
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already Saved",
            description: "This recipe is already in your collection",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Recipe saved!",
          description: "Added to your personal collection",
        });
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast({
        title: "Error",
        description: "Failed to save recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return { saveRecipe, isSaving };
};
