import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Send, Filter, ThumbsUp, Flame, Star } from "lucide-react";
import { useSocialPosts } from "@/hooks/useSocialPosts";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface MainFeedProps {}

const MainFeed = ({}: MainFeedProps) => {
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [filter, setFilter] = useState<string>('all');

  const { posts, loading, toggleReaction } = useSocialPosts();

  const toggleComments = (postId: string) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleComment = (postId: string) => {
    const comment = newComment[postId];
    if (comment && comment.trim()) {
      toast.success("Comment added!");
      setNewComment(prev => ({ ...prev, [postId]: "" }));
    }
  };

  const handleReaction = (postId: string, reactionType: 'like' | 'love' | 'fire' | 'clap' | 'star') => {
    toggleReaction(postId, reactionType);
  };

  const getHabitBadge = (habitType?: string, streakCount?: number, isMilestone?: boolean) => {
    if (!habitType) return null;
    
    const badgeConfig = {
      workout: { emoji: "💪", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
      reading: { emoji: "📚", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
      meditation: { emoji: "🧘‍♀️", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
      nutrition: { emoji: "🥗", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
      fitness: { emoji: "🏃‍♂️", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
    };

    const config = badgeConfig[habitType as keyof typeof badgeConfig] || 
                  { emoji: "✅", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300" };

    return (
      <Badge className={`${config.color} border-0 text-xs font-medium`}>
        {config.emoji} {habitType}
        {streakCount && streakCount > 1 && (
          <span className="ml-1 font-bold">🔥{streakCount}</span>
        )}
      </Badge>
    );
  };

  const filteredPosts = filter === 'all' ? posts : posts.filter(post => post.habit_type === filter);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Recent Activity</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Celebrate wins with your community!</p>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">📱</div>
            <p className="text-sm text-gray-500">No posts to show</p>
            <p className="text-xs text-gray-400 mt-1">Complete some habits to see activity here!</p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const displayName = post.profiles.display_name || post.profiles.email;
            const avatarUrl = post.profiles.avatar_url;
            const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
            
            return (
              <Card key={post.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                <CardContent className="p-4 space-y-4">
                  {/* Post Header */}
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={displayName} />
                      <AvatarFallback className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-sm font-semibold">
                        {displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white">{displayName}</h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{timeAgo}</span>
                      </div>
                      {getHabitBadge(post.habit_type, post.streak_count, post.is_milestone)}
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{post.content}</p>
                    {post.caption && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{post.caption}</p>
                    )}
                  </div>

                  {/* Reactions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      {(['like', 'fire', 'clap', 'star'] as const).map((reactionType) => {
                        const isSelected = post.user_reaction === reactionType;
                        const count = post.reaction_counts?.[reactionType] || 0;
                        
                        return (
                          <Button
                            key={reactionType}
                            variant="ghost"
                            size="sm"
                            className={`h-8 px-2 ${isSelected ? 'text-red-600' : 'text-gray-500'}`}
                            onClick={() => handleReaction(post.id, reactionType)}
                          >
                            {reactionType === 'like' && <ThumbsUp size={14} />}
                            {reactionType === 'fire' && <Flame size={14} />}
                            {reactionType === 'clap' && '👏'}
                            {reactionType === 'star' && <Star size={14} />}
                            {count > 0 && <span className="ml-1 text-xs">{count}</span>}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MainFeed;