
import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ThumbsUp, MessageSquare, Share2, Filter } from "lucide-react";

interface FeedPost {
  id: number;
  user: string;
  avatar: string;
  content: string;
  timeAgo: string;
  reactions: string[];
  comments: number;
  caption?: string;
}

interface MainFeedProps {
  feedPosts: FeedPost[];
}

const MainFeed = ({ feedPosts }: MainFeedProps) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h2>
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-600 p-2">
          <Filter size={16} />
        </Button>
      </div>
      
      {/* Posts */}
      {feedPosts.map((post) => (
        <Card key={post.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-all duration-200">
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
                    <span className="text-green-700 dark:text-green-400 ml-1">{post.content}</span>
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{post.timeAgo}</span>
                </div>
                
                {post.caption && (
                  <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-3 border-green-400">
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{post.caption}"</p>
                  </div>
                )}
                
                {/* Reactions */}
                {post.reactions.length > 0 && (
                  <div className="flex items-center space-x-1 mb-3">
                    <div className="flex items-center space-x-1">
                      {post.reactions.map((reaction, index) => (
                        <span key={index} className="text-base">{reaction}</span>
                      ))}
                    </div>
                    {post.comments > 0 && (
                      <span className="text-xs text-gray-500 ml-2">{post.comments} comments</span>
                    )}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-600 h-8 px-2 text-xs">
                    <ThumbsUp size={14} className="mr-1" /> Like
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600 h-8 px-2 text-xs">
                    <MessageSquare size={14} className="mr-1" /> Reply
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-purple-600 h-8 px-2 text-xs">
                    <Share2 size={14} className="mr-1" /> Share
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Load More */}
      <div className="text-center py-4">
        <Button variant="outline" className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20">
          Load More Posts
        </Button>
      </div>
    </div>
  );
};

export default MainFeed;
