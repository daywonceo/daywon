
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getHabitActivities, HabitActivity } from "@/utils/habitTracking";
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

  useEffect(() => {
    setAllActivities(getHabitActivities());
  }, []);

  const refreshActivities = () => {
    setAllActivities(getHabitActivities());
  }

  const handleDateClick = (date: Date) => {
    setSummaryDate(date);
    setShowDailySummary(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Hero Section - Mobile Optimized */}
      <div className="relative overflow-hidden bg-green-50 dark:bg-green-950/20 text-green-900 dark:text-green-100">
        <div className="absolute inset-0 bg-green-100/30 dark:bg-green-900/10"></div>
        
        {/* Decorative elements - minimalist */}
        <div className="absolute top-4 right-8 w-20 h-20 bg-green-200/20 dark:bg-green-800/20 rounded-full hidden sm:block"></div>
        <div className="absolute bottom-4 left-8 w-16 h-16 bg-green-200/20 dark:bg-green-800/20 rounded-full hidden sm:block"></div>
        
        <div className="relative px-4 sm:px-6 py-8 sm:py-12 max-w-4xl mx-auto w-full">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-green-200/30 dark:bg-green-800/30 rounded-lg backdrop-blur-sm border border-green-300/20 dark:border-green-700/20">
                <Calendar className="h-6 w-6 sm:h-7 sm:w-7 text-green-700 dark:text-green-300" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
                Calendar
              </h1>
            </div>
            <p className="text-center text-green-800/80 dark:text-green-200/80 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Track your journey and build lasting habits one day at a time
            </p>
          </div>
        </div>
      </div>
      
      <main className="flex-grow px-4 sm:px-6 pb-20 pt-6 sm:pt-8 max-w-4xl mx-auto w-full">
        {/* Calendar Header Card */}
        <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm border border-border p-4 sm:p-6 mb-6 sm:mb-8">
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
        <div className="bg-card rounded-xl sm:rounded-2xl shadow-sm border border-border p-4 sm:p-6 overflow-hidden">
          <div className="relative">
            {/* Calendar background decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-primary/5 rounded-full opacity-50 -translate-y-12 translate-x-12 sm:-translate-y-16 sm:translate-x-16 hidden sm:block"></div>
            
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
