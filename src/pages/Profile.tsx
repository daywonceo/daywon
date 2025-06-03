
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trophy, Users, Flame, Calendar, Settings, Share2 } from "lucide-react";

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
    daysActive: 301,
    level: 12,
    totalHabitsCompleted: 1247,
    weeklyGoalCompletion: 89
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col text-gray-800 dark:text-gray-200">
      <Header />
      
      <main className="flex-grow px-4 sm:px-5 pb-24 pt-4 sm:pt-6 max-w-3xl mx-auto w-full">
        <div className="py-4 text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Your Profile
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Track your progress and achievements</p>
        </div>
        
        {/* Profile Header */}
        <Card className="mb-6 border-green-200 dark:border-green-800 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-24 h-24">
                  <AspectRatio ratio={1/1}>
                    <Avatar className="w-full h-full border-4 border-green-200 dark:border-green-800">
                      <AvatarImage src={profile.avatar} alt={profile.name} className="object-cover" />
                      <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </AspectRatio>
                </div>
                <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                  Lv. {profile.level}
                </Badge>
              </div>
              
              <h2 className="text-xl font-bold mb-2">{profile.name}</h2>
              
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <Users className="w-3 h-3 mr-1" />
                  {profile.friendCount} Friends
                </Badge>
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <Calendar className="w-3 h-3 mr-1" />
                  {profile.daysActive} Days Active
                </Badge>
                <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                  <Trophy className="w-3 h-3 mr-1" />
                  {profile.totalHabitsCompleted} Completed
                </Badge>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="border-green-200 dark:border-green-800">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button variant="outline" size="sm" className="border-blue-200 dark:border-blue-800">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <Card className="border-green-200 dark:border-green-800 shadow-sm">
            <CardContent className="p-4 text-center">
              <Flame className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <h3 className="text-xs font-bold mb-1 text-gray-600 dark:text-gray-400">LONGEST STREAK</h3>
              <p className="text-2xl font-bold text-green-600">{profile.longestStreak.days}</p>
              <p className="text-xs text-gray-500">DAYS</p>
            </CardContent>
          </Card>
          
          <Card className="border-blue-200 dark:border-blue-800 shadow-sm">
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <h3 className="text-xs font-bold mb-1 text-gray-600 dark:text-gray-400">TOP HABIT</h3>
              <p className="text-lg font-bold text-blue-600">{profile.mostConsistentHabit}</p>
              <p className="text-xs text-gray-500">MOST CONSISTENT</p>
            </CardContent>
          </Card>
          
          <Card className="border-purple-200 dark:border-purple-800 shadow-sm col-span-2 sm:col-span-1">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <h3 className="text-xs font-bold mb-1 text-gray-600 dark:text-gray-400">WEEKLY GOAL</h3>
              <p className="text-2xl font-bold text-purple-600">{profile.weeklyGoalCompletion}%</p>
              <p className="text-xs text-gray-500">COMPLETION</p>
            </CardContent>
          </Card>
        </div>
        
        <Button className="w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold mb-8 rounded-lg shadow-lg">
          DISCOVER SIMILAR HABITS
        </Button>
        
        {/* Connected Apps */}
        <Card className="mb-6 border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader>
            <CardTitle className="text-center text-lg">Connected Apps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between flex-wrap gap-4">
              {profile.connectedApps.map((app, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className={`${app.color} w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold mb-2 shadow-md`}>
                    {app.icon}
                  </div>
                  <p className="text-xs font-medium">{app.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Best Friends */}
        <Card className="mb-6 border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader>
            <CardTitle className="text-center text-lg">Best Friends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center space-x-8">
              {profile.bestFriends.map((friend, index) => (
                <div key={index} className="flex flex-col items-center">
                  <Avatar className="w-16 h-16 mb-2 border-2 border-green-200 dark:border-green-800">
                    <AvatarImage src={friend.avatar} alt={friend.name} />
                    <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Badge variant="secondary" className="text-xs">Top Friend</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Member Since */}
        <div className="text-center bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-lg p-6">
          <h3 className="font-bold mb-2 text-gray-700 dark:text-gray-300">Member Since</h3>
          <p className="text-2xl font-bold tracking-wider mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            DAYONE
          </p>
          <p className="font-medium text-gray-600 dark:text-gray-400">
            FOR {profile.daysActive} DAYS
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
