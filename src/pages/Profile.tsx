
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent } from "@/components/ui/card";

const Profile = () => {
  // Sample profile data
  const profile = {
    name: "NATE RODGERS",
    avatar: "/lovable-uploads/dba09bea-3695-42d9-b2ba-6da163dee57a.png",
    friendCount: 35,
    longestStreak: {
      days: 84
    },
    mostConsistentHabit: "WORKOUT",
    similarityScore: 71,
    connectedApps: [
      { name: "WHOOP", icon: "W", color: "bg-black text-white" },
      { name: "LOSE IT", icon: "⚖️", color: "bg-orange-400" },
      { name: "BRICK", icon: "B", color: "bg-gray-800 text-white" },
      { name: "HOLY BIBLE", icon: "📖", color: "bg-red-800 text-white" },
      { name: "STRAVA", icon: "△", color: "bg-orange-500 text-white" }
    ],
    bestFriends: [
      { name: "Friend 1", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png" },
      { name: "Friend 2", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png" },
      { name: "Friend 3", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png" }
    ],
    daysActive: 301
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col text-gray-800 dark:text-gray-200">
      <Header />
      
      <main className="flex-grow px-4 sm:px-5 pb-24 pt-4 sm:pt-6 max-w-3xl mx-auto w-full">
        <div className="py-4 text-center">
          <h1 className="text-2xl font-bold tracking-wider">DAYONE</h1>
        </div>
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 mb-4">
            <AspectRatio ratio={1/1}>
              <Avatar className="w-full h-full">
                <AvatarImage src={profile.avatar} alt={profile.name} className="object-cover" />
                <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </AspectRatio>
          </div>
          <h2 className="text-xl font-bold mb-1">{profile.name}</h2>
          <div className="bg-green-800 text-white px-4 py-1 rounded-sm text-sm">
            {profile.friendCount} FRIENDS
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-8">
          <Card className="border-2">
            <CardContent className="p-4 text-center">
              <h3 className="text-xs font-bold mb-2">LONGEST HABIT STREAK</h3>
              <p className="text-5xl font-bold text-green-800">{profile.longestStreak.days}</p>
              <p className="text-xs">DAYS</p>
            </CardContent>
          </Card>
          
          <Card className="border-2">
            <CardContent className="p-4 text-center">
              <h3 className="text-xs font-bold mb-2">MOST CONSISTENT HABIT</h3>
              <p className="text-2xl font-bold text-green-800">{profile.mostConsistentHabit}</p>
            </CardContent>
          </Card>
          
          <Card className="border-2">
            <CardContent className="p-4 text-center">
              <h3 className="text-xs font-bold mb-2">SIMILARITY SCORE</h3>
              <p className="text-5xl font-bold text-green-800">{profile.similarityScore}</p>
            </CardContent>
          </Card>
        </div>
        
        <Button className="w-full py-6 bg-green-800 hover:bg-green-900 text-white font-bold mb-8">
          DISCOVER SIMILAR HABITS
        </Button>
        
        <div className="mb-8">
          <h3 className="text-center font-bold mb-4">CONNECTED APPS</h3>
          <div className="flex justify-between">
            {profile.connectedApps.map((app, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`${app.color} w-12 h-12 rounded-md flex items-center justify-center text-lg font-bold mb-1`}>
                  {app.icon}
                </div>
                <p className="text-xs">{app.name}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-center font-bold mb-4">BEST FRIENDS</h3>
          <div className="flex justify-center space-x-8">
            {profile.bestFriends.map((friend, index) => (
              <div key={index} className="flex flex-col items-center">
                <Avatar className="w-16 h-16 mb-1">
                  <AvatarImage src={friend.avatar} alt={friend.name} />
                  <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="font-bold mb-1">ON</h3>
          <p className="text-2xl font-bold tracking-wider mb-1">DAYONE</p>
          <p className="font-medium">FOR {profile.daysActive} DAYS</p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
