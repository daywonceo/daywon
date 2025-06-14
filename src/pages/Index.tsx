import { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Target, Calendar, TrendingUp } from "lucide-react";
import HabitAddSheet from "@/components/habit/HabitAddSheet";

const Index = () => {
  const [currentMonth, setCurrentMonth] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streakCount, setStreakCount] = useState(7);
  const [todayProgress, setTodayProgress] = useState(3);
  const [totalHabits, setTotalHabits] = useState(5);
  const isMobile = useIsMobile();
  const [addHabitSheetOpen, setAddHabitSheetOpen] = useState(false);
  
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col text-gray-800 dark:text-gray-200">
      <Header />
      
      <PullToRefresh onRefresh={handleRefresh}>
        <main className="flex-grow px-4 sm:px-5 pb-24 pt-4 sm:pt-6 max-w-3xl mx-auto w-full">
          <div className="py-4 text-center mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Your Habits Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Track your progress daily and build lasting habits</p>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Streak</p>
                    <p className="text-2xl font-bold text-green-600">{streakCount} days</p>
                  </div>
                  <Target className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Progress</p>
                    <p className="text-2xl font-bold text-blue-600">{todayProgress}/{totalHabits}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Weekly Goal</p>
                    <p className="text-2xl font-bold text-purple-600">85%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center mb-6">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400">
              🔥 On a {streakCount}-day streak!
            </Badge>
          </div>

          {/* Quick Action Button */}
          <div className="flex justify-center mb-8">
            <Button 
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => setAddHabitSheetOpen(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Quick Add Habit
            </Button>
            <HabitAddSheet
              open={addHabitSheetOpen}
              onOpenChange={setAddHabitSheetOpen}
              onHabitSelected={habit =>
                // Optionally show toast or actually add the habit!
                setAddHabitSheetOpen(false)
              }
            />
          </div>
          
          <RecentActivities month={currentMonth} />
          <HabitStats />
          <Progress />
        </main>
      </PullToRefresh>
      
      <Footer />
    </div>
  );
};

export default Index;
