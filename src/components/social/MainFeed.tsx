
import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ThumbsUp, MessageSquare, Share2 } from "lucide-react";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Recent Activity</h2>
        <Button variant="outline" size="sm" className="text-green-700 border-green-200 hover:bg-green-50">
          Filter
        </Button>
      </div>
      
      {feedPosts.map((post) => (
        <div key={post.id} className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
          <div className="flex items-start space-x-4">
            <Avatar className="h-12 w-12 ring-2 ring-green-100 dark:ring-green-800">
              <AvatarImage src={post.avatar} alt={post.user} />
              <AvatarFallback className="bg-green-100 text-green-800">{post.user[0]}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                    {post.user} <span className="font-normal text-green-700 dark:text-green-400">{post.content}</span>
                  </h3>
                  {post.caption && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 bg-white dark:bg-gray-800 p-3 rounded-md border-l-4 border-green-200">
                      "{post.caption}"
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-4">{post.timeAgo}</span>
              </div>
              
              {post.reactions.length > 0 && (
                <div className="flex items-center space-x-1 mb-3">
                  {post.reactions.map((reaction, index) => (
                    <span key={index} className="text-lg">{reaction}</span>
                  ))}
                  {post.comments > 0 && (
                    <span className="text-sm text-gray-500 ml-2">{post.comments} comments</span>
                  )}
                </div>
              )}
              
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-600 h-8 px-3">
                  <ThumbsUp size={14} className="mr-1" /> Like
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600 h-8 px-3">
                  <MessageSquare size={14} className="mr-1" /> Comment
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-purple-600 h-8 px-3">
                  <Share2 size={14} className="mr-1" /> Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <div className="text-center py-6">
        <Button variant="outline" className="text-green-700 border-green-200 hover:bg-green-50">
          Load More Posts
        </Button>
      </div>
    </div>
  );
};

export default MainFeed;
