
import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSettings from "@/components/ProfileSettings";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PersonalBests from "@/components/profile/PersonalBests";
import BestFriends from "@/components/profile/BestFriends";
import ShareMilestoneCard from "@/components/social/ShareMilestoneCard";
import MembershipMilestone from "@/components/profile/MembershipMilestone";
import ConnectedApps from "@/components/profile/ConnectedApps";
import ProfileActions from "@/components/profile/ProfileActions";
import { useAuth } from "@/contexts/AuthContext";
import { useSocialProfiles } from "@/hooks/useSocialProfiles";
import { useHabitStats } from "@/hooks/useHabitStats";
import { useHabitScoring } from "@/hooks/useHabitScoring";
import { useFriends } from "@/hooks/useFriends";
import { toast } from "sonner";

const Profile = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { signOut, session } = useAuth();
  const { currentUserProfile } = useSocialProfiles();
  const { streakStats, todayStats } = useHabitStats();
  const { calculateHabitScore } = useHabitScoring();
  const { friends } = useFriends();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  // Calculate habit score for weekly period with fallback
  const weeklyHabitScore = calculateHabitScore('weekly') || {
    totalScore: 0,
    consistencyRate: 0,
    streakScore: 0,
    varietyScore: 0,
    recencyScore: 0
  };
  
  // Get real profile data
  const profile = {
    name: currentUserProfile?.display_name || currentUserProfile?.email || "User",
    avatar: currentUserProfile?.avatar_url || "/lovable-uploads/dba09bea-3695-42d9-b2ba-6da163dee57a.png",
    friendCount: friends.length,
    habitScore: weeklyHabitScore,
    mostConsistentHabit: streakStats.longestStreakHabit || "No habits yet",
    bestFriends: friends.slice(0, 3).map(friend => ({
      name: friend.display_name || friend.email || "Friend",
      avatar: friend.avatar_url || "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png",
      topHabit: "Active"
    })),
    daysActive: Math.floor((new Date().getTime() - new Date(currentUserProfile?.created_at || new Date()).getTime()) / (1000 * 60 * 60 * 24)),
    totalHabitsCompleted: todayStats.completedCount,
    weeklyGoalCompletion: Math.round((todayStats.completedCount / Math.max(todayStats.totalHabits, 1)) * 100)
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
          habitScore={profile.habitScore}
          mostConsistentHabit={profile.mostConsistentHabit}
        />
        
        <ShareMilestoneCard className="mb-6" />
        
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
