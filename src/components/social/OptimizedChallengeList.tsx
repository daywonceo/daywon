import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  AlertCircle,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { useOptimizedChallenges } from '@/hooks/useOptimizedChallenges';
import ChallengeCard from './ChallengeCard';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface OptimizedChallengeListProps {
  category?: string;
  onJoin: (challengeId: string) => void;
  onLeave: (challengeId: string) => void;
  onViewDetails: (challengeId: string) => void;
  onShare?: (challengeId: string) => void;
  onFavorite?: (challengeId: string) => void;
  onQuickProgress?: (challengeId: string) => void;
  onInviteFriends?: (challengeId: string) => void;
}

const OptimizedChallengeList: React.FC<OptimizedChallengeListProps> = ({
  category = 'all',
  onJoin,
  onLeave,
  onViewDetails,
  onShare,
  onFavorite,
  onQuickProgress,
  onInviteFriends,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'participant_count' | 'end_date'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    challenges,
    loading,
    error,
    hasMore,
    totalCount,
    loadMore,
    refreshChallenges,
    joinChallenge,
    leaveChallenge,
  } = useOptimizedChallenges({
    pageSize: 20,
    filter: debouncedSearch,
    sortBy,
    sortOrder,
    category,
  });

  // Intersection observer for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  useIntersectionObserver(
    loadMoreRef.current,
    useCallback(() => {
      if (!loading && hasMore) {
        loadMore();
      }
    }, [loading, hasMore, loadMore]),
    { threshold: 0.1 }
  );

  // Handle challenge actions with error handling
  const handleJoinChallenge = async (challengeId: string) => {
    try {
      await joinChallenge(challengeId);
    } catch (error) {
      console.error('Failed to join challenge:', error);
    }
  };

  const handleLeaveChallenge = async (challengeId: string) => {
    try {
      await leaveChallenge(challengeId);
    } catch (error) {
      console.error('Failed to leave challenge:', error);
    }
  };

  // Loading skeleton for initial load
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-64 w-full rounded-lg" />
      ))}
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshChallenges}
          className="ml-2"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );

  // Empty state component
  const EmptyState = () => (
    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <Search className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          No challenges found
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {debouncedSearch 
            ? `No challenges match "${debouncedSearch}"`
            : 'No challenges available in this category'
          }
        </p>
        {debouncedSearch && (
          <Button variant="outline" onClick={() => setSearchQuery('')}>
            Clear search
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search challenges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort Controls */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
              >
                <option value="created_at">Date Created</option>
                <option value="participant_count">Popularity</option>
                <option value="end_date">End Date</option>
              </select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={refreshChallenges}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Results Summary */}
          {!loading && (
            <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
              <span>
                {challenges.length} of {totalCount} challenges
                {debouncedSearch && ` matching "${debouncedSearch}"`}
              </span>
              {hasMore && (
                <Badge variant="secondary" className="text-xs">
                  Scroll for more
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error State */}
      {error && <ErrorState />}

      {/* Main Content */}
      {loading && challenges.length === 0 ? (
        <LoadingSkeleton />
      ) : challenges.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="relative">
          {/* Optimized Challenge Grid */}
          <div className="grid gap-4">
            {challenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onJoin={handleJoinChallenge}
                onLeave={handleLeaveChallenge}
                onViewDetails={onViewDetails}
                onShare={onShare}
                onFavorite={onFavorite}
                onQuickProgress={onQuickProgress}
                onInviteFriends={onInviteFriends}
                loading={loading}
              />
            ))}
          </div>

          {/* Infinite Scroll Trigger */}
          {hasMore && (
            <div 
              ref={loadMoreRef}
              className="flex items-center justify-center py-8"
            >
              {loading ? (
                <div className="flex items-center space-x-2 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading more challenges...</span>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={loadMore}
                  className="flex items-center space-x-2"
                >
                  <ChevronDown className="h-4 w-4" />
                  <span>Load More</span>
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OptimizedChallengeList;