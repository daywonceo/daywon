
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getHabitActivities, HabitActivity } from "@/utils/habitTracking";
import CalendarView from "@/components/calendar/CalendarView";
import CalendarHeader from "@/components/calendar/CalendarHeader";
import DailySummaryModal from "@/components/calendar/DailySummaryModal";
import { Settings, BarChart, Plus } from 'lucide-react';
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
    <div className="min-h-screen bg-white flex flex-col text-gray-900">
      <Header />
      
      <main className="flex-grow px-4 sm:px-6 pb-20 pt-4 sm:pt-6 max-w-3xl mx-auto w-full">
        <div className="flex justify-end items-center mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><Settings className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon"><BarChart className="h-5 w-5" /></Button>
            <Button className="bg-green-500 hover:bg-green-600 rounded-full w-10 h-10"><Plus className="h-6 w-6" /></Button>
          </div>
        </div>

        <CalendarHeader
          title="Calendar & Habits"
          activeTab=""
          currentView=""
          timePeriod={timePeriod}
          setActiveTab={() => {}}
          setCurrentView={() => {}}
          setTimePeriod={setTimePeriod}
        />

        <div className="mt-6">
          <CalendarView
            date={selectedDate}
            setDate={setSelectedDate}
            onDateClick={handleDateClick}
            timePeriod={timePeriod}
          />
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
