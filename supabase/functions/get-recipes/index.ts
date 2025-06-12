
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const spoonacularApiKey = Deno.env.get('SPOONACULAR_API_KEY')
    
    if (!spoonacularApiKey) {
      console.error('SPOONACULAR_API_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fetch healthy recipes from Spoonacular API with nutrition information
    const spoonacularUrl = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${spoonacularApiKey}&diet=healthy&number=10&addRecipeInformation=true&fillIngredients=true&addRecipeNutrition=true`
    
    console.log('Fetching recipes with nutrition from Spoonacular...')
    const response = await fetch(spoonacularUrl)
    
    if (!response.ok) {
      console.error('Spoonacular API error:', response.status, response.statusText)
      throw new Error(`Spoonacular API error: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('Spoonacular response received:', data?.results?.length || 0, 'recipes')
    
    // Transform Spoonacular data to match our expected format with nutrition
    const transformedRecipes = data.results?.map((recipe: any) => {
      // Extract nutrition data from Spoonacular response
      const nutrition = recipe.nutrition?.nutrients ? {
        calories: recipe.nutrition.nutrients.find((n: any) => n.name === 'Calories')?.amount,
        protein: recipe.nutrition.nutrients.find((n: any) => n.name === 'Protein')?.amount,
        carbs: recipe.nutrition.nutrients.find((n: any) => n.name === 'Carbohydrates')?.amount,
        fat: recipe.nutrition.nutrients.find((n: any) => n.name === 'Fat')?.amount,
        sugar: recipe.nutrition.nutrients.find((n: any) => n.name === 'Sugar')?.amount,
      } : undefined

      return {
        title: recipe.title,
        ingredients: recipe.extendedIngredients?.map((ing: any) => ing.original) || [],
        instructions_url: recipe.sourceUrl,
        category: recipe.dishTypes?.[0] || 'Main Course',
        is_dessert: recipe.dishTypes?.some((type: string) => 
          type.toLowerCase().includes('dessert') || 
          type.toLowerCase().includes('sweet')
        ) || false,
        nutrition,
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings
      }
    }) || []

    console.log('Transformed recipes with nutrition:', transformedRecipes.length)
    
    return new Response(
      JSON.stringify(transformedRecipes),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
    
  } catch (error) {
    console.error('Error in get-recipes function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch recipes', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
