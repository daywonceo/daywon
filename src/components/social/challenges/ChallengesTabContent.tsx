import React from 'react';
import ChallengeRecommendations from '../ChallengeRecommendations';
import ChallengeAchievements from '../ChallengeAchievements';
import OptimizedChallengeList from '../OptimizedChallengeList';

interface ChallengesTabContentProps {
  onJoin: (id: string) => Promise<void>;
  onLeave: (id: string) => Promise<void>;
  onViewDetails: (id: string) => void;
  onShare: (id: string) => void;
  onFavorite: (id: string) => void;
  onQuickProgress: (id: string) => void;
}

const ChallengesTabContent = ({
  onJoin,
  onLeave,
  onViewDetails,
  onShare,
  onFavorite,
  onQuickProgress,
}: ChallengesTabContentProps) => {
  return (
    <div className="space-y-4">
      {/* Recommendations and Achievements */}
      <div className="grid md:grid-cols-2 gap-4">
        <ChallengeRecommendations
          onJoinChallenge={onJoin}
          onViewDetails={onViewDetails}
        />
        <ChallengeAchievements />
      </div>

      {/* Optimized Challenge List */}
      <OptimizedChallengeList
        category="all"
        onJoin={onJoin}
        onLeave={onLeave}
        onViewDetails={onViewDetails}
        onShare={onShare}
        onFavorite={onFavorite}
        onQuickProgress={onQuickProgress}
      />
    </div>
  );
};

export default ChallengesTabContent;
