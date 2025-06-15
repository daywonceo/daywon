
import { Calendar } from "@/components/ui/calendar";
import { useIsMobile } from "@/hooks/use-mobile";
import { subMonths } from "date-fns";

const HistoryView = () => {
  const isMobile = useIsMobile();
  const today = new Date();

  // For mobile, show fewer months to save space
  const numberOfMonths = isMobile ? 3 : 6;
  const lastMonthInView = subMonths(today, 1);
  const firstMonthInView = subMonths(today, numberOfMonths);

  return (
    <div className="flex justify-center">
      <Calendar
        numberOfMonths={numberOfMonths}
        month={firstMonthInView}
        toMonth={lastMonthInView}
        pagedNavigation
        className="p-0"
        classNames={{
          nav_button: "hidden", // Hide nav buttons for a read-only feel
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 flex-wrap justify-center",
          month: "space-y-4",
          caption_label: "text-sm font-medium text-green-800 dark:text-green-200",
          head_cell: "text-green-700 dark:text-green-300 rounded-md w-8 font-normal text-[0.8rem]",
          day: "h-8 w-8 p-0 font-normal",
          day_today: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-full",
          day_disabled: "text-gray-400 opacity-50",
        }}
        showOutsideDays={true}
        disabled // Disables date selection, making it read-only
      />
    </div>
  );
};

export default HistoryView;
