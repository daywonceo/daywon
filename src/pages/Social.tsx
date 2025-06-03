
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainFeed from "@/components/social/MainFeed";
import Leaderboard from "@/components/social/Leaderboard";
import FriendList from "@/components/social/FriendList";
import Groups from "@/components/social/Groups";
import { friends, leaderboardData, feedPosts } from "@/components/social/socialData";

const Social = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col text-gray-800 dark:text-gray-200">
      <Header />
      
      <main className="flex-grow px-4 sm:px-6 pb-24 pt-6 max-w-4xl mx-auto w-full">
        <div className="py-4 text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800 dark:text-green-400">DAYONE SOCIAL</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Connect with friends and track your progress</p>
        </div>

        <Tabs defaultValue="main" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-10 shadow-sm">
            <TabsTrigger value="main" className="py-3 text-base">MAIN FEED</TabsTrigger>
            <TabsTrigger value="leaderboard" className="py-3 text-base">LEADERBOARD</TabsTrigger>
            <TabsTrigger value="groups" className="py-3 text-base">GROUPS</TabsTrigger>
            <TabsTrigger value="friends" className="py-3 text-base">FRIENDS</TabsTrigger>
          </TabsList>
          
          <TabsContent value="main" className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm animate-fade-in">
            <MainFeed feedPosts={feedPosts} />
          </TabsContent>
          
          <TabsContent value="leaderboard" className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm animate-fade-in">
            <Leaderboard leaderboardData={leaderboardData} />
          </TabsContent>
          
          <TabsContent value="groups" className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm animate-fade-in">
            <Groups />
          </TabsContent>
          
          <TabsContent value="friends" className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm animate-fade-in">
            <FriendList friends={friends} />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Social;
