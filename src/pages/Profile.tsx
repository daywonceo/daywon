
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
import { MobileProfileEditor } from "@/components/profile/MobileProfileEditor";
import { useAuth } from "@/contexts/AuthContext";
import { useSocialProfiles } from "@/hooks/useSocialProfiles";
import { useHabitStats } from "@/hooks/useHabitStats";
import { useHabitScoring } from "@/hooks/useHabitScoring";
import { useFriends } from "@/hooks/useFriends";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

const Profile = () => {
  const isMobile = useIsMobile();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showMobileEditor, setShowMobileEditor] = useState(false);
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

  // Calculate habit score for monthly period with fallback
  const monthlyHabitScore = calculateHabitScore('monthly') || {
    totalScore: 0,
    consistencyRate: 0,
    streakScore: 0,
    varietyScore: 0,
    recencyScore: 0
  };
  
  // Get real profile data
  const profile = {
    name: currentUserProfile?.display_name || "User",
    username: currentUserProfile?.username || "user",
    avatar: currentUserProfile?.avatar_url || "/lovable-uploads/dba09bea-3695-42d9-b2ba-6da163dee57a.png",
    friendCount: friends.length,
    habitScore: monthlyHabitScore,
    mostConsistentHabit: streakStats.longestStreakHabit || "No habits yet",
    bestFriends: friends.slice(0, 3).map(friend => ({
      name: friend.display_name || "Friend",
      avatar: friend.avatar_url || "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png",
      topHabit: "Active"
    })),
    daysActive: Math.floor((new Date().getTime() - new Date(currentUserProfile?.created_at || new Date()).getTime()) / (1000 * 60 * 60 * 24)),
    totalHabitsCompleted: todayStats.completedCount,
    weeklyGoalCompletion: Math.round((todayStats.completedCount / Math.max(todayStats.totalHabits, 1)) * 100)
  };


  // Mobile Profile Editor
  if (isMobile && showMobileEditor) {
    return (
      <MobileProfileEditor 
        onCancel={() => setShowMobileEditor(false)}
        onSave={() => setShowMobileEditor(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light/20 via-background to-accent/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      <Header />
      
      <main className="flex-grow px-responsive pb-24 pt-6 max-w-4xl mx-auto w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            Your Profile
          </h1>
          <p className="text-sm text-muted-foreground mt-2">Track your progress and achievements</p>
        </div>
        
        <div className="space-y-6">
          <ProfileHeader profile={profile} />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PersonalBests 
              habitScore={profile.habitScore}
              mostConsistentHabit={profile.mostConsistentHabit}
            />
            <ConnectedApps isSpotifyConnected={!!session?.provider_token} />
          </div>
          
          <ShareMilestoneCard />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BestFriends bestFriends={profile.bestFriends} />
            <MembershipMilestone daysActive={profile.daysActive} />
          </div>
          
          <ProfileActions 
            onOpenSettings={() => isMobile ? setShowMobileEditor(true) : setSettingsOpen(true)}
            onSignOut={handleSignOut}
          />
        </div>
      </main>
      
      <Footer />
      
      <ProfileSettings open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default Profile;
