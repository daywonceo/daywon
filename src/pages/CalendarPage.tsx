
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CalendarView from "@/components/calendar/CalendarView";
import ListView from "@/components/calendar/ListView";
import HistoryView from "@/components/calendar/HistoryView";
import HabitCalendarView from "@/components/calendar/HabitCalendarView";
import { useTopHabits } from "@/hooks/useTopHabits";

const CalendarPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { topHabits } = useTopHabits();
  
  // Use top 3 habits if available, otherwise fall back to defaults
  const userHabits = topHabits && topHabits.length === 3
    ? topHabits
    : ["WORKOUT", "DEVOTIONS", "READ"];

  const handleDateClick = (selectedDate: Date) => {
    console.log("Date clicked:", selectedDate);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-white to-blue-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Habit Calendar
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your progress over time
          </p>
        </div>

        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="habits">Habit View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            <CalendarView 
              date={date}
              setDate={setDate}
              onDateClick={handleDateClick}
              timePeriod="current"
            />
          </TabsContent>

          <TabsContent value="habits" className="space-y-6">
            <HabitCalendarView userHabits={userHabits} />
          </TabsContent>

          <TabsContent value="list" className="space-y-6">
            <ListView />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <HistoryView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CalendarPage;
