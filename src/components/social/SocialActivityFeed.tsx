
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import { DayActivity } from "@/hooks/useHabitActivities";
import SocialHabitCard from "./SocialHabitCard";
import ReactionPicker from "./ReactionPicker";
import CommentSection from "./CommentSection";

interface SocialActivityFeedProps {
  activities: DayActivity[];
  setActivities: React.Dispatch<React.SetStateAction<DayActivity[]>>;
  activeHabit: string | null;
  setActiveHabit: React.Dispatch<React.SetStateAction<string | null>>;
  userHabits: string[];
  toggleStatus: (dayIndex: number, category: string) => void;
  toggleEditMode: (dayIndex: number) => void;
  updateActivityText: (dayIndex: number, newText: string) => void;
}

const SocialActivityFeed = ({
  activities,
  setActivities,
  activeHabit,
  setActiveHabit,
  userHabits,
  toggleStatus,
  toggleEditMode,
  updateActivityText,
}: SocialActivityFeedProps) => {
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, string[]>>({});

  // Generate social posts from completed habits
  const generateSocialPosts = () => {
    const posts: any[] = [];
    
    activities.forEach((activity, dayIndex) => {
      userHabits.forEach((habit) => {
        if (activity.statuses[habit] === "completed") {
          const postId = `${dayIndex}-${habit}`;
          posts.push({
            id: postId,
            user: "YOU",
            avatar: "/lovable-uploads/5038ae63-519f-4a32-b22c-944e409ac585.png",
            habit,
            activity: activity.text,
            timeAgo: dayIndex === 0 ? "Just now" : activity.text.toLowerCase(),
            reactions: reactions[postId] || [],
            comments: 0,
            dayIndex,
          });
        }
      });
    });

    return posts;
  };

  const handleReaction = (postId: string, emoji: string) => {
    setReactions(prev => {
      const postReactions = prev[postId] || [];
      const updatedReactions = postReactions.includes(emoji)
        ? postReactions.filter(r => r !== emoji)
        : [...postReactions, emoji];
      
      return {
        ...prev,
        [postId]: updatedReactions,
      };
    });
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(expandedComments === postId ? null : postId);
  };

  const socialPosts = generateSocialPosts();

  return (
    <div className="space-y-4">
      {/* Friendly Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
          🕒 Recent Activity
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Celebrate your wins and stay motivated!
        </p>
      </div>

      {/* Habit Tracking Grid */}
      <SocialHabitCard
        activities={activities}
        setActivities={setActivities}
        activeHabit={activeHabit}
        setActiveHabit={setActiveHabit}
        userHabits={userHabits}
        toggleStatus={toggleStatus}
        toggleEditMode={toggleEditMode}
        updateActivityText={updateActivityText}
      />

      {/* Social Feed */}
      {socialPosts.length > 0 && (
        <div className="space-y-3 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white px-1">
            🎉 Your Achievements
          </h3>
          
          {socialPosts.map((post) => (
            <Card 
              key={post.id} 
              className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10 ring-2 ring-green-100 dark:ring-green-800/50">
                    <AvatarImage src={post.avatar} alt={post.user} />
                    <AvatarFallback className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-sm font-semibold">
                      {post.user[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="mb-2">
                      <p className="text-sm leading-relaxed">
                        <span className="font-bold text-gray-900 dark:text-white">{post.user}</span>
                        <span className="text-green-700 dark:text-green-400 ml-1">
                          completed {post.habit.toLowerCase()}!
                        </span>
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{post.timeAgo}</span>
                    </div>
                    
                    {/* Reactions */}
                    {post.reactions.length > 0 && (
                      <div className="flex items-center space-x-1 mb-3">
                        <div className="flex items-center space-x-1">
                          {post.reactions.map((reaction: string, index: number) => (
                            <span key={index} className="text-base">{reaction}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-1">
                      <ReactionPicker
                        onReaction={(emoji) => handleReaction(post.id, emoji)}
                        selectedReactions={reactions[post.id] || []}
                      />
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-500 hover:text-blue-600 h-8 px-2 text-xs"
                        onClick={() => toggleComments(post.id)}
                      >
                        <MessageCircle size={14} className="mr-1" /> 
                        Reply
                      </Button>
                    </div>
                    
                    {/* Comments Section */}
                    {expandedComments === post.id && (
                      <CommentSection 
                        postId={post.id}
                        onClose={() => setExpandedComments(null)}
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {socialPosts.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🌱</div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Complete your first habit to see your achievements here!
          </p>
        </div>
      )}
    </div>
  );
};

export default SocialActivityFeed;
