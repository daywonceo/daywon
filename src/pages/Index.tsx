
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import RecentActivities from "@/components/RecentActivities";
import Calendar from "@/components/Calendar";
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

const Index = () => {
  const [currentMonth, setCurrentMonth] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();
  
  // Initialize app data on first load and set current month
  useEffect(() => {
    try {
      // Set current month
      const date = new Date();
      const monthName = date.toLocaleString('default', { month: 'long' }).toUpperCase();
      setCurrentMonth(monthName);
      
      // Load offline data
      const offlineData = getOfflineData();
      console.log("Loaded offline data:", offlineData);
      
      // Initialize default habits if none exist
      initializeDefaultHabits();
    } catch (error) {
      console.error("Failed to initialize app data:", error);
    }
  }, []);
  
  // Simulate data loading
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate updating data
      const newData = {
        lastUpdated: Date.now(),
      };
      
      saveOfflineData(newData);
      hapticSuccess(); // Provide haptic feedback on successful refresh
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
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col text-gray-800 dark:text-gray-200">
      <Header />
      
      <PullToRefresh onRefresh={handleRefresh}>
        <main className="flex-grow px-4 sm:px-5 pb-24 pt-4 sm:pt-6 max-w-3xl mx-auto w-full">
          <div className="py-4 text-center">
            <h1 className="text-2xl font-bold">Your Habits</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Track your progress daily</p>
          </div>
          
          <RecentActivities month={currentMonth} />
          
          {/* Make Calendar component swipeable on mobile */}
          {isMobile ? (
            <SwipeableCard
              onSwipeLeft={() => console.log("Swiped left - previous month")}
              onSwipeRight={() => console.log("Swiped right - next month")}
              leftActionText="Previous"
              rightActionText="Next"
            >
              <Calendar month={currentMonth} />
            </SwipeableCard>
          ) : (
            <Calendar month={currentMonth} />
          )}
          
          <HabitStats />
          <Progress />
        </main>
      </PullToRefresh>
      
      <Footer />
    </div>
  );
};

export default Index;
