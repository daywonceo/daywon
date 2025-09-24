
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
        className="text-center text-lg sm:text-xl font-bold text-foreground hover:text-primary transition-all duration-200 cursor-pointer p-2 rounded-lg hover:bg-primary/10 active:scale-95"
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
