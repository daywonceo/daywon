import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Star,
  UserPlus,
  Trophy
} from 'lucide-react';
import { useChallengeRecommendations } from '@/hooks/useChallengeRecommendations';
import { formatDistanceToNow } from 'date-fns';

interface ChallengeRecommendationsProps {
  onJoinChallenge: (challengeId: string) => void;
  onViewDetails: (challengeId: string) => void;
}

const ChallengeRecommendations: React.FC<ChallengeRecommendationsProps> = ({
  onJoinChallenge,
  onViewDetails,
}) => {
  const { recommendations, loading } = useChallengeRecommendations();

  if (loading) {
    return (
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Star className="text-yellow-500" size={20} />
            <h3 className="font-semibold">Recommended for You</h3>
          </div>
          <div className="grid gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <CardContent className="p-4 text-center">
          <Star className="mx-auto text-gray-400 mb-2" size={24} />
          <p className="text-sm text-gray-500">No recommendations available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Star className="text-yellow-500" size={20} />
            <h3 className="font-semibold">Recommended for You</h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            {recommendations.length} suggestions
          </Badge>
        </div>

        <div className="grid gap-3">
          {recommendations.map((challenge) => (
            <div
              key={challenge.id}
              className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-colors group cursor-pointer"
              onClick={() => onViewDetails(challenge.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-sm truncate group-hover:text-primary">
                      {challenge.title}
                    </h4>
                    {challenge.match_score > 70 && (
                      <Badge variant="default" className="text-xs px-1.5 py-0.5">
                        Great Match
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                    {challenge.description}
                  </p>

                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Users size={12} />
                      <span>{challenge.participant_count}</span>
                    </div>
                    
                    {challenge.friends_participating > 0 && (
                      <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                        <UserPlus size={12} />
                        <span>{challenge.friends_participating} friends</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1">
                      <Clock size={12} />
                      <span>Ends {formatDistanceToNow(new Date(challenge.end_date), { addSuffix: true })}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-1">
                      <Avatar className="w-4 h-4">
                        <AvatarFallback className="text-xs">
                          {challenge.creator_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-gray-500">by {challenge.creator_name}</span>
                    </div>

                    {challenge.popularity_score > 10 && (
                      <div className="flex items-center space-x-1 text-orange-500">
                        <TrendingUp size={12} />
                        <span className="text-xs">Trending</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-2 text-xs px-2 py-1 h-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    onJoinChallenge(challenge.id);
                  }}
                >
                  Join
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChallengeRecommendations;