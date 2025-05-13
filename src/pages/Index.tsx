
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

const Index = () => {
  const [currentMonth, setCurrentMonth] = useState("MARCH");
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();
  
  // Simulate data loading
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate updating data
      const newData = {
        lastUpdated: Date.now(),
        habits: [/* Would contain updated habit data */],
        activities: [/* Would contain updated activity data */],
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
  
  // Initialize from offline storage when the app loads
  useEffect(() => {
    const offlineData = getOfflineData();
    console.log("Loaded offline data:", offlineData);
    // Would use this data to populate the UI components
  }, []);
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col text-gray-800 dark:text-gray-200">
      <Header />
      
      <PullToRefresh onRefresh={handleRefresh}>
        <main className="flex-grow px-4 sm:px-5 pb-24 pt-4 sm:pt-6 max-w-3xl mx-auto w-full">
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
