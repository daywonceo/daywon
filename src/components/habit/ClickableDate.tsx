
import React from 'react';

interface ClickableDateProps {
  day: number;
  date: Date;
}

const ClickableDate: React.FC<ClickableDateProps> = ({
  day
}) => {
  return (
    <div className="text-center text-3xl sm:text-4xl font-bold text-green-800">
      {day}
    </div>
  );
};

export default ClickableDate;
