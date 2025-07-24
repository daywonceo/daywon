import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Reply, Edit3, Trash2, Send } from 'lucide-react';
import { useComments } from '@/hooks/useComments';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface CommentSectionProps {
  postId: string;
  className?: string;
}

interface CommentItemProps {
  comment: any;
  onReply: (commentId: string, content: string) => Promise<boolean>;
  onEdit: (commentId: string, content: string) => Promise<boolean>;
  onDelete: (commentId: string) => Promise<boolean>;
  currentUserId?: string;
  level?: number;
}

const CommentItem = ({ comment, onReply, onEdit, onDelete, currentUserId, level = 0 }: CommentItemProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);
  const [submitting, setSubmitting] = useState(false);

  const displayName = comment.profiles?.display_name || comment.profiles?.email || 'Anonymous';
  const avatarUrl = comment.profiles?.avatar_url;
  const timeAgo = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true });
  const isOwner = currentUserId === comment.user_id;
  const maxNestingLevel = 3; // Limit nesting depth

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    
    setSubmitting(true);
    const success = await onReply(comment.id, replyContent);
    if (success) {
      setReplyContent('');
      setIsReplying(false);
    }
    setSubmitting(false);
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    
    setSubmitting(true);
    const success = await onEdit(comment.id, editContent);
    if (success) {
      setIsEditing(false);
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await onDelete(comment.id);
    }
  };

  return (
    <div className={`space-y-2 ${level > 0 ? 'ml-8 pl-4 border-l border-gray-200 dark:border-gray-700' : ''}`}>
      <div className="flex items-start space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={displayName} />
          <AvatarFallback className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs font-semibold">
            {displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-sm text-gray-900 dark:text-white">
                {displayName}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{timeAgo}</span>
              {comment.is_edited && (
                <span className="text-xs text-gray-400 dark:text-gray-500">(edited)</span>
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[60px] text-sm"
                  placeholder="Edit your comment..."
                />
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={handleEdit}
                    disabled={submitting || !editContent.trim()}
                    className="h-7"
                  >
                    {submitting ? (
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={12} className="mr-1" />
                        Save
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}
                    className="h-7"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                {comment.content}
              </p>
            )}
          </div>
          
          {/* Comment actions */}
          <div className="flex items-center space-x-4 mt-1 ml-1">
            {level < maxNestingLevel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(!isReplying)}
                className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Reply size={12} className="mr-1" />
                Reply
              </Button>
            )}
            
            {isOwner && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <Edit3 size={12} className="mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="h-6 px-2 text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 size={12} className="mr-1" />
                  Delete
                </Button>
              </>
            )}
          </div>
          
          {/* Reply form */}
          {isReplying && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[60px] text-sm"
                placeholder="Write a reply..."
              />
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={submitting || !replyContent.trim()}
                  className="h-7"
                >
                  {submitting ? (
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={12} className="mr-1" />
                      Reply
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent('');
                  }}
                  className="h-7"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          {/* Render replies recursively */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-2">
              {comment.replies.map((reply: any) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  currentUserId={currentUserId}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CommentSection = ({ postId, className }: CommentSectionProps) => {
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const { comments, loading, submitting, addComment, editComment, deleteComment } = useComments(postId);
  const { user } = useAuth();

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    const success = await addComment(newComment);
    if (success) {
      setNewComment('');
    }
  };

  const handleReply = async (parentCommentId: string, content: string) => {
    return await addComment(content, parentCommentId);
  };

  if (loading) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Comments toggle and count */}
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-0 h-auto"
        >
          <MessageCircle size={16} className="mr-1" />
          {comments.length === 0 ? 'Add comment' : `${comments.length} comment${comments.length === 1 ? '' : 's'}`}
        </Button>
      </div>

      {showComments && (
        <Card className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4 space-y-4">
            {/* New comment form */}
            <div className="space-y-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] bg-white dark:bg-gray-900"
                placeholder="Write a comment..."
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleAddComment}
                  disabled={submitting || !newComment.trim()}
                  size="sm"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={14} className="mr-1" />
                      Comment
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Comments list */}
            {comments.length > 0 ? (
              <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onReply={handleReply}
                    onEdit={editComment}
                    onDelete={deleteComment}
                    currentUserId={user?.id}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                No comments yet. Be the first to comment!
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CommentSection;