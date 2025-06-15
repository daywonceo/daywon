
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CalendarHeader from "@/components/calendar/CalendarHeader";
import CalendarView from "@/components/calendar/CalendarView";
import ListView from "@/components/calendar/ListView";
import HistoryView from "@/components/calendar/HistoryView";
import { CalendarDays, Activity, TrendingUp, Award } from "lucide-react";

const CalendarPage = () => {
  const [currentView, setCurrentView] = useState("calendar"); // calendar or list
  const [activeTab, setActiveTab] = useState("current"); // current or history
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Sample activities for list view
  const activities = [
    { day: 1, text: "WENT OUT TO DINNER WITH FRIENDS" },
    { day: 2, text: "HIT A PR ON BENCH IN THE GYM" },
    { day: 3, text: "PLAYED IN A NEW SOCCER LEAGUE AND WON" }
  ];

  // Calendar stats
  const monthStats = {
    completedDays: 18,
    totalDays: 31,
    activeHabits: 5,
    bestStreak: 12
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col text-gray-800 dark:text-gray-200">
      <Header />
      
      <main className="flex-grow px-2 sm:px-5 pb-20 pt-2 sm:pt-6 max-w-3xl mx-auto w-full">
        <div className="py-2 sm:py-4 text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Habit Calendar
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
            Visualize your consistency and track your journey
          </p>
        </div>

        {/* Month Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card className="text-center p-3 border-green-200 dark:border-green-800 shadow-sm">
            <CalendarDays className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <p className="text-lg font-bold text-green-600">{monthStats.completedDays}</p>
            <p className="text-xs text-gray-500">Days Active</p>
          </Card>
          
          <Card className="text-center p-3 border-blue-200 dark:border-blue-800 shadow-sm">
            <Activity className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <p className="text-lg font-bold text-blue-600">{monthStats.activeHabits}</p>
            <p className="text-xs text-gray-500">Active Habits</p>
          </Card>
          
          <Card className="text-center p-3 border-purple-200 dark:border-purple-800 shadow-sm">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-600" />
            <p className="text-lg font-bold text-purple-600">{Math.round((monthStats.completedDays / monthStats.totalDays) * 100)}%</p>
            <p className="text-xs text-gray-500">Completion</p>
          </Card>
          
          <Card className="text-center p-3 border-orange-200 dark:border-orange-800 shadow-sm">
            <Award className="h-6 w-6 mx-auto mb-2 text-orange-600" />
            <p className="text-lg font-bold text-orange-600">{monthStats.bestStreak}</p>
            <p className="text-xs text-gray-500">Best Streak</p>
          </Card>
        </div>

        {/* Motivational Badge */}
        <div className="flex justify-center mb-6">
          <Badge variant="outline" className="px-4 py-2 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
            🎯 {monthStats.completedDays > 15 ? "Excellent consistency!" : "Keep building momentum!"}
          </Badge>
        </div>
        
        <Card className="mb-4 sm:mb-12 border-green-200 dark:border-green-800 shadow-lg">
          <CardHeader className="pb-1 sm:pb-2 px-2 sm:px-6 pt-2 sm:pt-6">
            <CalendarHeader 
              title="THIS MONTH'S OUTLOOK"
              activeTab={activeTab}
              currentView={currentView}
              setActiveTab={setActiveTab}
              setCurrentView={setCurrentView}
            />
          </CardHeader>
          
          <CardContent className="px-1 sm:px-6 pb-2 sm:pb-6 pt-4">
            {activeTab === "current" ? (
              currentView === 'calendar' ? (
                <CalendarView 
                  date={date}
                  setDate={setDate}
                />
              ) : (
                <ListView activities={activities} />
              )
            ) : (
              <HistoryView />
            )}
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default CalendarPage;
