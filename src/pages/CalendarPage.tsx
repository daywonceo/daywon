
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col text-gray-900">
      <Header />
      
      {/* Hero Section - Mobile Optimized */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white">
        <div className="absolute inset-0 bg-black/5"></div>
        
        {/* Decorative circles - adjusted for mobile */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-8 w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-8 w-12 h-12 sm:w-20 sm:h-20 bg-white/10 rounded-full"></div>
        <div className="absolute top-1/2 right-1/4 w-8 h-8 sm:w-12 sm:h-12 bg-white/5 rounded-full"></div>
        
        <div className="relative px-4 sm:px-6 py-6 sm:py-10 max-w-4xl mx-auto w-full">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/10">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold font-display tracking-tight">
                Calendar
              </h1>
            </div>
            <p className="text-center text-green-50 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Track your journey and build lasting habits one day at a time
            </p>
          </div>
        </div>
      </div>
      
      <main className="flex-grow px-3 sm:px-6 pb-20 pt-4 sm:pt-6 max-w-4xl mx-auto w-full">
        {/* Action Buttons - Mobile Optimized */}
        <div className="flex justify-end items-center mb-4 sm:mb-6">
          <div className="flex items-center gap-2 bg-white rounded-full shadow-lg border border-gray-100 p-1.5 sm:p-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-gray-100 transition-colors h-8 w-8 sm:h-10 sm:w-10"
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-gray-100 transition-colors h-8 w-8 sm:h-10 sm:w-10"
            >
              <BarChart className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            </Button>
            <Button className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 rounded-full h-10 w-10 sm:h-12 sm:w-12 shadow-lg transform hover:scale-105 transition-all duration-200">
              <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </div>
        </div>

        {/* Calendar Header Card - Mobile Optimized */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
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

        {/* Calendar Card - Mobile Optimized */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 overflow-hidden">
          <div className="relative">
            {/* Calendar background decoration - hidden on small screens */}
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full opacity-30 sm:opacity-50 -translate-y-12 translate-x-12 sm:-translate-y-16 sm:translate-x-16"></div>
            
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
