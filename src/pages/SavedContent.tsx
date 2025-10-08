import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSavedVerses } from "@/hooks/useSavedVerses";
import { useReflections } from "@/hooks/useReflections";
import { useSavedDevotions } from "@/hooks/useSavedDevotions";
import { useSavedSermons } from "@/hooks/useSavedSermons";
import { useSavedRecipes } from "@/hooks/useSavedRecipes";
import { Trash2, BookOpen, Heart, Utensils, Church, Quote } from "lucide-react";
import { toast } from "sonner";

const SavedContent = () => {
  const { savedVerses, isLoading: versesLoading, deleteSavedVerse } = useSavedVerses();
  const { reflections, isLoading: reflectionsLoading, deleteReflection } = useReflections();
  const { savedDevotions, isLoading: devotionsLoading, deleteSavedDevotion } = useSavedDevotions();
  const { savedSermons, isLoading: sermonsLoading, deleteSavedSermon } = useSavedSermons();
  const { savedRecipes, isLoading: recipesLoading, deleteRecipe } = useSavedRecipes();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDeleteVerse = async (id: string) => {
    const success = await deleteSavedVerse(id);
    if (success) {
      toast.success("Verse removed from saved content");
    } else {
      toast.error("Failed to remove verse");
    }
  };

  const handleDeleteReflection = async (id: string) => {
    const success = await deleteReflection(id);
    if (success) {
      toast.success("Reflection removed");
    } else {
      toast.error("Failed to remove reflection");
    }
  };

  const handleDeleteDevotion = async (id: string) => {
    const success = await deleteSavedDevotion(id);
    if (success) {
      toast.success("Devotion removed");
    } else {
      toast.error("Failed to remove devotion");
    }
  };

  const handleDeleteSermon = async (id: string) => {
    const success = await deleteSavedSermon(id);
    if (success) {
      toast.success("Sermon removed");
    } else {
      toast.error("Failed to remove sermon");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light/20 via-background to-accent/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      <Header />
      
      <main className="flex-grow px-responsive pb-safe-mobile pt-6 max-w-4xl mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gradient-primary mb-2">
            Saved Content
          </h1>
          <p className="text-sm text-muted-foreground">Your collection of verses, reflections, and more</p>
        </div>

        <Tabs defaultValue="verses" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 glass border h-11 bg-warm/20">
            <TabsTrigger value="verses" className="text-xs sm:text-sm font-medium">
              <BookOpen className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Verses</span>
            </TabsTrigger>
            <TabsTrigger value="reflections" className="text-xs sm:text-sm font-medium">
              <Quote className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Reflections</span>
            </TabsTrigger>
            <TabsTrigger value="devotions" className="text-xs sm:text-sm font-medium">
              <Heart className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Devotions</span>
            </TabsTrigger>
            <TabsTrigger value="sermons" className="text-xs sm:text-sm font-medium">
              <Church className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Sermons</span>
            </TabsTrigger>
            <TabsTrigger value="recipes" className="text-xs sm:text-sm font-medium">
              <Utensils className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Recipes</span>
            </TabsTrigger>
          </TabsList>

          {/* Verses Tab */}
          <TabsContent value="verses" className="animate-fade-in">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-4">
                {versesLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="glass-card">
                      <CardContent className="p-6">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-20 w-full mb-2" />
                        <Skeleton className="h-3 w-1/4" />
                      </CardContent>
                    </Card>
                  ))
                ) : savedVerses.length === 0 ? (
                  <Card className="glass-card">
                    <CardContent className="p-8 text-center">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No saved verses yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  savedVerses.map((verse) => (
                    <Card key={verse.id} className="glass-card hover:shadow-glow transition-all">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg text-primary">{verse.reference}</CardTitle>
                            {verse.category && (
                              <Badge variant="secondary" className="mt-2">{verse.category}</Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteVerse(verse.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground italic mb-3">"{verse.text}"</p>
                        <p className="text-xs text-muted-foreground">
                          {verse.translation_name} • Saved {formatDate(verse.saved_at)}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Reflections Tab */}
          <TabsContent value="reflections" className="animate-fade-in">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-4">
                {reflectionsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="glass-card">
                      <CardContent className="p-6">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-20 w-full mb-2" />
                        <Skeleton className="h-3 w-1/4" />
                      </CardContent>
                    </Card>
                  ))
                ) : reflections.length === 0 ? (
                  <Card className="glass-card">
                    <CardContent className="p-8 text-center">
                      <Quote className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No reflections yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  reflections.map((reflection) => (
                    <Card key={reflection.id} className="glass-card hover:shadow-glow transition-all">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg text-primary">
                              {reflection.verse_reference || reflection.devotion_title || reflection.sermon_title}
                            </CardTitle>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteReflection(reflection.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground mb-3">{reflection.reflection_text}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(reflection.created_at)}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Devotions Tab */}
          <TabsContent value="devotions" className="animate-fade-in">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-4">
                {devotionsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="glass-card">
                      <CardContent className="p-6">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-20 w-full mb-2" />
                        <Skeleton className="h-3 w-1/4" />
                      </CardContent>
                    </Card>
                  ))
                ) : savedDevotions.length === 0 ? (
                  <Card className="glass-card">
                    <CardContent className="p-8 text-center">
                      <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No saved devotions yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  savedDevotions.map((devotion) => (
                    <Card key={devotion.id} className="glass-card hover:shadow-glow transition-all">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg text-primary">{devotion.title}</CardTitle>
                            {devotion.category && (
                              <Badge variant="secondary" className="mt-2">{devotion.category}</Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteDevotion(devotion.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground mb-2 line-clamp-3">{devotion.content}</p>
                        {devotion.verse_reference && (
                          <p className="text-sm text-muted-foreground mb-2">{devotion.verse_reference}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Saved {formatDate(devotion.saved_at)}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Sermons Tab */}
          <TabsContent value="sermons" className="animate-fade-in">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-4">
                {sermonsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="glass-card">
                      <CardContent className="p-6">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-20 w-full mb-2" />
                        <Skeleton className="h-3 w-1/4" />
                      </CardContent>
                    </Card>
                  ))
                ) : savedSermons.length === 0 ? (
                  <Card className="glass-card">
                    <CardContent className="p-8 text-center">
                      <Church className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No saved sermons yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  savedSermons.map((sermon) => (
                    <Card key={sermon.id} className="glass-card hover:shadow-glow transition-all">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg text-primary">{sermon.title}</CardTitle>
                            {sermon.author && (
                              <p className="text-sm text-muted-foreground mt-1">By {sermon.author}</p>
                            )}
                            {sermon.category && (
                              <Badge variant="secondary" className="mt-2">{sermon.category}</Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteSermon(sermon.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {sermon.description && (
                          <p className="text-foreground mb-2 line-clamp-2">{sermon.description}</p>
                        )}
                        {sermon.url && (
                          <a
                            href={sermon.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline mb-2 block"
                          >
                            Watch sermon →
                          </a>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Saved {formatDate(sermon.saved_at)}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Recipes Tab */}
          <TabsContent value="recipes" className="animate-fade-in">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-4">
                {recipesLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="glass-card">
                      <CardContent className="p-6">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-20 w-full mb-2" />
                        <Skeleton className="h-3 w-1/4" />
                      </CardContent>
                    </Card>
                  ))
                ) : savedRecipes.length === 0 ? (
                  <Card className="glass-card">
                    <CardContent className="p-8 text-center">
                      <Utensils className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No saved recipes yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  savedRecipes.map((recipe) => (
                    <Card key={recipe.id} className="glass-card hover:shadow-glow transition-all">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg text-primary">{recipe.recipe_title}</CardTitle>
                            {recipe.recipe_category && (
                              <Badge variant="secondary" className="mt-2">{recipe.recipe_category}</Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteRecipe(recipe.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-4 text-sm text-muted-foreground mb-3">
                          {recipe.recipe_ready_in_minutes && (
                            <span>⏱ {recipe.recipe_ready_in_minutes} min</span>
                          )}
                          {recipe.recipe_servings && (
                            <span>🍽 {recipe.recipe_servings} servings</span>
                          )}
                        </div>
                        {recipe.recipe_nutrition && (
                          <div className="flex gap-3 text-xs text-muted-foreground mb-3">
                            {recipe.recipe_nutrition.calories && (
                              <span>{recipe.recipe_nutrition.calories} cal</span>
                            )}
                            {recipe.recipe_nutrition.protein && (
                              <span>{recipe.recipe_nutrition.protein}g protein</span>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Saved {formatDate(recipe.saved_at)}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default SavedContent;
