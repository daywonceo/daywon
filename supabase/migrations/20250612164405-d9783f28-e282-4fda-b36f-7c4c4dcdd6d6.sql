
-- Create a table for saved recipes
CREATE TABLE public.saved_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  recipe_title TEXT NOT NULL,
  recipe_ingredients TEXT[] NOT NULL,
  recipe_instructions_url TEXT,
  recipe_category TEXT,
  recipe_nutrition JSONB,
  recipe_ready_in_minutes INTEGER,
  recipe_servings INTEGER,
  is_dessert BOOLEAN DEFAULT FALSE,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;

-- Create policies for saved recipes
CREATE POLICY "Users can view their own saved recipes" 
  ON public.saved_recipes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save their own recipes" 
  ON public.saved_recipes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved recipes" 
  ON public.saved_recipes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create unique constraint to prevent duplicate saves
CREATE UNIQUE INDEX saved_recipes_user_recipe_unique 
  ON public.saved_recipes (user_id, recipe_title);
