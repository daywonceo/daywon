import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, X } from "lucide-react";

interface CommentSectionProps {
  postId: string;
  onClose: () => void;
}

const CommentSection = ({ postId, onClose }: CommentSectionProps) => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([]);

  const handleSubmitComment = () => {
    if (comment.trim()) {
      setComments(prev => [...prev, comment.trim()]);
      setComment("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitComment();
    }
  };

  return (
    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-3 border-blue-400">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Comments</h4>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X size={12} />
        </Button>
      </div>
      
      {/* Existing Comments */}
      {comments.length > 0 && (
        <div className="space-y-2 mb-3">
          {comments.map((commentText, index) => (
            <div key={index} className="flex items-start space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs">
                  Y
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">You:</span> {commentText}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Comment Input */}
      <div className="flex items-center space-x-2">
        <Avatar className="h-6 w-6">
          <AvatarFallback className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs">
            Y
          </AvatarFallback>
        </Avatar>
        <Input
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 h-8 text-xs bg-white dark:bg-gray-600 border-gray-200 dark:border-gray-500"
        />
        <Button
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleSubmitComment}
          disabled={!comment.trim()}
        >
          <Send size={12} />
        </Button>
      </div>
      
      {comments.length === 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Be the first to comment! 💬
        </p>
      )}
    </div>
  );
};

export default CommentSection;
