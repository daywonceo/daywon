
import React from 'react';
import { cn } from '@/lib/utils';

type Color = 'green' | 'purple' | 'red' | 'orange' | 'blue';

interface HabitActivityGraphProps {
  activityData: boolean[]; // array of booleans for past N days
  color: Color;
}

const colorMap: Record<Color, { active: string; inactive: string }> = {
  green: { active: 'bg-success', inactive: 'bg-success/20' },
  purple: { active: 'bg-accent', inactive: 'bg-accent/20' },
  red: { active: 'bg-destructive', inactive: 'bg-destructive/20' },
  orange: { active: 'bg-warning', inactive: 'bg-warning/20' },
  blue: { active: 'bg-primary', inactive: 'bg-primary/20' },
};

const TOTAL_DAYS = 180; // approx 6 months

const HabitActivityGraph = ({ activityData, color }: HabitActivityGraphProps) => {
  const days = Array.from({ length: TOTAL_DAYS }, (_, i) => {
    // We want to show recent days on the right.
    const dayIndex = TOTAL_DAYS - 1 - i;
    return activityData[dayIndex] || false;
  }).reverse(); // to match the screenshot order

  return (
    <div className="grid grid-flow-col grid-rows-7 gap-1 sm:gap-1.5">
      {days.map((isActive, index) => (
        <div
          key={index}
          className={cn(
            'w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm',
            isActive ? colorMap[color].active : colorMap[color].inactive
          )}
        />
      ))}
    </div>
  );
};

export default HabitActivityGraph;
