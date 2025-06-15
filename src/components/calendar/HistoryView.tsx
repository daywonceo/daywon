
import HistoricalMonthView from "./HistoricalMonthView";

interface HistoryViewProps {
  previousMonths: Array<{
    name: string;
    year: string;
    daysInMonth: number;
    firstDayOfWeek: number;
  }>;
  daysOfWeek: string[];
}

const HistoryView = ({ previousMonths, daysOfWeek }: HistoryViewProps) => {
  return (
    <div className="space-y-6">
      {previousMonths.map((monthData, monthIndex) => (
        <HistoricalMonthView 
          key={`month-${monthIndex}`}
          monthData={monthData}
          monthIndex={monthIndex}
          daysOfWeek={daysOfWeek}
        />
      ))}
    </div>
  );
};

export default HistoryView;
