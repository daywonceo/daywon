
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Lightbulb, TrendingUp, Heart, Check, Zap, ChevronDown, ChevronUp, Filter } from "lucide-react";
import { useActivityPreferences } from "@/hooks/useActivityPreferences";
import { useActivityRecommendations } from "@/hooks/useActivityRecommendations";
import EnhancedActivityCard from "./EnhancedActivityCard";
import ActivityPreferencesDialog from "./ActivityPreferencesDialog";
import { ENHANCED_ACTIVITIES, ACTIVITY_SERIES, ActivityCategory } from "@/data/enhancedActivities";
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
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [costFilter, setCostFilter] = useState<string>("all");
  
  const { preferences, isLoading } = useActivityPreferences();
  const { recommendations, getRandomActivity, getTopRecommendations } = useActivityRecommendations(preferences);
  const { toast } = useToast();

  const filteredActivities = useMemo(() => {
    return ENHANCED_ACTIVITIES.filter(activity => {
      if (categoryFilter !== "all" && activity.category !== categoryFilter) return false;
      if (difficultyFilter !== "all" && activity.difficulty !== difficultyFilter) return false;
      if (costFilter !== "all" && activity.estimatedCost !== costFilter) return false;
      return true;
    });
  }, [categoryFilter, difficultyFilter, costFilter]);

  const categories: ActivityCategory[] = ['creative', 'learning', 'physical', 'social', 'professional', 'mindfulness', 'technology', 'culinary', 'crafts', 'music', 'writing', 'outdoor'];

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
            <Check className="w-4 h-4" />
            <span className="hidden sm:inline">Progress</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h4 className="text-lg font-semibold">Explore All Activities</h4>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[130px] h-9">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="w-[130px] h-9">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={costFilter} onValueChange={setCostFilter}>
                  <SelectTrigger className="w-[110px] h-9">
                    <SelectValue placeholder="Cost" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-6">
              {(expandedTabs.discover ? filteredActivities : filteredActivities.slice(0, 3)).map((activity) => (
                <EnhancedActivityCard
                  key={activity.id}
                  activity={activity}
                  onStartActivity={handleStartActivity}
                  hideTags
                />
              ))}
            </div>
            {filteredActivities.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No activities match your filters. Try adjusting them.
                </p>
              </div>
            )}
            {filteredActivities.length > 3 && (
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
                      Show More ({filteredActivities.length - 3} more)
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
                  hideTags
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
                    hideTags
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
            <h4 className="text-lg font-semibold mb-4">Your Completed Activities</h4>
            
            {preferences.completedActivities.length > 0 ? (
              <div className="grid gap-4">
                {(expandedTabs.progressCompleted ? preferences.completedActivities : preferences.completedActivities.slice(0, 3)).map((activityId) => {
                  const activity = ENHANCED_ACTIVITIES.find(a => a.id === activityId);
                  return activity ? (
                    <EnhancedActivityCard
                      key={activity.id}
                      activity={activity}
                      onStartActivity={handleStartActivity}
                      hideTags
                    />
                  ) : null;
                })}
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
            ) : (
              <div className="text-center py-12">
                <Check className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No completed activities yet. Mark an activity as complete to see it here!
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
