
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Archive, Heart, MessageCircle, Play } from "lucide-react";
import { useSavedVerses } from "@/hooks/useSavedVerses";
import { useReflections } from "@/hooks/useReflections";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const SavedDevotionsTab = () => {
  const { savedVerses, isLoading: versesLoading, deleteSavedVerse } = useSavedVerses();
  const { reflections, isLoading: reflectionsLoading, deleteReflection } = useReflections();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <Archive className="w-12 h-12 mx-auto mb-4 text-green-600" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Your Saved Items
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Access your saved verses, reflections, and spiritual content
        </p>
      </div>

      <Tabs defaultValue="verses" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="verses" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Saved Verses
          </TabsTrigger>
          <TabsTrigger value="reflections" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Faith Journal
          </TabsTrigger>
          <TabsTrigger value="sermons" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Saved Content
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="verses" className="space-y-4">
          {versesLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="bg-white dark:bg-gray-800">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))
          ) : savedVerses.length === 0 ? (
            <Card className="bg-white dark:bg-gray-800">
              <CardContent className="p-8 text-center">
                <Heart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">
                  No saved verses yet. Start saving verses you love!
                </p>
              </CardContent>
            </Card>
          ) : (
            savedVerses.map((verse) => (
              <Card key={verse.id} className="bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2">
                        {verse.reference}
                      </h4>
                      {verse.category && (
                        <span className="inline-block px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full mb-2">
                          {verse.category}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSavedVerse(verse.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      ×
                    </Button>
                  </div>
                  
                  <blockquote className="text-gray-700 dark:text-gray-300 italic leading-relaxed mb-4 border-l-4 border-green-200 dark:border-green-800 pl-4">
                    "{verse.text}"
                  </blockquote>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>{verse.translation_name}</span>
                    <span>Saved {formatDate(verse.saved_at)}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="reflections" className="space-y-4">
          {reflectionsLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="bg-white dark:bg-gray-800">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))
          ) : reflections.length === 0 ? (
            <Card className="bg-white dark:bg-gray-800">
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">
                  No reflections yet. Start journaling your thoughts on verses and devotions!
                </p>
              </CardContent>
            </Card>
          ) : (
            reflections.map((reflection) => (
              <Card key={reflection.id} className="bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {reflection.verse_reference && (
                        <h4 className="font-semibold text-green-800 dark:text-green-400 mb-1">
                          {reflection.verse_reference}
                        </h4>
                      )}
                      {reflection.devotion_title && (
                        <h4 className="font-semibold text-green-800 dark:text-green-400 mb-1">
                          {reflection.devotion_title}
                        </h4>
                      )}
                      {reflection.sermon_title && (
                        <h4 className="font-semibold text-green-800 dark:text-green-400 mb-1">
                          {reflection.sermon_title}
                        </h4>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteReflection(reflection.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      ×
                    </Button>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    {reflection.reflection_text}
                  </p>
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(reflection.created_at)}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="sermons" className="space-y-4">
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-8 text-center">
              <Play className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">
                Saved sermons and devotions will appear here. Start exploring the Sermons and Devotions tabs!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SavedDevotionsTab;
