
import React from "react";

interface HabitGridHeaderProps {
  habits: string[];
}

const HabitGridHeader: React.FC<HabitGridHeaderProps> = ({ habits }) => (
  <>
    {/* Empty grid cell for day number */}
    <div />
    {/* Empty grid cell for activity description */}
    <div />
    {/* Habit headers, aligned with habit columns */}
    {habits.map((habit) => (
      <div key={habit} className="text-center">
        <span
          className="truncate text-xs sm:text-sm px-0.5 leading-snug font-semibold text-green-800/90"
          title={habit}
        >
          {habit}
        </span>
      </div>
    ))}
  </>
);

export default HabitGridHeader;
