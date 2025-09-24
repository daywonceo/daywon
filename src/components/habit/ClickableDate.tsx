
import React, { useState } from 'react';
import DailyJournalModal from './DailyJournalModal';

interface ClickableDateProps {
  day: number;
  date: Date;
}

const ClickableDate: React.FC<ClickableDateProps> = ({
  day,
  date
}) => {
  const [isJournalOpen, setIsJournalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsJournalOpen(true)}
        className="text-center text-3xl sm:text-4xl font-bold text-green-800 hover:text-green-600 transition-colors cursor-pointer p-2 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20"
        title="Click to add journal entry"
      >
        {day}
      </button>
      
      <DailyJournalModal
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        date={date}
        day={day}
      />
    </>
  );
};

export default ClickableDate;
