import React from 'react';
import { Target, Users, Calendar, Clock, Trophy } from 'lucide-react';
import { format } from 'date-fns';

interface ChallengeCardStatsProps {
  targetValue: number | null;
  targetUnit: string | null;
  participantCount: number;
  maxParticipants: number | null;
  startDate: string;
  endDate: string;
  isTeamBased: boolean;
  maxTeamSize: number;
}

const ChallengeCardStats = ({
  targetValue,
  targetUnit,
  participantCount,
  maxParticipants,
  startDate,
  endDate,
  isTeamBased,
  maxTeamSize,
}: ChallengeCardStatsProps) => {
  return (
    <>
      {/* Challenge Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Target size={12} />
          <span className="text-xs">
            {targetValue} {targetUnit}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Users size={12} />
          <span className="text-xs">
            {participantCount}
            {maxParticipants && ` / ${maxParticipants}`}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Calendar size={12} />
          <span className="text-xs">{format(new Date(startDate), 'MMM d')}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Clock size={12} />
          <span className="text-xs">{format(new Date(endDate), 'MMM d')}</span>
        </div>
      </div>

      {/* Team-based indicator */}
      {isTeamBased && (
        <div className="flex items-center space-x-2 text-xs text-accent">
          <Trophy size={14} />
          <span>Team Challenge (max {maxTeamSize} per team)</span>
        </div>
      )}
    </>
  );
};

export default ChallengeCardStats;
