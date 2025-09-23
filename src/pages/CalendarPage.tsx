
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { loadHabitActivitiesFromDatabase, HabitActivity } from "@/utils/habitActivity";
import CalendarView from "@/components/calendar/CalendarView";
import CalendarHeader from "@/components/calendar/CalendarHeader";
import DailySummaryModal from "@/components/calendar/DailySummaryModal";
import { Settings, BarChart, Plus, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";

const CalendarPage = () => {
  const [allActivities, setAllActivities] = useState<HabitActivity[]>([]);
  const [timePeriod, setTimePeriod] = useState("current");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showDailySummary, setShowDailySummary] = useState(false);
  const [summaryDate, setSummaryDate] = useState<Date | null>(null);

  const loadActivities = async () => {
    try {
      const activities = await loadHabitActivitiesFromDatabase();
      setAllActivities(activities);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  // Listen for habit status changes from other parts of the app
  useEffect(() => {
    const handleHabitStatusChange = () => {
      loadActivities();
    };

    window.addEventListener('habitStatusChanged', handleHabitStatusChange);
    
    return () => {
      window.removeEventListener('habitStatusChanged', handleHabitStatusChange);
    };
  }, []);

  const refreshActivities = () => {
    loadActivities();
  }

  const handleDateClick = (date: Date) => {
    setSummaryDate(date);
    setShowDailySummary(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light/20 via-background to-accent/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-primary/5 dark:bg-primary/10">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-4 right-8 w-20 h-20 bg-primary/10 rounded-full hidden sm:block"></div>
        <div className="absolute bottom-4 left-8 w-16 h-16 bg-accent/10 rounded-full hidden sm:block"></div>
        
        <div className="relative px-responsive py-8 max-w-4xl mx-auto w-full">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg backdrop-blur-sm border border-primary/20">
                <Calendar className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Calendar
              </h1>
            </div>
            <p className="text-center text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Track your journey and build lasting habits one day at a time
            </p>
          </div>
        </div>
      </div>
      
      <main className="flex-grow px-responsive pb-20 pt-6 max-w-4xl mx-auto w-full">
        {/* Calendar Header Card */}
        <div className="glass rounded-lg shadow-sm border p-responsive mb-6 animate-fade-in">
          <CalendarHeader
            title=""
            activeTab=""
            currentView=""
            timePeriod={timePeriod}
            setActiveTab={() => {}}
            setCurrentView={() => {}}
            setTimePeriod={setTimePeriod}
          />
        </div>

        {/* Calendar Card */}
        <div className="glass rounded-lg shadow-sm border p-responsive overflow-hidden animate-fade-in">
          <div className="relative">
            {/* Calendar background decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full opacity-50 -translate-y-12 translate-x-12 hidden sm:block"></div>
            
            <CalendarView
              date={selectedDate}
              setDate={setSelectedDate}
              onDateClick={handleDateClick}
              timePeriod={timePeriod}
            />
          </div>
        </div>
      </main>

      <DailySummaryModal
        date={summaryDate}
        isOpen={showDailySummary}
        onClose={() => setShowDailySummary(false)}
      />
      
      <Footer />
    </div>
  );
};

export default CalendarPage;
