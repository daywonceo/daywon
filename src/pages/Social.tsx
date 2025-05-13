
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus, MessageCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Social = () => {
  const friends = [
    { id: 1, name: "NATE RODGERS", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png" },
    { id: 2, name: "DREW RODGERS", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png" },
    { id: 3, name: "JOSH RODGERS", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png" },
    { id: 4, name: "ANDY RODGERS", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png" },
    { id: 5, name: "PAULA RODGERS", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png" },
    { id: 6, name: "PAIGE RODGERS", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png" },
    { id: 7, name: "LIONEL MESSI", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png" },
    { id: 8, name: "STEVIE WONDER", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png" },
    { id: 9, name: "CLAIRO", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png" },
    { id: 10, name: "CHRISTIAN PULISIC", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png" }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col text-gray-800 dark:text-gray-200">
      <Header />
      
      <main className="flex-grow px-4 sm:px-5 pb-24 pt-4 sm:pt-6 max-w-3xl mx-auto w-full">
        <div className="py-4 text-center mb-6">
          <h1 className="text-2xl font-bold">DAYONE</h1>
        </div>

        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="main">MAIN FEED</TabsTrigger>
            <TabsTrigger value="leaderboard">LEADERBOARD</TabsTrigger>
            <TabsTrigger value="friends">FRIENDS</TabsTrigger>
          </TabsList>
          
          <TabsContent value="main">
            <div className="text-center py-12">
              <p>Main feed content would go here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="leaderboard">
            <div className="text-center py-12">
              <p>Leaderboard content would go here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="friends">
            <div className="mb-4 flex items-center justify-between">
              <Input 
                placeholder="SEARCH FRIENDS" 
                className="max-w-[65%] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
              />
              <Button className="bg-green-700 hover:bg-green-800">
                <UserPlus className="mr-1" size={18} /> +ADD
              </Button>
            </div>
            
            <div className="space-y-4 mt-6">
              {friends.map(friend => (
                <div key={friend.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src={friend.avatar} alt={friend.name} />
                      <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-lg">{friend.name}</span>
                  </div>
                  <Button variant="outline" className="rounded-full h-10 w-10 p-0 border-2">
                    <MessageCircle size={18} />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Social;
