import { useEffect, useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import RecentActivities from "@/components/RecentActivities";
import HabitStats from "@/components/HabitStats";
import { FeatureErrorBoundary } from "@/components/errors/FeatureErrorBoundary";
import { useIsMobile } from "@/hooks/use-mobile";
import PullToRefresh from "@/components/PullToRefresh";
import { toast } from "@/hooks/use-toast";

import { saveOfflineData, getOfflineData } from "@/utils/offlineStorage";
import { hapticSuccess } from "@/utils/haptics";
import { initializeDefaultHabits } from "@/utils/habitCategories";
import { Button } from "@/components/ui/button";
import { List } from "lucide-react";
import HabitAddSheet from "@/components/habit/HabitAddSheet";
import { useNavigate } from "react-router-dom";
import { useTopHabits, getCurrentMonthString } from "@/hooks/useTopHabits";
import { useHabits } from "@/hooks/useHabits";
import TopHabitsSelectorModal from "@/components/habit/TopHabitsSelectorModal";

import HabitGallery from "@/components/habit/HabitGallery";
import CompletionRateCard from "@/components/progress/CompletionRateCard";
import MilestoneTracker from "@/components/progress/MilestoneTracker";
import DailyEncouragementCard from "@/components/progress/DailyEncouragementCard";


import { useHabitSystemTransition } from "@/hooks/useHabitSystemTransition";
import { useEndOfDayProcessing } from "@/hooks/useEndOfDayProcessing";
import HabitManagementView from "@/components/habit/HabitManagementView";
import { AppEnhancements } from "@/components/AppEnhancements";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showHabitsModal, setShowHabitsModal] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showHabitManagement, setShowHabitManagement] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // get top 3 habits and mutation
  const { topHabits, isLoading: topHabitsLoading, saveTopHabits, refetch } = useTopHabits();
  
  // get all user habits
  const { habits: allHabits, isLoading: allHabitsLoading } = useHabits();
  
  // Automatically detect and merge duplicate habits
  
  
  // Initialize V2 habit system with backend ID handling
  useHabitSystemTransition();
  
  // Listen for end-of-day processing events
  const { triggerEndOfDayProcessing } = useEndOfDayProcessing();

  // Auto-refresh data when app becomes visible or gains focus (with throttling)
  useEffect(() => {
    let throttleTimer: NodeJS.Timeout | null = null;
    
    const throttledRefresh = () => {
      if (throttleTimer) return; // Already pending
      
      throttleTimer = setTimeout(() => {
        setRefreshTrigger(prev => prev + 1);
        throttleTimer = null;
      }, 2000); // Throttle to max once every 2 seconds
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        throttledRefresh();
      }
    };

    const handleFocus = () => {
      throttledRefresh();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      if (throttleTimer) {
        clearTimeout(throttleTimer);
      }
    };
  }, []);

  // Prompt user at the start of a new month (or if not set)
  useEffect(() => {
    const offlineData = getOfflineData();
    initializeDefaultHabits();

    // Check if need to prompt for top 3 habits
    // Simplified: if there's no topHabits, open modal (skip on first load if loading)
    if (!topHabitsLoading && !topHabits) {
      setShowHabitsModal(true);
    }
  }, [topHabits, topHabitsLoading]);

  // Simulate data loading
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const newData = { lastUpdated: Date.now() };
      saveOfflineData(newData);
      hapticSuccess();
      toast({
        title: "Data refreshed!",
        description: `Last updated: ${new Date().toLocaleTimeString()}`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Could not update your data. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle new habit selected from quick add
  const handleHabitSelected = (habit: string) => {
    // Optionally: toast({ title: habit + " added!" });
  };

  // Function to trigger refresh when habits are updated
  const handleHabitUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Pass selected top 3 habits to RecentActivities.
  // If not loaded, fall back to previously used or fixed habits.
  const activityHabits = topHabits && topHabits.length === 3
    ? topHabits
    : ["Workout", "Devotions", "Read"];

  // Get all active habit names for sections that need to show all habits (not ended or archived)
  const allActiveHabitNames = allHabits?.filter(h => h.status === 'active' && !h.ended_at && !h.archived_at).map(h => h.name) || [];

  return (
    <PageLayout hideFooter>
      <PullToRefresh onRefresh={handleRefresh}>
        <div id="main-content">
          <PageHeader 
            title={getGreeting()} 
            subtitle="Ready to build some great habits?"
          />

          {/* Streamlined Progress Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <CompletionRateCard userHabits={allActiveHabitNames.length > 0 ? allActiveHabitNames : activityHabits} />
            <MilestoneTracker userHabits={allActiveHabitNames.length > 0 ? allActiveHabitNames : activityHabits} />
            <DailyEncouragementCard />
          </div>

          {/* Modal for top 3 habits */}
          <TopHabitsSelectorModal
            open={showHabitsModal}
            onClose={() => setShowHabitsModal(false)}
            initialHabits={topHabits ?? []}
            onSave={async (habits) => {
              await saveTopHabits(habits);
              setShowHabitsModal(false);
              refetch();
            }}
          />

          <HabitGallery open={showGallery} onOpenChange={setShowGallery} />
          <HabitManagementView 
            open={showHabitManagement} 
            onClose={() => setShowHabitManagement(false)}
            userHabits={allActiveHabitNames.length > 0 ? allActiveHabitNames : activityHabits}
          />

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Recent Activity</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowHabitManagement(true)}
                className="flex-1 sm:flex-none"
              >
                <List className="mr-2 h-4 w-4" />
                <span className="sm:inline">Manage Habits</span>
              </Button>
            </div>
          </div>

          <FeatureErrorBoundary featureName="Habit Tracker">
            <RecentActivities habitList={activityHabits} onHabitUpdate={handleHabitUpdate} />
            <HabitStats refreshTrigger={refreshTrigger} />
          </FeatureErrorBoundary>
        </div>
      </PullToRefresh>
      <AppEnhancements />
    </PageLayout>
  );
};

export default Index;
