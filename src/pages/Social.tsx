
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainFeed from "@/components/social/MainFeed";
import Leaderboard from "@/components/social/Leaderboard";
import FriendList from "@/components/social/FriendList";
import { friends, leaderboardData, feedPosts } from "@/components/social/socialData";

const Social = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col text-gray-800 dark:text-gray-200">
      <Header />
      
      <main className="flex-grow px-4 sm:px-5 pb-24 pt-4 sm:pt-6 max-w-3xl mx-auto w-full">
        <div className="py-4 text-center mb-6">
          <h1 className="text-2xl font-bold">DAYONE</h1>
        </div>

        <Tabs defaultValue="main" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="main">MAIN FEED</TabsTrigger>
            <TabsTrigger value="leaderboard">LEADERBOARD</TabsTrigger>
            <TabsTrigger value="friends">FRIENDS</TabsTrigger>
          </TabsList>
          
          <TabsContent value="main">
            <MainFeed feedPosts={feedPosts} />
          </TabsContent>
          
          <TabsContent value="leaderboard">
            <Leaderboard leaderboardData={leaderboardData} />
          </TabsContent>
          
          <TabsContent value="friends">
            <FriendList friends={friends} />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Social;
