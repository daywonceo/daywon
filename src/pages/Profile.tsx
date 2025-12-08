import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import ProfileSettings from "@/components/ProfileSettings";
import ProfileHeader from "@/components/profile/ProfileHeader";
import BestFriends from "@/components/profile/BestFriends";

import MembershipMilestone from "@/components/profile/MembershipMilestone";
import ProfileActions from "@/components/profile/ProfileActions";
import { IntegrationsPage } from "@/components/integrations/IntegrationsPage";
import { MobileProfileEditor } from "@/components/profile/MobileProfileEditor";
import { FriendManagementWidget } from "@/components/profile/FriendManagementWidget";
import { FriendSuggestionsCarousel } from "@/components/profile/FriendSuggestionsCarousel";
import AchievementsSection from "@/components/gamification/AchievementsSection";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Share2, BarChart3, Brain, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSocialProfiles } from "@/hooks/useSocialProfiles";
import { useHabitStats } from "@/hooks/useHabitStats";
import { useHabitScoring } from "@/hooks/useHabitScoring";
import { useFriends } from "@/hooks/useFriends";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showMobileEditor, setShowMobileEditor] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [completedChallenges, setCompletedChallenges] = useState(0);
  const { signOut, session, user } = useAuth();
  
  // Debug auth state
  console.log('Auth state:', { session: !!session, user: !!user, userId: user?.id });
  const { currentUserProfile } = useSocialProfiles();
  const { streakStats, todayStats } = useHabitStats();
  const { calculateHabitScore } = useHabitScoring();
  const { friends } = useFriends();

  // Fetch completed challenges count
  useEffect(() => {
    const fetchCompletedChallenges = async () => {
      if (!user?.id) return;
      
      const { count, error } = await supabase
        .from('challenge_participants')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed');
      
      if (!error && count !== null) {
        setCompletedChallenges(count);
      }
    };
    
    fetchCompletedChallenges();
  }, [user?.id]);
  
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
  
  // Get real profile data - only set avatar if we have the actual avatar_url
  const profile = {
    name: currentUserProfile?.display_name || "User",
    username: currentUserProfile?.username || "user",
    avatar: currentUserProfile?.avatar_url || "",
    friendCount: friends.length,
    habitScore: monthlyHabitScore,
    mostConsistentHabit: streakStats.longestStreakHabit || "No habits yet",
    bestFriends: friends.slice(0, 3).map(friend => ({
      name: friend.display_name || "Friend",
      avatar: friend.avatar_url || "",
      topHabit: "Active"
    })),
    daysActive: Math.floor((new Date().getTime() - new Date(currentUserProfile?.created_at || new Date()).getTime()) / (1000 * 60 * 60 * 24)),
    totalHabitsCompleted: completedChallenges,
    weeklyGoalCompletion: Math.round((todayStats.completedCount / Math.max(todayStats.totalHabits, 1)) * 100),
    isDayWonMember: currentUserProfile?.is_day_won_member || false
  };

  // Don't render ProfileHeader until we have the actual profile data loaded
  const isProfileLoaded = currentUserProfile !== null;


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
    <PageLayout hideFooter>
      <PageHeader 
        title="Your Profile" 
        subtitle="Track your progress and achievements"
      />
      
      <div className="space-y-8 px-2">
          {isProfileLoaded && <ProfileHeader profile={profile} />}
          
          {/* Achievements & Gamification */}
          <AchievementsSection />
          
          {/* Friends & Connections Section */}
          <FriendManagementWidget />
          
          {/* Friend Suggestions */}
          <FriendSuggestionsCarousel />
          
          {/* Tools & Insights Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Tools & Insights</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Analytics Dashboard Card */}
              <Card 
                className="glass-card cursor-pointer group hover:shadow-glow transition-all duration-300 overflow-hidden"
                onClick={() => navigate('/analytics')}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <BarChart3 className="w-6 h-6 text-primary" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Analytics Dashboard</h3>
                    <p className="text-sm text-muted-foreground">
                      View detailed habit insights, progress trends, and performance metrics
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* AI-Powered Tools Card */}
              <Card 
                className="glass-card cursor-pointer group hover:shadow-glow transition-all duration-300 overflow-hidden"
                onClick={() => navigate('/advanced')}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                      <Brain className="w-6 h-6 text-accent" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">AI-Powered Tools</h3>
                    <p className="text-sm text-muted-foreground">
                      Access conversational AI coach, content generation, and smart recommendations
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Connected Apps</h2>
            <Dialog open={showIntegrations} onOpenChange={setShowIntegrations}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Manage Connected Apps
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[85vh] overflow-hidden p-4 sm:p-6">
                <DialogHeader className="pb-3">
                  <DialogTitle className="text-lg sm:text-xl">Connected Apps & Integrations</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto max-h-[70vh] -mx-4 sm:mx-0 px-4 sm:px-0">
                  <IntegrationsPage />
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <BestFriends bestFriends={profile.bestFriends} />
            <MembershipMilestone daysActive={profile.daysActive} />
          </div>
          
          <ProfileActions 
            onOpenSettings={() => setSettingsOpen(true)}
            onSignOut={handleSignOut}
          />
      </div>
      
      <ProfileSettings open={settingsOpen} onOpenChange={setSettingsOpen} />
    </PageLayout>
  );
};

export default Profile;
