
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
    {habits.map((habit, i) => (
      <div
        key={habit}
        className="flex items-end justify-center h-full"
        style={{ minHeight: 24 }}
      >
        <span
          className="truncate max-w-[90px] sm:max-w-[120px] text-xs sm:text-base px-0.5 leading-snug font-bold text-green-800 text-center"
          title={habit}
          style={{
            wordBreak: "keep-all",
            whiteSpace: "nowrap",
          }}
        >
          {habit}
        </span>
      </div>
    ))}
  </>
);

export default HabitGridHeader;
