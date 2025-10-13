import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Flame, 
  Star,
  Clock,
  Award
} from 'lucide-react';
import FriendsInChallenge from './challenges/FriendsInChallenge';

interface SocialProofIndicatorsProps {
  challenge: {
    id: string;
    participant_count?: number;
    friends_participating?: Array<{
      id: string;
      display_name: string;
      avatar_url?: string;
    }>;
    is_trending?: boolean;
    popularity_score?: number;
    time_left_days?: number;
    completion_rate?: number;
    created_at?: string;
  };
  className?: string;
}

const SocialProofIndicators: React.FC<SocialProofIndicatorsProps> = ({
  challenge,
  className = "",
}) => {
  const {
    participant_count = 0,
    is_trending = false,
    popularity_score = 0,
    time_left_days = 0,
    completion_rate = 0,
    created_at,
  } = challenge;

  const renderPopularityIndicator = () => {
    if (participant_count < 10) return null;

    let label = '';
    let icon = Star;
    let color = '';
    
    if (participant_count > 100) {
      label = 'Top 5% most popular';
      icon = Award;
      color = 'text-status-warning';
    } else if (participant_count > 50) {
      label = 'Top 10% most popular';
      icon = TrendingUp;
      color = 'text-primary';
    } else if (participant_count > 20) {
      label = 'Popular';
      icon = Flame;
      color = 'text-status-warning';
    } else {
      label = 'Growing';
      icon = TrendingUp;
      color = 'text-status-success';
    }

    const Icon = icon;

    return (
      <div className={`flex items-center space-x-1 ${color}`}>
        <Icon size={12} />
        <span className="text-xs font-medium">{label}</span>
      </div>
    );
  };

  const renderTrendingIndicator = () => {
    if (!is_trending) return null;

    return (
      <div className="flex items-center space-x-1 text-primary">
        <TrendingUp size={12} />
        <span className="text-xs font-medium">Trending</span>
      </div>
    );
  };

  const renderRecentJoins = () => {
    const createdDate = created_at ? new Date(created_at) : null;
    const now = new Date();
    const daysSinceCreated = createdDate 
      ? Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    if (daysSinceCreated !== null && daysSinceCreated <= 7 && participant_count >= 10) {
      return (
        <div className="flex items-center space-x-1 text-status-success">
          <Users size={12} />
          <span className="text-xs font-medium">
            {participant_count} joined this week
          </span>
        </div>
      );
    }
    return null;
  };

  const renderUrgencyIndicator = () => {
    if (!time_left_days || time_left_days > 7) return null;

    const urgencyColor = time_left_days <= 2 ? 'text-status-error' : 'text-status-warning';
    const urgencyText = time_left_days <= 1 ? 'Ending soon!' : `${time_left_days} days left`;

    return (
      <div className={`flex items-center space-x-1 ${urgencyColor}`}>
        <Clock size={12} />
        <span className="text-xs font-medium">{urgencyText}</span>
      </div>
    );
  };

  const renderCompletionRate = () => {
    if (completion_rate === 0 || completion_rate > 90) return null;

    return (
      <div className="flex items-center space-x-1 text-accent">
        <Star size={12} />
        <span className="text-xs">{completion_rate}% complete rate</span>
      </div>
    );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Friends Participating */}
      <FriendsInChallenge challengeId={challenge.id} maxDisplay={3} />

      {/* Other Indicators */}
      <div className="flex flex-wrap items-center gap-2">
        {renderTrendingIndicator()}
        {renderPopularityIndicator()}
        {renderRecentJoins()}
        {renderUrgencyIndicator()}
        {renderCompletionRate()}
      </div>
    </div>
  );
};

export default SocialProofIndicators;