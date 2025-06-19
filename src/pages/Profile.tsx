
import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSettings from "@/components/ProfileSettings";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trophy, Users, Flame, Calendar, Settings, Share2, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Profile = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { signOut } = useAuth();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };
  
  // Sample profile data
  const profile = {
    name: "NATE RODGERS",
    avatar: "/lovable-uploads/dba09bea-3695-42d9-b2ba-6da163dee57a.png",
    friendCount: 35,
    longestStreak: {
      days: 84
    },
    mostConsistentHabit: "WORKOUT",
    bestFriends: [
      { name: "Sarah Chen", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png", topHabit: "Reading" },
      { name: "Mike Johnson", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png", topHabit: "Running" },
      { name: "Emma Davis", avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png", topHabit: "Meditation" }
    ],
    daysActive: 301,
    totalHabitsCompleted: 1247,
    weeklyGoalCompletion: 89
  };

  const handleFriendTap = (friendName: string) => {
    toast.info(`Opening ${friendName}'s profile`);
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
        
        {/* 🔝 Profile Summary (Header Card) */}
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
              </div>
              
              <h2 className="text-xl font-bold mb-4">{profile.name}</h2>
              
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-lg font-bold text-green-600">{profile.friendCount}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Friends</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-lg font-bold text-blue-600">{profile.daysActive}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Days Active</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Trophy className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-lg font-bold text-purple-600">{profile.totalHabitsCompleted}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* 🏅 Personal Bests (Highlights Card) */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <span className="text-lg mr-2">🏅</span>
            <h3 className="text-lg font-bold">Personal Bests</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-orange-200 dark:border-orange-800 shadow-sm">
              <CardContent className="p-4 text-center">
                <Flame className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <h4 className="text-xs font-bold mb-1 text-gray-600 dark:text-gray-400">LONGEST STREAK</h4>
                <p className="text-2xl font-bold text-orange-600">{profile.longestStreak.days}</p>
                <p className="text-xs text-gray-500">DAYS</p>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 dark:border-blue-800 shadow-sm">
              <CardContent className="p-4 text-center">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <h4 className="text-xs font-bold mb-1 text-gray-600 dark:text-gray-400">TOP HABIT</h4>
                <p className="text-lg font-bold text-blue-600">{profile.mostConsistentHabit}</p>
                <p className="text-xs text-gray-500">MOST CONSISTENT</p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* 👯 Best Friends Section */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <span className="text-lg mr-2">👯‍♂️</span>
            <h3 className="text-lg font-bold">Best Friends</h3>
          </div>
          
          <Card className="border-gray-200 dark:border-gray-700 shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between space-x-4">
                {profile.bestFriends.map((friend, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col items-center flex-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg p-2 transition-colors"
                    onClick={() => handleFriendTap(friend.name)}
                  >
                    <Avatar className="w-16 h-16 mb-2 border-2 border-green-200 dark:border-green-800">
                      <AvatarImage src={friend.avatar} alt={friend.name} />
                      <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-semibold text-center mb-1">{friend.name.split(' ')[0]}</p>
                    <Badge variant="secondary" className="text-xs">{friend.topHabit}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 📆 Membership Milestone */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <span className="text-lg mr-2">📆</span>
            <h3 className="text-lg font-bold">Membership</h3>
          </div>
          
          <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-lg p-6 text-center border border-green-200 dark:border-green-800">
            <h3 className="font-bold mb-2 text-gray-700 dark:text-gray-300">🎉 Member Since Day One</h3>
            <p className="text-2xl font-bold tracking-wider mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              {profile.daysActive} DAYS STRONG!
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Keep up the amazing consistency!
            </p>
          </div>
        </div>
        
        {/* ⚙️ Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <Button 
            variant="outline" 
            className="border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button 
            variant="outline" 
            className="border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button 
            variant="outline" 
            className="border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </main>
      
      <Footer />
      
      <ProfileSettings open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default Profile;
