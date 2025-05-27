
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { format, subMonths } from "date-fns";
import CalendarHeader from "@/components/calendar/CalendarHeader";
import CalendarView from "@/components/calendar/CalendarView";
import ListView from "@/components/calendar/ListView";
import HistoryView from "@/components/calendar/HistoryView";

const CalendarPage = () => {
  const [currentView, setCurrentView] = useState("calendar"); // calendar or list
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("current"); // current or history
  const isMobile = useIsMobile();
  
  const daysOfWeek = isMobile 
    ? ["S", "M", "T", "W", "T", "F", "S"] 
    : ["SUN", "MON", "TUES", "WED", "THURS", "FRI", "SAT"];
  
  // Generate calendar data for current month (31 days)
  const generateCalendarDays = () => {
    const days = [];
    for (let i = 1; i <= 31; i++) {
      days.push(i);
    }
    return days;
  };

  const calendarDays = generateCalendarDays();
  
  // Function to handle day selection
  const handleDayClick = (day: number) => {
    setSelectedDay(day);
  };

  // For a more compact mobile view, we'll show fewer weeks at a time
  const getCompactWeekView = () => {
    // Create a 2-week view (14 days) centered around today
    const today = new Date().getDate();
    const startDay = Math.max(1, today - 7);
    const endDay = Math.min(31, today + 6);
    
    return Array.from({ length: endDay - startDay + 1 }, (_, i) => startDay + i);
  };
  
  const compactDays = isMobile ? getCompactWeekView() : calendarDays;

  // Generate previous 6 months data
  const getPreviousMonths = () => {
    const today = new Date();
    const months = [];
    
    for (let i = 1; i <= 6; i++) {
      const date = subMonths(today, i);
      months.push({
        name: format(date, "MMMM"),
        year: format(date, "yyyy"),
        daysInMonth: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
        firstDayOfWeek: new Date(date.getFullYear(), date.getMonth(), 1).getDay()
      });
    }
    
    return months;
  };
  
  const previousMonths = getPreviousMonths();

  // Sample activities for list view
  const activities = [
    { day: 1, text: "WENT OUT TO DINNER WITH FRIENDS" },
    { day: 2, text: "HIT A PR ON BENCH IN THE GYM" },
    { day: 3, text: "PLAYED IN A NEW SOCCER LEAGUE AND WON" }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col text-gray-800 dark:text-gray-200">
      <Header />
      
      <main className="flex-grow px-2 sm:px-5 pb-20 pt-2 sm:pt-6 max-w-3xl mx-auto w-full">
        <div className="py-2 sm:py-4 text-center">
          <h1 className="text-xl sm:text-2xl font-bold">Calendar</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">View your historical data</p>
        </div>
        
        <Card className="mb-4 sm:mb-12 border-green-200 dark:border-green-800 shadow-md">
          <CardHeader className="pb-1 sm:pb-2 px-2 sm:px-6 pt-2 sm:pt-6">
            <CalendarHeader 
              title="THIS MONTH'S OUTLOOK"
              activeTab={activeTab}
              currentView={currentView}
              setActiveTab={setActiveTab}
              setCurrentView={setCurrentView}
            />
          </CardHeader>
          
          <CardContent className="px-1 sm:px-6 pb-2 sm:pb-6">
            {activeTab === "current" ? (
              currentView === 'calendar' ? (
                <CalendarView 
                  daysOfWeek={daysOfWeek}
                  compactDays={compactDays}
                  calendarDays={calendarDays}
                  onDayClick={handleDayClick}
                />
              ) : (
                <ListView activities={activities} />
              )
            ) : (
              <HistoryView 
                previousMonths={previousMonths}
                daysOfWeek={daysOfWeek}
              />
            )}
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default CalendarPage;
