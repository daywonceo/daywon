import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Filter, TrendingUp, Calendar, Users } from 'lucide-react';
import { useSocialPosts } from '@/hooks/useSocialPosts';
import { useFriends } from '@/hooks/useFriends';
import { formatDistanceToNow, isToday, isYesterday, format } from 'date-fns';

interface TimelineViewProps {
  showOnlyFriends?: boolean;
}

const ActivityTimeline = ({ showOnlyFriends = false }: TimelineViewProps) => {
  const [filter, setFilter] = useState<'all' | 'milestones' | 'streaks'>('all');
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  
  const { posts, loading, toggleReaction } = useSocialPosts();
  const { friends } = useFriends();

  // Filter posts based on friends and other criteria
  const filteredPosts = posts.filter(post => {
    // Filter by friends if requested
    if (showOnlyFriends) {
      const isFriend = friends.some(friend => friend.id === post.user_id);
      if (!isFriend) return false;
    }

    // Filter by content type
    if (filter === 'milestones' && !post.is_milestone) return false;
    if (filter === 'streaks' && (!post.streak_count || post.streak_count < 2)) return false;

    // Filter by time
    const postDate = new Date(post.created_at);
    if (timeFilter === 'today' && !isToday(postDate)) return false;
    if (timeFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      if (postDate < weekAgo) return false;
    }
    if (timeFilter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      if (postDate < monthAgo) return false;
    }

    return true;
  });

  // Group posts by date for timeline display
  const groupedPosts = filteredPosts.reduce((groups, post) => {
    const date = new Date(post.created_at);
    let dateKey: string;
    
    if (isToday(date)) {
      dateKey = 'Today';
    } else if (isYesterday(date)) {
      dateKey = 'Yesterday';
    } else {
      dateKey = format(date, 'MMMM d, yyyy');
    }

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(post);
    return groups;
  }, {} as Record<string, typeof posts>);

  const getHabitBadge = (habitType?: string, streakCount?: number, isMilestone?: boolean) => {
    if (!habitType) return null;
    
    const badgeConfig = {
      fitness: { emoji: "💪", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
      reading: { emoji: "📚", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
      meditation: { emoji: "🧘‍♀️", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
      spiritual: { emoji: "🙏", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
      health: { emoji: "💧", color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300" },
      nutrition: { emoji: "🥗", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
      personal: { emoji: "⭐", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300" },
    };

    const config = badgeConfig[habitType as keyof typeof badgeConfig] || badgeConfig.personal;

    return (
      <Badge className={`${config.color} border-0 text-xs font-medium ${isMilestone ? 'ring-2 ring-yellow-400 ring-offset-1' : ''}`}>
        {config.emoji} {habitType}
        {streakCount && streakCount > 1 && (
          <span className="ml-1 font-bold">{isMilestone ? '🏆' : '🔥'}{streakCount}</span>
        )}
      </Badge>
    );
  };

  const handleReaction = (postId: string, reactionType: 'like' | 'love' | 'fire' | 'clap' | 'star') => {
    toggleReaction(postId, reactionType);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="text-sm text-gray-500 mt-2">Loading timeline...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <TrendingUp className="text-blue-600 dark:text-blue-400" size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {showOnlyFriends ? 'Friends Activity' : 'Activity Timeline'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {showOnlyFriends ? 'See what your friends are achieving' : 'Latest habit completions and milestones'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(['all', 'milestones', 'streaks'] as const).map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter(filterType)}
              className="text-xs px-3 py-1 h-7"
            >
              {filterType === 'all' && <Filter size={12} className="mr-1" />}
              {filterType === 'milestones' && '🏆'}
              {filterType === 'streaks' && '🔥'}
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </Button>
          ))}
        </div>

        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(['today', 'week', 'month', 'all'] as const).map((timeFilterType) => (
            <Button
              key={timeFilterType}
              variant={timeFilter === timeFilterType ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeFilter(timeFilterType)}
              className="text-xs px-3 py-1 h-7"
            >
              <Calendar size={12} className="mr-1" />
              {timeFilterType.charAt(0).toUpperCase() + timeFilterType.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {Object.keys(groupedPosts).length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">📅</div>
            <p className="text-sm text-gray-500">No activities found</p>
            <p className="text-xs text-gray-400 mt-1">
              {showOnlyFriends ? 'Your friends haven\'t shared any activities yet' : 'Complete some habits to see them here!'}
            </p>
          </div>
        ) : (
          Object.entries(groupedPosts).map(([dateKey, dayPosts]) => (
            <div key={dateKey} className="space-y-3">
              {/* Date Header */}
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{dateKey}</h3>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{dayPosts.length} activities</span>
              </div>

              {/* Posts for this date */}
              <div className="space-y-3 ml-5">
                {dayPosts.map((post) => {
                  const displayName = post.profiles.display_name || post.profiles.email;
                  const avatarUrl = post.profiles.avatar_url;
                  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
                  
                  return (
                    <Card key={post.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={displayName} />
                            <AvatarFallback className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs font-semibold">
                              {displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                {displayName}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{timeAgo}</span>
                            </div>
                            
                            <div className="mb-2">
                              {getHabitBadge(post.habit_type, post.streak_count, post.is_milestone)}
                            </div>
                            
                            <p className="text-sm text-gray-900 dark:text-white mb-2">{post.content}</p>
                            
                            {post.caption && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{post.caption}</p>
                            )}
                            
                            {/* Quick reactions */}
                            <div className="flex items-center space-x-2">
                              {(['like', 'fire'] as const).map((reactionType) => {
                                const isSelected = post.user_reaction === reactionType;
                                const count = post.reaction_counts?.[reactionType] || 0;
                                
                                return (
                                  <Button
                                    key={reactionType}
                                    variant="ghost"
                                    size="sm"
                                    className={`h-6 px-2 text-xs ${isSelected ? 'text-red-600' : 'text-gray-500'}`}
                                    onClick={() => handleReaction(post.id, reactionType)}
                                  >
                                    {reactionType === 'like' ? '👍' : '🔥'}
                                    {count > 0 && <span className="ml-1">{count}</span>}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityTimeline;