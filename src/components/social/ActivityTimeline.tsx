import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Filter, TrendingUp, Calendar, Activity, Target, Award, Zap, Book, Brain, Heart as HeartIcon, Utensils, User, Clock } from 'lucide-react';
import { useSocialPosts } from '@/hooks/useSocialPosts';
import CommentSection from './CommentSection';
import ExtendedReactions from './ExtendedReactions';
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
      fitness: { 
        icon: Activity, 
        color: "bg-gradient-to-r from-red-500 to-pink-500 text-white", 
        iconColor: "text-white" 
      },
      reading: { 
        icon: Book, 
        color: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white", 
        iconColor: "text-white" 
      },
      meditation: { 
        icon: Brain, 
        color: "bg-gradient-to-r from-purple-500 to-indigo-500 text-white", 
        iconColor: "text-white" 
      },
      spiritual: { 
        icon: Target, 
        color: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white", 
        iconColor: "text-white" 
      },
      health: { 
        icon: HeartIcon, 
        color: "bg-gradient-to-r from-cyan-500 to-blue-500 text-white", 
        iconColor: "text-white" 
      },
      nutrition: { 
        icon: Utensils, 
        color: "bg-gradient-to-r from-green-500 to-emerald-500 text-white", 
        iconColor: "text-white" 
      },
      personal: { 
        icon: User, 
        color: "bg-gradient-to-r from-slate-500 to-gray-500 text-white", 
        iconColor: "text-white" 
      },
    };

    const config = badgeConfig[habitType as keyof typeof badgeConfig] || badgeConfig.personal;
    const IconComponent = config.icon;

    return (
      <div className="flex items-center gap-2">
        <Badge className={`${config.color} border-0 text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5 hover-scale ${isMilestone ? 'ring-2 ring-yellow-400 ring-offset-2 animate-pulse' : ''}`}>
          <IconComponent size={12} className={config.iconColor} />
          {habitType.charAt(0).toUpperCase() + habitType.slice(1)}
          {streakCount && streakCount > 1 && (
            <span className="ml-1 bg-black/20 px-1.5 py-0.5 rounded-full text-xs font-bold">
              {streakCount}
            </span>
          )}
        </Badge>
        {isMilestone && (
          <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 border-0 text-xs font-bold px-2 py-1 animate-fade-in">
            <Award size={10} className="mr-1" />
            MILESTONE
          </Badge>
        )}
      </div>
    );
  };

  const handleReaction = async (postId: string, reactionType: 'like' | 'love' | 'fire' | 'clap' | 'star' | 'strong' | 'mind_blown' | 'celebrate') => {
    await toggleReaction(postId, reactionType);
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
    <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg hover-scale">
              <TrendingUp className="text-white" size={20} />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {showOnlyFriends ? 'Friends Activity' : 'Activity Timeline'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {showOnlyFriends ? 'Track your friends\' achievements and progress' : 'Real-time updates from your community'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-6 animate-fade-in">
        <div className="flex flex-wrap gap-2 w-full justify-center">
          <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-xl p-1.5 shadow-sm border border-gray-200 dark:border-gray-700">
            {(['all', 'milestones', 'streaks'] as const).map((filterType) => (
              <Button
                key={filterType}
                variant={filter === filterType ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter(filterType)}
                className={`text-xs px-3 py-2.5 h-9 rounded-lg font-medium transition-all duration-200 min-w-[80px] ${
                  filter === filterType 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {filterType === 'all' && <Filter size={12} className="mr-1" />}
                {filterType === 'milestones' && <Award size={12} className="mr-1" />}
                {filterType === 'streaks' && <Zap size={12} className="mr-1" />}
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full justify-center">
          <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-xl p-1.5 shadow-sm border border-gray-200 dark:border-gray-700">
            {(['today', 'week', 'month', 'all'] as const).map((timeFilterType) => (
              <Button
                key={timeFilterType}
                variant={timeFilter === timeFilterType ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeFilter(timeFilterType)}
                className={`text-xs px-3 py-2.5 h-9 rounded-lg font-medium transition-all duration-200 min-w-[70px] ${
                  timeFilter === timeFilterType 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Clock size={12} className="mr-1" />
                {timeFilterType.charAt(0).toUpperCase() + timeFilterType.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {Object.keys(groupedPosts).length === 0 ? (
          <div className="text-center py-12 animate-fade-in">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-gray-400" size={24} />
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No activities found</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              {showOnlyFriends ? 'Your friends haven\'t shared any activities yet. Encourage them to start their journey!' : 'Complete some habits to see them here and inspire others!'}
            </p>
          </div>
        ) : (
          Object.entries(groupedPosts).map(([dateKey, dayPosts]) => (
            <div key={dateKey} className="space-y-3">
              {/* Date Header */}
              <div className="flex items-center space-x-4 mb-4 animate-fade-in">
                <div className="relative">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-sm"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse opacity-50"></div>
                </div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">{dateKey}</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700"></div>
                <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-0 text-xs font-medium">
                  {dayPosts.length} {dayPosts.length === 1 ? 'activity' : 'activities'}
                </Badge>
              </div>

              {/* Posts for this date */}
              <div className="space-y-4 ml-3 sm:ml-5 mr-1 sm:mr-2">
                {dayPosts.map((post) => {
                  const displayName = post.profiles.display_name || post.profiles.email;
                  const avatarUrl = post.profiles.avatar_url;
                  const postDate = new Date(post.created_at);
                  const timeAgo = isToday(postDate) 
                    ? format(postDate, 'h:mm a')
                    : isYesterday(postDate)
                    ? 'Yesterday'
                    : format(postDate, 'MMM d');
                  
                  return (
                    <Card key={post.id} className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover-scale animate-fade-in rounded-xl overflow-hidden mx-1 sm:mx-0">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="relative">
                            <Avatar className="h-10 w-10 ring-2 ring-white dark:ring-gray-800 shadow-md">
                              <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={displayName} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold">
                                {displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-3">
                              <span className="font-semibold text-base text-gray-900 dark:text-white truncate">
                                {displayName}
                              </span>
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                <Clock size={12} className="mr-1" />
                                {timeAgo}
                              </span>
                            </div>
                            
                            <div className="mb-4 flex justify-center">
                              {getHabitBadge(post.habit_type, post.streak_count, post.is_milestone)}
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-4">
                              <p className="text-sm text-gray-900 dark:text-white leading-relaxed mb-2">{post.content}</p>
                              
                              {post.caption && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 italic">{post.caption}</p>
                              )}
                            </div>
                            
                            {/* Extended reactions */}
                            <div className="flex justify-start mb-4">
                              <ExtendedReactions
                                postId={post.id}
                                currentReaction={post.user_reaction}
                                reactionCounts={post.reaction_counts}
                                onReact={handleReaction}
                              />
                            </div>
                            
                            {/* Comments section */}
                            <CommentSection 
                              postId={post.id}
                              className="border-t border-gray-200 dark:border-gray-700 pt-4"
                            />
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