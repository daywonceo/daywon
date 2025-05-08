
type CalendarProps = {
  month: string;
};

const Calendar = ({ month }: CalendarProps) => {
  const daysOfWeek = ["SUN", "MON", "TUES", "WED", "THURS", "FRI", "SAT"];
  
  // Generate calendar data for March (31 days)
  const generateCalendarDays = () => {
    const days = [];
    for (let i = 1; i <= 31; i++) {
      days.push(i);
    }
    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="mb-12">
      <h2 className="text-center text-2xl font-bold text-green-800 mb-4">THIS MONTH'S OUTLOOK</h2>
      
      <div className="border border-black">
        {/* Calendar Header */}
        <div className="flex border-b border-black">
          {daysOfWeek.map((day) => (
            <div key={day} className="flex-1 text-center py-2 font-bold border-r last:border-r-0 border-black">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {/* First row starts with day 1 */}
          {Array.from({ length: 31 }).map((_, index) => {
            const day = index + 1;
            return (
              <div 
                key={`day-${day}`} 
                className="aspect-square border-r border-b border-black last:border-r-0 p-1 min-h-[50px]"
              >
                {day <= 31 && (
                  <div className="text-right text-sm font-bold">{day}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
