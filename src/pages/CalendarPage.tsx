
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHabits, Habit } from "@/hooks/useHabits";
import { getHabitActivities, HabitActivity } from "@/utils/habitTracking";
import { subDays, format } from 'date-fns';
import HabitCard from "@/components/calendar/HabitCard";
import CalendarView from "@/components/calendar/CalendarView";
import CalendarHeader from "@/components/calendar/CalendarHeader";
import DailySummaryModal from "@/components/calendar/DailySummaryModal";
import { BookOpenText, Apple, Dumbbell, Wind, Footprints, Settings, Plus, BarChart, LucideIcon } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const TOTAL_GRAPH_DAYS = 180;
type Color = 'green' | 'purple' | 'red' | 'orange' | 'blue';

const habitDetails: { nameContains: string; color: Color; icon: LucideIcon }[] = [
  { nameContains: 'walk', color: 'green', icon: Footprints },
  { nameContains: 'read', color: 'purple', icon: BookOpenText },
  { nameContains: 'devotion', color: 'purple', icon: BookOpenText },
  { nameContains: 'fruit', color: 'red', icon: Apple },
  { nameContains: 'stretch', color: 'orange', icon: Dumbbell },
  { nameContains: 'breathing', color: 'blue', icon: Wind },
  { nameContains: 'workout', color: 'orange', icon: Dumbbell },
];

const defaultDetail = { color: 'green' as Color, icon: Dumbbell };

const getHabitDetails = (habitName: string) => {
    const name = habitName.toLowerCase();
    const found = habitDetails.find(d => name.includes(d.nameContains));
    return found || { ...defaultDetail, color: habitDetails[Math.floor(Math.random() * habitDetails.length)].color };
};

const CalendarPage = () => {
  const { habits, isLoading: isLoadingHabits } = useHabits();
  const [allActivities, setAllActivities] = useState<HabitActivity[]>([]);
  const [currentView, setCurrentView] = useState("calendar");
  const [activeTab, setActiveTab] = useState("current");
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

  const generateActivityData = (habitName: string) => {
      const habitActivities = allActivities.filter(a => a.habitName === habitName && a.status === 'completed');
      const activityDates = new Set(habitActivities.map(a => a.date));

      return Array.from({ length: TOTAL_GRAPH_DAYS }, (_, i) => {
          const date = subDays(new Date(), i);
          const dateString = format(date, 'yyyy-MM-dd');
          return activityDates.has(dateString);
      });
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
          activeTab={activeTab}
          currentView={currentView}
          timePeriod={timePeriod}
          setActiveTab={setActiveTab}
          setCurrentView={setCurrentView}
          setTimePeriod={setTimePeriod}
        />

        <div className="mt-6">
          {currentView === "calendar" ? (
            <div className="space-y-6">
              <CalendarView
                date={selectedDate}
                setDate={setSelectedDate}
                onDateClick={handleDateClick}
              />
              
              <div className="space-y-4">
                {isLoadingHabits && (
                  <>
                    <Skeleton className="h-40 w-full bg-gray-200" />
                    <Skeleton className="h-40 w-full bg-gray-200" />
                    <Skeleton className="h-40 w-full bg-gray-200" />
                  </>
                )}
                {habits?.map(habit => {
                    const details = getHabitDetails(habit.name);
                    const activityData = generateActivityData(habit.name);
                    const todayString = format(new Date(), 'yyyy-MM-dd');
                    const isCompletedToday = allActivities.some(a => a.habitName === habit.name && a.date === todayString && a.status === 'completed');

                    return (
                        <HabitCard 
                            key={habit.id}
                            habit={habit}
                            activityData={activityData}
                            color={details.color}
                            icon={details.icon}
                            isCompletedToday={isCompletedToday}
                            onUpdate={refreshActivities}
                        />
                    )
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {isLoadingHabits && (
                <>
                  <Skeleton className="h-40 w-full bg-gray-200" />
                  <Skeleton className="h-40 w-full bg-gray-200" />
                  <Skeleton className="h-40 w-full bg-gray-200" />
                </>
              )}
              {habits?.map(habit => {
                  const details = getHabitDetails(habit.name);
                  const activityData = generateActivityData(habit.name);
                  const todayString = format(new Date(), 'yyyy-MM-dd');
                  const isCompletedToday = allActivities.some(a => a.habitName === habit.name && a.date === todayString && a.status === 'completed');

                  return (
                      <HabitCard 
                          key={habit.id}
                          habit={habit}
                          activityData={activityData}
                          color={details.color}
                          icon={details.icon}
                          isCompletedToday={isCompletedToday}
                          onUpdate={refreshActivities}
                      />
                  )
              })}
            </div>
          )}
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
