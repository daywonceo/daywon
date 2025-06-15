import React from "react";
import { Calendar } from "@/components/ui/calendar";

interface CalendarViewProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

const CalendarView = ({ date, setDate }: CalendarViewProps) => {
  return (
    <div className="flex justify-center">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border border-green-200 dark:border-green-800 p-0"
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4 w-full",
          caption: "flex justify-center pt-2 relative items-center text-green-800 dark:text-green-200",
          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-green-800 dark:text-green-200",
          day_selected: "bg-green-600 text-primary-foreground hover:bg-green-600/90 focus:bg-green-600",
          day_today: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200",
        }}
      />
    </div>
  );
};

export default CalendarView;
