
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
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-4 sm:px-6 py-8 sm:py-12 max-w-3xl mx-auto w-full">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              <Calendar className="h-8 w-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-display">Calendar & Habits</h1>
          </div>
          <p className="text-center text-green-100 text-lg max-w-2xl mx-auto">
            Track your journey, celebrate your wins, and build lasting habits one day at a time
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
      </div>
      
      <main className="flex-grow px-4 sm:px-6 pb-20 pt-6 sm:pt-8 max-w-3xl mx-auto w-full">
        {/* Action Buttons */}
        <div className="flex justify-end items-center mb-8">
          <div className="flex items-center gap-3 bg-white rounded-full shadow-lg border border-gray-100 p-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-gray-100 transition-colors"
            >
              <Settings className="h-5 w-5 text-gray-600" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-gray-100 transition-colors"
            >
              <BarChart className="h-5 w-5 text-gray-600" />
            </Button>
            <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-full w-12 h-12 shadow-lg transform hover:scale-105 transition-all duration-200">
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Calendar Header Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
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
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 overflow-hidden">
          <div className="relative">
            {/* Calendar background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full opacity-50 -translate-y-16 translate-x-16"></div>
            
            <CalendarView
              date={selectedDate}
              setDate={setSelectedDate}
              onDateClick={handleDateClick}
              timePeriod={timePeriod}
            />
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white">
            <div className="text-2xl font-bold">12</div>
            <div className="text-green-100 text-sm">Days this month</div>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-4 text-white">
            <div className="text-2xl font-bold">5</div>
            <div className="text-blue-100 text-sm">Current streak</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white">
            <div className="text-2xl font-bold">85%</div>
            <div className="text-purple-100 text-sm">Success rate</div>
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
