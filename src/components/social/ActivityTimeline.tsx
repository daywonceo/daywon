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
        color: "bg-accent text-accent-foreground", 
        iconColor: "text-accent-foreground" 
      },
      reading: { 
        icon: Book, 
        color: "bg-primary text-primary-foreground", 
        iconColor: "text-primary-foreground" 
      },
      meditation: { 
        icon: Brain, 
        color: "bg-muted text-muted-foreground", 
        iconColor: "text-muted-foreground" 
      },
      spiritual: { 
        icon: Target, 
        color: "bg-secondary text-secondary-foreground", 
        iconColor: "text-secondary-foreground" 
      },
      health: { 
        icon: HeartIcon, 
        color: "bg-success text-success-foreground", 
        iconColor: "text-success-foreground" 
      },
      nutrition: { 
        icon: Utensils, 
        color: "bg-success text-success-foreground", 
        iconColor: "text-success-foreground" 
      },
      personal: { 
        icon: User, 
        color: "bg-neutral text-neutral-foreground", 
        iconColor: "text-neutral-foreground" 
      },
    };

    const config = badgeConfig[habitType as keyof typeof badgeConfig] || badgeConfig.personal;
    const IconComponent = config.icon;

    return (
      <div className="flex items-center gap-2">
        <Badge className={`${config.color} border-0 text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5 transition-all duration-200 ${isMilestone ? 'ring-2 ring-accent ring-offset-2 animate-pulse' : ''}`}>
          <IconComponent size={12} className={config.iconColor} />
          {habitType.charAt(0).toUpperCase() + habitType.slice(1)}
          {streakCount && streakCount > 1 && (
            <span className="ml-1 bg-black/20 px-1.5 py-0.5 rounded-full text-xs font-bold">
              {streakCount}
            </span>
          )}
        </Badge>
        {isMilestone && (
          <Badge className="bg-accent text-accent-foreground border-0 text-xs font-bold px-2 py-1 animate-fade-in">
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-muted-foreground mt-2">Loading timeline...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl shadow-lg transition-all duration-200">
              <TrendingUp className="text-primary-foreground" size={20} />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background animate-pulse"></div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-1">
              {showOnlyFriends ? 'Friends Activity' : 'Activity Timeline'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {showOnlyFriends ? 'Track your friends\' achievements and progress' : 'Real-time updates from your community'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-6 animate-fade-in">
        <div className="flex flex-wrap gap-2 w-full justify-center">
          <div className="flex gap-1 bg-warm/30 rounded-xl p-1.5 shadow-sm border border-accent/20">
            {(['all', 'milestones', 'streaks'] as const).map((filterType) => (
              <Button
                key={filterType}
                variant={filter === filterType ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter(filterType)}
                className={`text-xs px-3 py-2.5 h-9 rounded-lg font-medium transition-all duration-200 min-w-[80px] ${
                  filter === filterType 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'hover:bg-accent/50'
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
          <div className="flex gap-1 bg-warm/30 rounded-xl p-1.5 shadow-sm border border-accent/20">
            {(['today', 'week', 'month', 'all'] as const).map((timeFilterType) => (
              <Button
                key={timeFilterType}
                variant={timeFilter === timeFilterType ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeFilter(timeFilterType)}
                className={`text-xs px-3 py-2.5 h-9 rounded-lg font-medium transition-all duration-200 min-w-[70px] ${
                  timeFilter === timeFilterType 
                    ? 'bg-secondary text-secondary-foreground shadow-md' 
                    : 'hover:bg-accent/50'
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
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-muted-foreground" size={24} />
            </div>
            <p className="text-lg font-semibold text-foreground mb-2">No activities found</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {showOnlyFriends ? 'Your friends haven\'t shared any activities yet. Encourage them to start their journey!' : 'Complete some habits to see them here and inspire others!'}
            </p>
          </div>
        ) : (
          Object.entries(groupedPosts).map(([dateKey, dayPosts]) => (
            <div key={dateKey} className="space-y-3">
              {/* Date Header */}
              <div className="flex items-center space-x-4 mb-4 animate-fade-in">
                <div className="relative">
                  <div className="w-3 h-3 bg-primary rounded-full shadow-sm"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-primary rounded-full animate-pulse opacity-50"></div>
                </div>
                <h3 className="font-bold text-base text-foreground">{dateKey}</h3>
                <div className="flex-1 h-px bg-border"></div>
                <Badge className="bg-muted/50 text-muted-foreground border-0 text-xs font-medium">
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
                    <Card key={post.id} className="bg-background/95 backdrop-blur-md border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in rounded-xl overflow-hidden mx-1 sm:mx-0">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-start space-x-3 sm:space-x-4">
                          <div className="relative flex-shrink-0">
                            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-background shadow-md">
                              <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={displayName} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm font-bold">
                                {displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-success rounded-full border-2 border-background"></div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 sm:space-x-3 mb-3">
                              <span className="font-semibold text-sm sm:text-base text-foreground truncate">
                                {displayName}
                              </span>
                              <div className="w-1 h-1 bg-muted-foreground rounded-full flex-shrink-0"></div>
                              <span className="text-xs sm:text-sm text-muted-foreground flex items-center flex-shrink-0">
                                <Clock size={10} className="mr-1 sm:mr-1" />
                                {timeAgo}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Badge section - full width on mobile */}
                        <div className="mt-3 mb-4 -mx-1 sm:mx-0">
                          <div className="flex justify-center sm:justify-start px-1 sm:px-0">
                            {getHabitBadge(post.habit_type, post.streak_count, post.is_milestone)}
                          </div>
                        </div>
                        
                        <div className="bg-muted/30 rounded-lg p-3 sm:p-4 mb-4">
                          <p className="text-sm text-foreground leading-relaxed mb-2">{post.content}</p>
                          
                          {post.caption && (
                            <p className="text-sm text-muted-foreground italic">{post.caption}</p>
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
                          className="border-t border-border pt-4"
                        />
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