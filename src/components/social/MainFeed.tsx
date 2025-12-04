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
import CreatePostModal from "./CreatePostModal";
import SocialEmptyState from "./SocialEmptyState";

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
      workout: { emoji: "💪", color: "bg-accent/20 text-accent-foreground border-accent/30" },
      reading: { emoji: "📚", color: "bg-primary/20 text-primary-foreground border-primary/30" },
      meditation: { emoji: "🧘‍♀️", color: "bg-muted/20 text-muted-foreground border-muted/30" },
      nutrition: { emoji: "🥗", color: "bg-success/20 text-success-foreground border-success/30" },
      fitness: { emoji: "🏃‍♂️", color: "bg-secondary/20 text-secondary-foreground border-secondary/30" },
    };

    const config = badgeConfig[habitType as keyof typeof badgeConfig] || 
                  { emoji: "✅", color: "bg-neutral/20 text-neutral-foreground border-neutral/30" };

    return (
      <Badge className={`${config.color} border text-xs font-medium`}>
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
        <h2 className="text-xl font-bold text-primary mb-1">Recent Activity</h2>
        <p className="text-sm text-muted-foreground">Celebrate wins with your community!</p>
      </div>

      {/* Create Post Section */}
      <div className="bg-warm/30 backdrop-blur-sm border border-accent/20 rounded-lg p-4">
        <CreatePostModal />
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <SocialEmptyState 
            type="no-posts" 
            actionLabel="Share your progress"
          />
        ) : (
          filteredPosts.map((post) => {
            const displayName = post.profiles.display_name || post.profiles.email;
            const avatarUrl = post.profiles.avatar_url;
            const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
            
            return (
              <Card key={post.id} className="bg-background/95 backdrop-blur-sm border-border/50 shadow-md hover:shadow-lg transition-all duration-200">
                <CardContent className="p-4 space-y-4">
                  {/* Post Header */}
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={displayName} />
                      <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
                        {displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-bold text-sm text-foreground">{displayName}</h3>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{timeAgo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {post.habit_name ? (
                          getHabitBadge(post.habit_type, post.streak_count, post.is_milestone)
                        ) : (
                          <Badge className="bg-accent/20 text-accent-foreground border-accent/30 text-xs font-medium">
                            💭 Shared
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">{post.content}</p>
                    {post.caption && (
                      <p className="text-sm text-muted-foreground">{post.caption}</p>
                    )}
                  </div>

                  {/* Reactions */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center space-x-2">
                      {(['like', 'fire', 'clap', 'star'] as const).map((reactionType) => {
                        const isSelected = post.user_reaction === reactionType;
                        const count = post.reaction_counts?.[reactionType] || 0;
                        
                        return (
                          <Button
                            key={reactionType}
                            variant="ghost"
                            size="sm"
                            className={`h-8 px-2 ${isSelected ? 'text-accent' : 'text-muted-foreground'}`}
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