
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ThumbsUp, MessageSquare, Share2, Filter, Heart, Flame, PartyPopper, Smile } from "lucide-react";

interface FeedPost {
  id: number;
  user: string;
  avatar: string;
  content: string;
  timeAgo: string;
  reactions: string[];
  comments: number;
  caption?: string;
  habitType?: 'workout' | 'reading' | 'meditation' | 'nutrition' | 'sleep';
  streakCount?: number;
}

interface MainFeedProps {
  feedPosts: FeedPost[];
}

const habitPosts = [
  {
    id: 101,
    user: "Sarah Chen",
    avatar: "/placeholder.svg",
    content: "completed a 45-minute workout! 💪",
    timeAgo: "12 minutes ago",
    reactions: ["💪", "🔥", "👏"],
    comments: 3,
    caption: "Crushed that morning routine! Feeling unstoppable today.",
    habitType: 'workout' as const,
    streakCount: 7
  },
  {
    id: 102,
    user: "Mike Johnson",
    avatar: "/placeholder.svg",
    content: "read for 30 minutes - 14 days in a row! 📚",
    timeAgo: "1 hour ago",
    reactions: ["🔥", "📚", "🎉"],
    comments: 5,
    caption: "Just finished 'Atomic Habits' - game changer!",
    habitType: 'reading' as const,
    streakCount: 14
  },
  {
    id: 103,
    user: "Alex Rivera",
    avatar: "/placeholder.svg",
    content: "meditated for 20 minutes ✨",
    timeAgo: "2 hours ago",
    reactions: ["✨", "🧘‍♀️", "❤️"],
    comments: 2,
    caption: "Found some peace in the chaos today. Grateful for this practice.",
    habitType: 'meditation' as const,
    streakCount: 3
  }
];

const MainFeed = ({ feedPosts }: MainFeedProps) => {
  const [selectedReaction, setSelectedReaction] = useState<{[key: number]: string | null}>({});
  const [showComments, setShowComments] = useState<{[key: number]: boolean}>({});
  const [newComment, setNewComment] = useState<{[key: number]: string}>({});

  const allPosts = [...habitPosts, ...feedPosts].sort((a, b) => {
    const timeA = new Date().getTime() - parseInt(a.timeAgo.split(' ')[0]) * 60000;
    const timeB = new Date().getTime() - parseInt(b.timeAgo.split(' ')[0]) * 60000;
    return timeB - timeA;
  });

  const reactionOptions = ["❤️", "🔥", "🎉", "💪", "👏", "✨", "🚀", "🙌"];

  const handleReaction = (postId: number, reaction: string) => {
    setSelectedReaction(prev => ({
      ...prev,
      [postId]: prev[postId] === reaction ? null : reaction
    }));
  };

  const toggleComments = (postId: number) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleComment = (postId: number) => {
    if (newComment[postId]?.trim()) {
      // Here you would typically save the comment
      console.log(`Comment on post ${postId}:`, newComment[postId]);
      setNewComment(prev => ({ ...prev, [postId]: '' }));
    }
  };

  const getHabitBadge = (habitType?: string, streakCount?: number) => {
    if (!habitType || !streakCount) return null;
    
    const badges = {
      workout: { emoji: "💪", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
      reading: { emoji: "📚", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
      meditation: { emoji: "✨", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
      nutrition: { emoji: "🥗", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
      sleep: { emoji: "😴", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" }
    };
    
    const badge = badges[habitType as keyof typeof badges];
    if (!badge) return null;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.emoji} {streakCount} day streak
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Friendly Header */}
      <div className="text-center mb-6 px-2">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full mb-3">
          <span className="text-xl">🕒</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Recent Activity</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Celebrate wins with your community!</p>
      </div>
      
      {/* Filter Button */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Latest Updates</span>
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-600 p-2">
          <Filter size={16} />
        </Button>
      </div>
      
      {/* Posts */}
      {allPosts.map((post) => (
        <Card key={post.id} className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Avatar className="h-12 w-12 ring-2 ring-green-100 dark:ring-green-800/50">
                <AvatarImage src={post.avatar} alt={post.user} />
                <AvatarFallback className="bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-800 dark:to-blue-800 text-green-800 dark:text-green-200 text-sm font-bold">
                  {post.user.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="mb-3">
                  <p className="text-sm leading-relaxed">
                    <span className="font-bold text-gray-900 dark:text-white">{post.user}</span>
                    <span className="text-gray-700 dark:text-gray-300 ml-1">{post.content}</span>
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{post.timeAgo}</span>
                    {getHabitBadge(post.habitType, post.streakCount)}
                  </div>
                </div>
                
                {post.caption && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-green-50 dark:from-gray-700/50 dark:to-green-900/20 rounded-xl border-l-3 border-green-400">
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{post.caption}"</p>
                  </div>
                )}
                
                {/* Reactions Display */}
                {post.reactions.length > 0 && (
                  <div className="flex items-center space-x-2 mb-3 p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-1">
                      {post.reactions.map((reaction, index) => (
                        <span key={index} className="text-lg hover:scale-125 transition-transform cursor-pointer">{reaction}</span>
                      ))}
                    </div>
                    {post.comments > 0 && (
                      <span className="text-xs text-gray-500 ml-2">{post.comments} comments</span>
                    )}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
                  <div className="flex items-center space-x-1">
                    {/* Reaction Picker */}
                    <div className="relative group">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`text-gray-500 hover:text-red-500 h-8 px-3 text-xs transition-colors ${selectedReaction[post.id] ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : ''}`}
                      >
                        <Heart size={14} className="mr-1" />
                        {selectedReaction[post.id] || 'React'}
                      </Button>
                      
                      {/* Reaction Options */}
                      <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 flex space-x-1 z-10">
                        {reactionOptions.map((reaction) => (
                          <button
                            key={reaction}
                            onClick={() => handleReaction(post.id, reaction)}
                            className="text-lg hover:scale-125 transition-transform p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {reaction}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-500 hover:text-blue-600 h-8 px-3 text-xs"
                      onClick={() => toggleComments(post.id)}
                    >
                      <MessageSquare size={14} className="mr-1" /> Comment
                    </Button>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-purple-600 h-8 px-2 text-xs">
                    <Share2 size={14} />
                  </Button>
                </div>
                
                {/* Comments Section */}
                {showComments[post.id] && (
                  <div className="mt-4 space-y-3 border-t border-gray-100 dark:border-gray-700 pt-3">
                    {/* Sample Comments */}
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs">
                            JD
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-xs"><span className="font-semibold">Jane Doe</span> Keep it up! 🔥</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Add Comment */}
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs">
                          ME
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex space-x-2">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          value={newComment[post.id] || ''}
                          onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                          className="flex-1 text-sm bg-gray-50 dark:bg-gray-700 border-0 rounded-full px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-400"
                          onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleComment(post.id)}
                          className="h-6 px-3 text-xs rounded-full"
                          disabled={!newComment[post.id]?.trim()}
                        >
                          Post
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Load More */}
      <div className="text-center py-6">
        <Button variant="outline" className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full px-6">
          Load More Stories
        </Button>
      </div>
    </div>
  );
};

export default MainFeed;
