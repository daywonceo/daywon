import { useEffect, useState } from "react";
import Header from "@/components/Header";
import RecentActivities from "@/components/RecentActivities";
import HabitStats from "@/components/HabitStats";
import Progress from "@/components/Progress";
import Footer from "@/components/Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import PullToRefresh from "@/components/PullToRefresh";
import { toast } from "@/hooks/use-toast";
import SwipeableCard from "@/components/SwipeableCard";
import { saveOfflineData, getOfflineData } from "@/utils/offlineStorage";
import { hapticSuccess } from "@/utils/haptics";
import { initializeDefaultHabits } from "@/utils/habitCategories";
import { Button } from "@/components/ui/button";
import { BookOpen, Camera } from "lucide-react";
import HabitAddSheet from "@/components/habit/HabitAddSheet";
import { useNavigate } from "react-router-dom";
import { useTopHabits, getCurrentMonthString } from "@/hooks/useTopHabits";
import TopHabitsSelectorModal from "@/components/habit/TopHabitsSelectorModal";
import AllHabitsDialog from "@/components/habit/AllHabitsDialog";
import HabitGallery from "@/components/habit/HabitGallery";
import CompletionRateCard from "@/components/progress/CompletionRateCard";
import MilestoneTracker from "@/components/progress/MilestoneTracker";
import DailyEncouragementCard from "@/components/progress/DailyEncouragementCard";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showHabitsModal, setShowHabitsModal] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
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

  // Auto-refresh data when app becomes visible or gains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('App became visible, refreshing data...');
        setRefreshTrigger(prev => prev + 1);
      }
    };

    const handleFocus = () => {
      console.log('App gained focus, refreshing data...');
      setRefreshTrigger(prev => prev + 1);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
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
      console.error("Error refreshing data:", error);
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
    : ["WORKOUT", "DEVOTIONS", "READ"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-white to-blue-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col text-gray-800 dark:text-gray-200">
      <Header />
      <PullToRefresh onRefresh={handleRefresh}>
        <main className="flex-grow px-4 sm:px-5 pb-24 pt-6 sm:pt-10 max-w-4xl mx-auto w-full">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-gray-800 dark:text-gray-100">
              {getGreeting()}
            </h1>
            <p className="text-md text-gray-500 dark:text-gray-400 mt-2">Ready to build some great habits?</p>
          </div>

          {/* New Progress Components */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <CompletionRateCard userHabits={activityHabits} />
            <MilestoneTracker userHabits={activityHabits} />
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

          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-200 tracking-tight">Recent Activity</h2>
            <div className="flex gap-1 sm:gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowGallery(true)}
                className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
              >
                <Camera className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Gallery</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/all-habits")}
                className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
              >
                <BookOpen className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">All Habits</span>
              </Button>
            </div>
          </div>

          <RecentActivities habitList={activityHabits} onHabitUpdate={handleHabitUpdate} />
          <HabitStats refreshTrigger={refreshTrigger} />
          <Progress userHabits={activityHabits} />
        </main>
      </PullToRefresh>
      <Footer />
    </div>
  );
};

export default Index;
