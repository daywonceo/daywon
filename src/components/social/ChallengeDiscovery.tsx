import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Filter, Calendar, Users, Trophy, 
  TrendingUp, Clock, Target
} from 'lucide-react';
import ChallengeCard from './ChallengeCard';

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_value: number | null;
  target_unit: string | null;
  start_date: string;
  end_date: string;
  max_participants: number | null;
  is_team_based: boolean;
  max_team_size: number;
  status: string;
  participant_count?: number;
  user_participation?: {
    current_progress: number;
    status: string;
    team_id?: string;
  };
}

interface ChallengeDiscoveryProps {
  challenges: Challenge[];
  onJoin: (challengeId: string) => void;
  onLeave: (challengeId: string) => void;
  onViewDetails: (challengeId: string) => void;
  loading?: boolean;
}

const CHALLENGE_CATEGORIES = [
  { id: 'all', label: 'All', icon: '🎯' },
  { id: 'habit_streak', label: 'Habits', icon: '🔥' },
  { id: 'workout_count', label: 'Fitness', icon: '💪' },
  { id: 'steps', label: 'Steps', icon: '👟' },
  { id: 'reading', label: 'Reading', icon: '📚' },
  { id: 'meditation', label: 'Mindfulness', icon: '🧘‍♀️' },
];

const SORT_OPTIONS = [
  { id: 'popular', label: 'Most Popular', icon: TrendingUp },
  { id: 'recent', label: 'Newest', icon: Calendar },
  { id: 'ending_soon', label: 'Ending Soon', icon: Clock },
  { id: 'participants', label: 'Most Participants', icon: Users },
];

const ChallengeDiscovery = ({ 
  challenges, 
  onJoin, 
  onLeave, 
  onViewDetails, 
  loading 
}: ChallengeDiscoveryProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort challenges
  const filteredChallenges = challenges
    .filter(challenge => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        if (!challenge.title.toLowerCase().includes(searchLower) &&
            !challenge.description.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      
      // Category filter
      if (selectedCategory !== 'all' && challenge.challenge_type !== selectedCategory) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.participant_count || 0) - (a.participant_count || 0);
        case 'recent':
          return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
        case 'ending_soon':
          return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
        case 'participants':
          return (b.participant_count || 0) - (a.participant_count || 0);
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-4">
      {/* Search and Filter Header */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search challenges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
                {CHALLENGE_CATEGORIES.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="whitespace-nowrap h-8 text-xs"
                  >
                    <span className="mr-1">{category.icon}</span>
                    {category.label}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-8 px-3"
              >
                <Filter size={14} className="mr-1" />
                Sort
              </Button>
            </div>

            {/* Sort Options */}
            {showFilters && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SORT_OPTIONS.map((option) => (
                    <Button
                      key={option.id}
                      variant={sortBy === option.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortBy(option.id)}
                      className="h-8 text-xs justify-start"
                    >
                      <option.icon size={12} className="mr-1" />
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">Loading challenges...</p>
          </div>
        ) : filteredChallenges.length === 0 ? (
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
            <CardContent className="p-8 text-center">
              <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                No Challenges Found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery || selectedCategory !== 'all' 
                  ? "Try adjusting your search or filters"
                  : "No challenges available at the moment"
                }
              </p>
              {(searchQuery || selectedCategory !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredChallenges.length} challenge{filteredChallenges.length !== 1 ? 's' : ''} found
              </span>
              <Badge variant="outline" className="text-xs">
                {selectedCategory !== 'all' && 
                  CHALLENGE_CATEGORIES.find(c => c.id === selectedCategory)?.label
                }
              </Badge>
            </div>
            
            {filteredChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onJoin={onJoin}
                onLeave={onLeave}
                onViewDetails={onViewDetails}
                loading={loading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeDiscovery;