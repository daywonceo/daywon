
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
      <div key={habit} className="text-center flex items-end justify-center min-h-[1.5rem]">
        <span
          className="text-xs sm:text-sm px-0.5 leading-tight font-semibold text-primary break-words hyphens-auto"
          title={habit}
        >
          {habit}
        </span>
      </div>
    ))}
  </>
);

export default HabitGridHeader;
