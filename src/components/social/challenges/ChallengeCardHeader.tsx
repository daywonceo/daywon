import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy, Target, Star } from 'lucide-react';

interface ChallengeCardHeaderProps {
  type: string;
  title: string;
  status: 'upcoming' | 'active' | 'completed' | 'draft';
}

const getChallengeTypeIcon = (type: string) => {
  switch (type) {
    case 'habit_streak': return <Flame size={20} className="text-status-warning" />;
    case 'workout_count': return <Trophy size={20} className="text-accent" />;
    case 'steps': return <Target size={20} className="text-status-success" />;
    default: return <Star size={20} className="text-primary" />;
  }
};

const getChallengeTypeLabel = (type: string) => {
  switch (type) {
    case 'habit_streak': return 'Habit Streak';
    case 'workout_count': return 'Workout Count';
    case 'steps': return 'Steps Challenge';
    default: return 'Custom Challenge';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'upcoming': return 'bg-accent/10 text-accent border-accent/20';
    case 'active': return 'bg-status-success/10 text-status-success border-status-success/20';
    case 'completed': return 'bg-muted text-muted-foreground border-border';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'upcoming': return 'Upcoming';
    case 'active': return 'Active';
    case 'completed': return 'Completed';
    default: return 'Draft';
  }
};

const ChallengeCardHeader = ({ type, title, status }: ChallengeCardHeaderProps) => {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center space-x-2">
        <div className="flex items-center justify-center">
          {getChallengeTypeIcon(type)}
        </div>
        <div>
          <h3 className="text-lg font-semibold line-clamp-1">{title}</h3>
          <p className="text-sm text-muted-foreground">
            {getChallengeTypeLabel(type)}
          </p>
        </div>
      </div>
      
      <Badge className={`${getStatusColor(status)} border text-xs`}>
        {getStatusText(status)}
      </Badge>
    </div>
  );
};

export default ChallengeCardHeader;
