import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  TrendingUp, 
  Users, 
  Flame, 
  Star,
  UserPlus,
  Clock
} from 'lucide-react';

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
  };
  className?: string;
}

const SocialProofIndicators: React.FC<SocialProofIndicatorsProps> = ({
  challenge,
  className = "",
}) => {
  const {
    participant_count = 0,
    friends_participating = [],
    is_trending = false,
    popularity_score = 0,
    time_left_days = 0,
    completion_rate = 0,
  } = challenge;

  const renderFriendsIndicator = () => {
    if (friends_participating.length === 0) return null;

    const displayedFriends = friends_participating.slice(0, 3);
    const remainingCount = friends_participating.length - 3;

    return (
      <div className="flex items-center space-x-1">
        <UserPlus size={12} className="text-blue-500" />
        <div className="flex -space-x-1">
          {displayedFriends.map((friend) => (
            <Avatar key={friend.id} className="w-4 h-4 border border-white dark:border-gray-800">
              <AvatarImage src={friend.avatar_url} />
              <AvatarFallback className="text-xs">
                {friend.display_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
          ))}
          {remainingCount > 0 && (
            <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900 border border-white dark:border-gray-800 flex items-center justify-center">
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                +{remainingCount}
              </span>
            </div>
          )}
        </div>
        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
          {friends_participating.length === 1 
            ? `${friends_participating[0].display_name} joined`
            : `${friends_participating.length} friends joined`
          }
        </span>
      </div>
    );
  };

  const renderPopularityIndicator = () => {
    if (popularity_score < 10) return null;

    let label = '';
    let color = '';
    
    if (popularity_score >= 50) {
      label = 'Hot';
      color = 'text-red-500';
    } else if (popularity_score >= 25) {
      label = 'Popular';
      color = 'text-orange-500';
    } else {
      label = 'Growing';
      color = 'text-green-500';
    }

    return (
      <div className={`flex items-center space-x-1 ${color}`}>
        <Flame size={12} />
        <span className="text-xs font-medium">{label}</span>
      </div>
    );
  };

  const renderTrendingIndicator = () => {
    if (!is_trending) return null;

    return (
      <div className="flex items-center space-x-1 text-purple-500">
        <TrendingUp size={12} />
        <span className="text-xs font-medium">Trending</span>
      </div>
    );
  };

  const renderParticipantCount = () => {
    if (participant_count === 0) return null;

    return (
      <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
        <Users size={12} />
        <span className="text-xs">
          {participant_count} participant{participant_count !== 1 ? 's' : ''}
        </span>
      </div>
    );
  };

  const renderUrgencyIndicator = () => {
    if (time_left_days > 7) return null;

    const urgencyColor = time_left_days <= 2 ? 'text-red-500' : 'text-orange-500';
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
      <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400">
        <Star size={12} />
        <span className="text-xs">{completion_rate}% complete rate</span>
      </div>
    );
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {renderFriendsIndicator()}
      {renderTrendingIndicator()}
      {renderPopularityIndicator()}
      {renderParticipantCount()}
      {renderUrgencyIndicator()}
      {renderCompletionRate()}
    </div>
  );
};

export default SocialProofIndicators;