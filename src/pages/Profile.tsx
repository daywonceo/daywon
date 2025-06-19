
import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSettings from "@/components/ProfileSettings";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PersonalBests from "@/components/profile/PersonalBests";
import BestFriends from "@/components/profile/BestFriends";
import MembershipMilestone from "@/components/profile/MembershipMilestone";
import ConnectedApps from "@/components/profile/ConnectedApps";
import ProfileActions from "@/components/profile/ProfileActions";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Profile = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { signOut, session } = useAuth();
  
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
        
        <ProfileHeader profile={profile} />
        
        <PersonalBests 
          longestStreak={profile.longestStreak}
          mostConsistentHabit={profile.mostConsistentHabit}
        />
        
        <BestFriends bestFriends={profile.bestFriends} />
        
        <ConnectedApps isSpotifyConnected={!!session?.provider_token} />
        
        <MembershipMilestone daysActive={profile.daysActive} />
        
        <ProfileActions 
          onOpenSettings={() => setSettingsOpen(true)}
          onSignOut={handleSignOut}
        />
      </main>
      
      <Footer />
      
      <ProfileSettings open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default Profile;
