import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  Reply, 
  Edit3, 
  Trash2, 
  MoreHorizontal,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useChallengeComments } from '@/hooks/useChallengeComments';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface ChallengeCommentsProps {
  challengeId: string;
  className?: string;
}

const ChallengeComments = ({ challengeId, className = "" }: ChallengeCommentsProps) => {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { comments, loading, addComment, editComment, deleteComment } = useChallengeComments(challengeId);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    const result = await addComment(newComment, replyTo || undefined);
    
    if (result.success) {
      setNewComment('');
      setReplyTo(null);
    }
    setIsSubmitting(false);
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    const result = await editComment(commentId, editContent);
    if (result.success) {
      setEditingComment(null);
      setEditContent('');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await deleteComment(commentId);
    }
  };

  const startEditing = (commentId: string, currentContent: string) => {
    setEditingComment(commentId);
    setEditContent(currentContent);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const renderComment = (comment: any, isReply: boolean = false) => {
    const displayName = comment.profiles?.display_name || comment.profiles?.email || 'Anonymous';
    const isOwner = comment.user_id === user?.id;

    return (
      <div
        key={comment.id}
        className={`flex space-x-3 ${isReply ? 'ml-12 mt-3' : 'mb-4'}`}
      >
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.profiles?.avatar_url || "/placeholder.svg"} alt={displayName} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-semibold">
            {displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm text-gray-900 dark:text-white">
                  {displayName}
                </span>
                {comment.is_edited && (
                  <Badge variant="secondary" className="text-xs">
                    Edited
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                  <Clock size={12} />
                  <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                </span>
                
                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal size={12} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => startEditing(comment.id, comment.content)}>
                        <Edit3 size={14} className="mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-600 dark:text-red-400"
                      >
                        <Trash2 size={14} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {editingComment === comment.id ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[80px] text-sm"
                  placeholder="Edit your comment..."
                />
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleEditComment(comment.id)}
                    disabled={!editContent.trim()}
                  >
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={cancelEditing}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {comment.content}
              </p>
            )}
          </div>

          {!isReply && (
            <div className="flex items-center space-x-3 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                className="text-xs h-6 px-2"
              >
                <Reply size={12} className="mr-1" />
                Reply
              </Button>
              
              {comment.replies?.length > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                </span>
              )}
            </div>
          )}

          {/* Reply Form */}
          {replyTo === comment.id && (
            <div className="mt-3 ml-12">
              <div className="flex space-x-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a reply..."
                  className="min-h-[60px] text-sm"
                />
                <div className="flex flex-col space-y-1">
                  <Button
                    size="sm"
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || isSubmitting}
                  >
                    <Send size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReplyTo(null);
                      setNewComment('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies?.map((reply: any) => (
            renderComment(reply, true)
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 ${className}`}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex space-x-3">
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center space-x-2">
          <MessageCircle size={20} className="text-blue-500" />
          <span>Discussion</span>
          <Badge variant="secondary" className="text-xs">
            {comments.reduce((total, comment) => total + 1 + (comment.replies?.length || 0), 0)}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* New Comment Form */}
        {!replyTo && (
          <div className="flex space-x-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} alt="You" />
              <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white text-xs font-semibold">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this challenge..."
                className="min-h-[80px]"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                  size="sm"
                >
                  <Send size={14} className="mr-1" />
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No comments yet. Be the first to share your thoughts!
              </p>
            </div>
          ) : (
            comments.map(comment => renderComment(comment))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChallengeComments;