
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Settings, Lightbulb, TrendingUp, Heart, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { useActivityPreferences } from "@/hooks/useActivityPreferences";
import { useActivityRecommendations } from "@/hooks/useActivityRecommendations";
import EnhancedActivityCard from "./EnhancedActivityCard";
import ActivityPreferencesDialog from "./ActivityPreferencesDialog";
import { ENHANCED_ACTIVITIES, ACTIVITY_SERIES } from "@/data/enhancedActivities";
import { useToast } from "@/components/ui/use-toast";

const BoredTab = () => {
  const [activeTab, setActiveTab] = useState("discover");
  const [expandedTabs, setExpandedTabs] = useState({
    discover: false,
    recommended: false,
    favorites: false,
    progress: false,
    progressInProgress: false,
    progressCompleted: false
  });
  const { preferences, isLoading } = useActivityPreferences();
  const { recommendations, getRandomActivity, getTopRecommendations } = useActivityRecommendations(preferences);
  const { toast } = useToast();

  const toggleExpanded = (tab: string) => {
    setExpandedTabs(prev => ({
      ...prev,
      [tab]: !prev[tab as keyof typeof prev]
    }));
  };

  const handleStartActivity = (activityId: string) => {
    // This could integrate with habit tracking or other systems
    console.log('Starting activity:', activityId);
  };

  const getRandomSuggestion = () => {
    const randomActivity = getRandomActivity();
    if (randomActivity) {
      // Scroll to top to show the new activity
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast({
        title: "Here's something new!",
        description: randomActivity.title,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Personal Activity Center
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Discover meaningful activities tailored to your interests and goals
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={getRandomSuggestion} className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Surprise Me
          </Button>
          <ActivityPreferencesDialog>
            <Button variant="outline" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </ActivityPreferencesDialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {preferences.completedActivities.length}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">Completed</div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {preferences.inProgressActivities.length}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">In Progress</div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {preferences.favoriteActivities.length}
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-400">Favorites</div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="discover" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            <span className="hidden sm:inline">Discover</span>
          </TabsTrigger>
          <TabsTrigger value="recommended" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">For You</span>
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            <span className="hidden sm:inline">Favorites</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Progress</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold mb-4">Explore All Activities</h4>
            <div className="grid gap-6">
              {(expandedTabs.discover ? ENHANCED_ACTIVITIES : ENHANCED_ACTIVITIES.slice(0, 3)).map((activity) => (
                <EnhancedActivityCard
                  key={activity.id}
                  activity={activity}
                  onStartActivity={handleStartActivity}
                />
              ))}
            </div>
            {ENHANCED_ACTIVITIES.length > 3 && (
              <div className="text-center mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => toggleExpanded('discover')}
                  className="flex items-center gap-2"
                >
                  {expandedTabs.discover ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Show More ({ENHANCED_ACTIVITIES.length - 3} more)
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="recommended" className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold mb-2">Personalized Recommendations</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Based on your preferences, mood, and activity history
            </p>
            
            {preferences.currentMood && (
              <div className="mb-4">
                <Badge variant="outline" className="capitalize">
                  Current mood: {preferences.currentMood}
                </Badge>
              </div>
            )}

            <div className="grid gap-6">
              {(expandedTabs.recommended ? getTopRecommendations(10) : getTopRecommendations(3)).map((activity) => (
                <EnhancedActivityCard
                  key={activity.id}
                  activity={activity}
                  onStartActivity={handleStartActivity}
                />
              ))}
            </div>
            {getTopRecommendations(10).length > 3 && (
              <div className="text-center mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => toggleExpanded('recommended')}
                  className="flex items-center gap-2"
                >
                  {expandedTabs.recommended ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Show More ({getTopRecommendations(10).length - 3} more)
                    </>
                  )}
                </Button>
              </div>
            )}
            
            {recommendations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No activities match your current preferences.
                </p>
                <ActivityPreferencesDialog>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Adjust Preferences
                  </Button>
                </ActivityPreferencesDialog>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold mb-4">Your Favorite Activities</h4>
            <div className="grid gap-6">
              {(expandedTabs.favorites ? preferences.favoriteActivities : preferences.favoriteActivities.slice(0, 3)).map((activityId) => {
                const activity = ENHANCED_ACTIVITIES.find(a => a.id === activityId);
                return activity ? (
                  <EnhancedActivityCard
                    key={activity.id}
                    activity={activity}
                    onStartActivity={handleStartActivity}
                  />
                ) : null;
              })}
            </div>
            {preferences.favoriteActivities.length > 3 && (
              <div className="text-center mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => toggleExpanded('favorites')}
                  className="flex items-center gap-2"
                >
                  {expandedTabs.favorites ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Show More ({preferences.favoriteActivities.length - 3} more)
                    </>
                  )}
                </Button>
              </div>
            )}
            
            {preferences.favoriteActivities.length === 0 && (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No favorite activities yet. Heart activities you love to save them here!
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold mb-4">Your Activity Journey</h4>
            
            {/* In Progress Activities */}
            {preferences.inProgressActivities.length > 0 && (
              <div className="mb-8">
                <h5 className="font-medium mb-3 text-blue-600 dark:text-blue-400">Currently Working On</h5>
                <div className="grid gap-4">
                  {(expandedTabs.progressInProgress ? preferences.inProgressActivities : preferences.inProgressActivities.slice(0, 3)).map((activityId) => {
                    const activity = ENHANCED_ACTIVITIES.find(a => a.id === activityId);
                    return activity ? (
                      <EnhancedActivityCard
                        key={activity.id}
                        activity={activity}
                        onStartActivity={handleStartActivity}
                      />
                    ) : null;
                  })}
                </div>
                {preferences.inProgressActivities.length > 3 && (
                  <div className="text-center mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleExpanded('progressInProgress')}
                      className="flex items-center gap-2"
                    >
                      {expandedTabs.progressInProgress ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Show More ({preferences.inProgressActivities.length - 3} more)
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Completed Activities */}
            {preferences.completedActivities.length > 0 && (
              <div>
                <h5 className="font-medium mb-3 text-green-600 dark:text-green-400">Completed Activities</h5>
                <div className="grid gap-4">
                  {(expandedTabs.progressCompleted ? preferences.completedActivities : preferences.completedActivities.slice(0, 3)).map((activityId) => {
                    const activity = ENHANCED_ACTIVITIES.find(a => a.id === activityId);
                    return activity ? (
                      <EnhancedActivityCard
                        key={activity.id}
                        activity={activity}
                        onStartActivity={handleStartActivity}
                      />
                    ) : null;
                  })}
                </div>
                {preferences.completedActivities.length > 3 && (
                  <div className="text-center mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleExpanded('progressCompleted')}
                      className="flex items-center gap-2"
                    >
                      {expandedTabs.progressCompleted ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Show More ({preferences.completedActivities.length - 3} more)
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {preferences.inProgressActivities.length === 0 && preferences.completedActivities.length === 0 && (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Start your first activity to begin tracking your progress!
                </p>
                <Button onClick={() => setActiveTab("discover")}>
                  Browse Activities
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BoredTab;
