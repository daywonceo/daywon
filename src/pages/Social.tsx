
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainFeed from "@/components/social/MainFeed";
import ActivityTimeline from "@/components/social/ActivityTimeline";
import HabitLeaderboard from "@/components/social/HabitLeaderboard";
import FriendList from "@/components/social/FriendList";
import Groups from "@/components/social/Groups";
import { useHabitSocialIntegration } from "@/hooks/useHabitSocialIntegration";

const Social = () => {
  // Initialize habit social integration (auto-creates posts on completions)
  useHabitSocialIntegration();
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <Header />
      
      <main className="flex-grow px-3 sm:px-4 pb-20 pt-4 max-w-md sm:max-2xl mx-auto w-full">
        {/* Hero Section */}
        <div className="text-center mb-6 px-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <span className="text-2xl">🌟</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Connect & Grow
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
            Share your journey and celebrate wins with your community
          </p>
        </div>

        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 h-11">
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
      </main>
      
      <Footer />
    </div>
  );
};

export default Social;
