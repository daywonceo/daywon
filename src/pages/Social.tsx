
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FeatureErrorBoundary } from "@/components/errors/FeatureErrorBoundary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainFeed from "@/components/social/MainFeed";
import ActivityTimeline from "@/components/social/ActivityTimeline";
import NotificationCenter from "@/components/social/NotificationCenter";
import HabitLeaderboard from "@/components/social/HabitLeaderboard";
import FriendList from "@/components/social/FriendList";
import Groups from "@/components/social/Groups";
import { useHabitSocialIntegration } from "@/hooks/useHabitSocialIntegration";

const Social = () => {
  // Initialize habit social integration (auto-creates posts on completions)
  useHabitSocialIntegration();
  return (
    <div className="min-h-screen bg-subtle/30 flex flex-col">
      <Header />
      
      <main className="flex-grow px-responsive pb-safe-mobile pt-4 max-w-4xl mx-auto w-full">
        {/* Header with Notifications */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Connect & Grow
            </h1>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Share your journey and celebrate wins with your community
            </p>
          </div>
          
          {/* Notification Center */}
          <div className="absolute top-4 right-4">
            <NotificationCenter />
          </div>
        </div>

        <FeatureErrorBoundary featureName="Social Feed">
          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6 glass border h-11 bg-warm/20">
              <TabsTrigger value="timeline" className="text-xs sm:text-sm font-medium px-1">
                TIMELINE
              </TabsTrigger>
              <TabsTrigger value="feed" className="text-xs sm:text-sm font-medium px-1">
                FEED
              </TabsTrigger>
              <TabsTrigger value="ranks" className="text-xs sm:text-sm font-medium px-1">
                RANKS
              </TabsTrigger>
              <TabsTrigger value="groups" className="text-xs sm:text-sm font-medium px-1">
                GROUPS
              </TabsTrigger>
              <TabsTrigger value="friends" className="text-xs sm:text-sm font-medium px-1">
                FRIENDS
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="timeline" className="animate-fade-in">
              <ActivityTimeline />
            </TabsContent>
            
            <TabsContent value="feed" className="animate-fade-in">
              <MainFeed />
            </TabsContent>
            
            <TabsContent value="ranks" className="animate-fade-in">
              <HabitLeaderboard />
            </TabsContent>
            
            <TabsContent value="groups" className="animate-fade-in">
              <Groups />
            </TabsContent>
            
            <TabsContent value="friends" className="animate-fade-in">
              <FriendList />
            </TabsContent>
          </Tabs>
        </FeatureErrorBoundary>
      </main>
      
      <Footer />
    </div>
  );
};

export default Social;
