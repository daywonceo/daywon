import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Dumbbell, Utensils, Heart, Book, Loader2, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const ContentGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState('workout');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const { toast } = useToast();

  const generateContent = async (type: string, preferences: any = {}) => {
    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      console.log('Generating content, type:', type);

      let functionName = '';
      let body: any = { preferences };

      switch (type) {
        case 'workout':
          functionName = 'generate-ai-workout-plan';
          body.preferences = {
            fitnessLevel: 'intermediate',
            goals: 'muscle building',
            daysPerWeek: 4,
            duration: 60,
            equipment: 'full gym',
            focusAreas: 'full body'
          };
          break;
        case 'meal':
          functionName = 'generate-personalized-meal-plan';
          body.preferences = {
            goal: 'muscle gain',
            dietType: 'balanced',
            calories: 2500,
            restrictions: 'none',
            cuisinePreferences: 'varied',
            cookingTime: 'moderate',
            mealPrep: true
          };
          break;
        case 'meditation':
          functionName = 'generate-spiritual-content';
          body = {
            type: 'meditation',
            preferences: {
              duration: 10,
              focus: 'breath awareness',
              level: 'beginner',
              goal: 'stress relief',
              tone: 'calm'
            }
          };
          break;
        case 'devotional':
          functionName = 'generate-spiritual-content';
          body = {
            type: 'devotional',
            preferences: {
              theme: 'perseverance',
              length: 'medium',
              tone: 'encouraging',
              focus: 'daily living'
            }
          };
          break;
        case 'recommendations':
          functionName = 'smart-recommendations';
          body = { category: 'reading' };
          break;
      }

      const { data, error } = await supabase.functions.invoke(functionName, { body });

      if (error) {
        console.error('Generation error:', error);
        throw error;
      }

      if (data) {
        console.log('Content generated successfully');
        setGeneratedContent(data);
        toast({
          title: "Content Generated!",
          description: "Your personalized content is ready.",
        });
      }
    } catch (error) {
      console.error('Failed to generate content:', error);
      toast({
        title: "Generation Failed",
        description: "Could not generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Content Generator
          <Badge variant="secondary" className="ml-auto">Powered by AI</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 h-auto gap-1">
            <TabsTrigger value="workout" className="text-[10px] sm:text-xs flex-col sm:flex-row gap-0.5 sm:gap-1 py-2">
              <Dumbbell className="h-3 w-3" />
              <span>Workout</span>
            </TabsTrigger>
            <TabsTrigger value="meal" className="text-[10px] sm:text-xs flex-col sm:flex-row gap-0.5 sm:gap-1 py-2">
              <Utensils className="h-3 w-3" />
              <span>Meals</span>
            </TabsTrigger>
            <TabsTrigger value="meditation" className="text-[10px] sm:text-xs flex-col sm:flex-row gap-0.5 sm:gap-1 py-2">
              <Heart className="h-3 w-3" />
              <span className="hidden sm:inline">Meditate</span>
              <span className="sm:hidden">Mind</span>
            </TabsTrigger>
            <TabsTrigger value="devotional" className="text-[10px] sm:text-xs flex-col sm:flex-row gap-0.5 sm:gap-1 py-2">
              <Book className="h-3 w-3" />
              <span className="hidden sm:inline">Devotion</span>
              <span className="sm:hidden">Faith</span>
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="text-[10px] sm:text-xs flex-col sm:flex-row gap-0.5 sm:gap-1 py-2">
              <Sparkles className="h-3 w-3" />
              <span>Books</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 space-y-4">
            <TabsContent value="workout" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Generate a personalized workout plan based on your goals and fitness level.
              </p>
              <Button 
                onClick={() => generateContent('workout')}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Workout Plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Workout Plan
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="meal" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Create a weekly meal plan tailored to your dietary goals and preferences.
              </p>
              <Button 
                onClick={() => generateContent('meal')}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Meal Plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Meal Plan
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="meditation" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Get a custom guided meditation script for mindfulness and relaxation.
              </p>
              <Button 
                onClick={() => generateContent('meditation')}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Meditation...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Meditation
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="devotional" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Generate an inspiring devotional with scripture and practical application.
              </p>
              <Button 
                onClick={() => generateContent('devotional')}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Writing Devotional...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Devotional
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Get personalized book, podcast, and activity recommendations.
              </p>
              <Button 
                onClick={() => generateContent('recommendations')}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Finding Recommendations...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get Recommendations
                  </>
                )}
              </Button>
            </TabsContent>

            {generatedContent && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Generated Content
                </h4>
                <div className="space-y-3 text-sm">
                  {generatedContent.workoutPlan && (
                    <div>
                      <p className="font-medium">{generatedContent.workoutPlan.plan.name}</p>
                      <p className="text-muted-foreground">{generatedContent.workoutPlan.plan.description}</p>
                      <p className="text-xs mt-2">
                        Duration: {generatedContent.workoutPlan.plan.duration_weeks} weeks • 
                        Difficulty: {generatedContent.workoutPlan.plan.difficulty}
                      </p>
                    </div>
                  )}
                  {generatedContent.mealPlan && (
                    <div>
                      <p className="font-medium">{generatedContent.mealPlan.plan.name}</p>
                      <p className="text-muted-foreground">{generatedContent.mealPlan.plan.description}</p>
                      <p className="text-xs mt-2">
                        {generatedContent.mealPlan.plan.total_calories_daily} calories/day
                      </p>
                    </div>
                  )}
                  {generatedContent.content && generatedContent.type === 'meditation' && (
                    <div>
                      <p className="font-medium">{generatedContent.content.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {generatedContent.content.duration_minutes} minutes • {generatedContent.content.focus}
                      </p>
                      <p className="text-sm mt-2 whitespace-pre-wrap">
                        {generatedContent.content.script?.introduction}
                      </p>
                    </div>
                  )}
                  {generatedContent.content && generatedContent.type === 'devotional' && (
                    <div>
                      <p className="font-medium">{generatedContent.content.title}</p>
                      <p className="text-xs text-muted-foreground mb-2">{generatedContent.content.scripture}</p>
                      <p className="text-sm whitespace-pre-wrap line-clamp-4">
                        {generatedContent.content.reflection}
                      </p>
                    </div>
                  )}
                  {generatedContent.recommendations && (
                    <div className="space-y-2">
                      {generatedContent.recommendations.slice(0, 3).map((rec: any, idx: number) => (
                        <div key={idx} className="border-l-2 border-primary pl-3">
                          <p className="font-medium">{rec.title}</p>
                          <p className="text-xs text-muted-foreground">{rec.description}</p>
                          {rec.link && (
                            <a 
                              href={rec.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
                            >
                              Learn more <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};