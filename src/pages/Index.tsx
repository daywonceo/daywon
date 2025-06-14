
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
import { initializeDefaultHabits } from "@/utils/habitTracking";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Target, Calendar, TrendingUp } from "lucide-react";
import HabitAddSheet from "@/components/habit/HabitAddSheet";
import { useTopHabits, getCurrentMonthString } from "@/hooks/useTopHabits";
import TopHabitsSelectorModal from "@/components/habit/TopHabitsSelectorModal";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [streakCount, setStreakCount] = useState(7);
  const [todayProgress, setTodayProgress] = useState(3);
  const [totalHabits, setTotalHabits] = useState(5);
  const [showHabitsModal, setShowHabitsModal] = useState(false);

  const isMobile = useIsMobile();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // get top 3 habits and mutation
  const { topHabits, isLoading: topHabitsLoading, saveTopHabits, refetch } = useTopHabits();

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

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <Card className="bg-white dark:bg-gray-800/50 border-t-4 border-t-green-500 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <Target className="h-10 w-10 text-green-500 mb-3" />
                <p className="text-4xl font-bold text-green-600 dark:text-green-400">{streakCount}</p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Day Streak</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800/50 border-t-4 border-t-blue-500 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <Calendar className="h-10 w-10 text-blue-500 mb-3" />
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{todayProgress}/{totalHabits}</p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Completed Today</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800/50 border-t-4 border-t-purple-500 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <TrendingUp className="h-10 w-10 text-purple-500 mb-3" />
                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">85%</p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Weekly Goal</p>
              </CardContent>
            </Card>
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

          <RecentActivities habitList={activityHabits} />
          <HabitStats />
          <Progress />
        </main>
      </PullToRefresh>
      <Footer />
    </div>
  );
};

export default Index;
