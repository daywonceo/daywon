
import { useIsMobile } from "@/hooks/use-mobile";
import DayCell from "./DayCell";

interface CalendarViewProps {
  daysOfWeek: string[];
  compactDays: number[];
  calendarDays: number[];
  onDayClick: (day: number) => void;
}

const CalendarView = ({ 
  daysOfWeek, 
  compactDays, 
  calendarDays, 
  onDayClick 
}: CalendarViewProps) => {
  const isMobile = useIsMobile();
  const today = new Date().getDate();

  return (
    <div className="border border-green-200 dark:border-green-800 rounded-lg overflow-hidden">
      {/* Calendar Header */}
      <div className="flex bg-green-50 dark:bg-green-900">
        {daysOfWeek.map((day) => (
          <div key={day} className="flex-1 text-center py-1 sm:py-2 font-bold text-green-700 dark:text-green-300 text-xs sm:text-sm">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid - Compact View for Mobile */}
      <div className="grid grid-cols-7">
        {isMobile ? (
          // Compact view
          <>
            {/* First row - empty cells */}
            {Array.from({ length: new Date(2023, 2, compactDays[0]).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square border-r border-b border-green-100 dark:border-green-800 last:border-r-0"></div>
            ))}
            
            {/* Day cells */}
            {compactDays.map((day) => (
              <DayCell 
                key={`day-${day}`} 
                day={day} 
                isToday={day === today}
                isCompact={true}
              />
            ))}
          </>
        ) : (
          // Full calendar view for desktop
          Array.from({ length: 31 }).map((_, index) => {
            const day = index + 1;
            return (
              <DayCell 
                key={`day-${day}`} 
                day={day} 
                isToday={day === today}
                onDayClick={onDayClick}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default CalendarView;
