
import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ThumbsUp, MessageSquare } from "lucide-react";

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
      {feedPosts.map((post) => (
        <div key={post.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <div className="flex items-start mb-2">
            <Avatar className="h-12 w-12 mr-3">
              <AvatarImage src={post.avatar} alt={post.user} />
              <AvatarFallback>{post.user[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{post.user} {post.content}</h3>
                  {post.caption && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{post.caption}</p>
                  )}
                </div>
                <span className="text-xs text-gray-500">{post.timeAgo}</span>
              </div>
              
              <div className="flex items-center mt-2">
                <div className="flex space-x-1 mr-4">
                  {post.reactions.map((reaction, index) => (
                    <span key={index} className="text-lg">{reaction}</span>
                  ))}
                </div>
                {post.comments > 0 && (
                  <span className="text-sm text-gray-500">{post.comments} COMMENTS</span>
                )}
              </div>
              
              <div className="mt-3 flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                  <ThumbsUp size={16} className="mr-1" /> Like
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                  <MessageSquare size={16} className="mr-1" /> Comment
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <div className="text-center py-4">
        <Button variant="ghost" className="text-green-700 hover:text-green-800">
          SEE MORE
        </Button>
      </div>
    </div>
  );
};

export default MainFeed;
