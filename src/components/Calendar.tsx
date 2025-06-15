
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format, subMonths } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import CalendarHeader from "./calendar/CalendarHeader";
import CalendarView from "./calendar/CalendarView";
import ListView from "./calendar/ListView";
import HistoryView from "./calendar/HistoryView";

type CalendarProps = {
  month: string;
};

const Calendar = ({ month }: CalendarProps) => {
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

  // List view activities
  const listActivities = [
    { day: 1, text: "WENT OUT TO DINNER WITH FRIENDS" },
    { day: 2, text: "HIT A PR ON BENCH IN THE GYM" },
    { day: 3, text: "PLAYED IN A NEW SOCCER LEAGUE AND WON" }
  ];

  return (
    <Card className="mb-8 sm:mb-12 border-green-200 dark:border-green-800 shadow-md">
      <CardHeader className="pb-2 px-3 sm:px-6">
        <CalendarHeader 
          title="THIS MONTH'S OUTLOOK"
          activeTab={activeTab}
          currentView={currentView}
          setActiveTab={setActiveTab}
          setCurrentView={setCurrentView}
        />
      </CardHeader>
      
      <CardContent className="px-2 sm:px-6">
        {activeTab === "current" ? (
          // Current month view
          currentView === 'calendar' ? (
            <CalendarView 
              daysOfWeek={daysOfWeek}
              compactDays={compactDays}
              calendarDays={calendarDays}
              onDayClick={handleDayClick}
            />
          ) : (
            // List View
            <ListView activities={listActivities} />
          )
        ) : (
          // Historical 6 months view
          <HistoryView 
            previousMonths={previousMonths}
            daysOfWeek={daysOfWeek}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default Calendar;
