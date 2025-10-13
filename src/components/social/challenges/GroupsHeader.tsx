import React from 'react';
import { Trophy } from 'lucide-react';

const GroupsHeader = () => {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
        <Trophy className="text-primary" size={20} />
      </div>
      <h2 className="text-xl font-bold mb-2">
        Group Challenges
      </h2>
      <p className="text-sm text-muted-foreground">
        Join challenges, form teams, and achieve goals together
      </p>
    </div>
  );
};

export default GroupsHeader;
