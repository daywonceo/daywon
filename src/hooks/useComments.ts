import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  profiles: {
    display_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
  replies?: Comment[];
}

export const useComments = (postId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch comments for a post
  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data: commentsData, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          profiles (
            display_name,
            email,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Organize comments into threads
      const commentMap = new Map<string, Comment>();
      const topLevelComments: Comment[] = [];

      // First pass: create all comments
      commentsData?.forEach(comment => {
        const commentWithReplies = { ...comment, replies: [] };
        commentMap.set(comment.id, commentWithReplies);
      });

      // Second pass: organize into threads
      commentsData?.forEach(comment => {
        if (comment.parent_comment_id) {
          // This is a reply
          const parentComment = commentMap.get(comment.parent_comment_id);
          if (parentComment) {
            parentComment.replies!.push(commentMap.get(comment.id)!);
          }
        } else {
          // This is a top-level comment
          topLevelComments.push(commentMap.get(comment.id)!);
        }
      });

      setComments(topLevelComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a new comment
  const addComment = async (content: string, parentCommentId?: string) => {
    try {
      setSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: newComment, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          parent_comment_id: parentCommentId || null,
          content: content.trim(),
        })
        .select(`
          *,
          profiles (
            display_name,
            email,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      // Create notification for post owner (if not commenting on own post)
      const { data: postData } = await supabase
        .from('social_posts')
        .select('user_id, habit_name')
        .eq('id', postId)
        .single();

      if (postData && postData.user_id !== user.id) {
        await supabase.from('notifications').insert({
          user_id: postData.user_id,
          actor_id: user.id,
          type: 'comment',
          entity_type: 'post',
          entity_id: postId,
          message: `commented on your ${postData.habit_name} post`,
        });
      }

      // If replying to a comment, notify the comment author
      if (parentCommentId) {
        const { data: parentComment } = await supabase
          .from('post_comments')
          .select('user_id')
          .eq('id', parentCommentId)
          .single();

        if (parentComment && parentComment.user_id !== user.id) {
          await supabase.from('notifications').insert({
            user_id: parentComment.user_id,
            actor_id: user.id,
            type: 'comment',
            entity_type: 'comment',
            entity_id: parentCommentId,
            message: `replied to your comment`,
          });
        }
      }

      await fetchComments(); // Refresh comments
      
      toast({
        title: "Success",
        description: "Comment added successfully",
      });

      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // Edit a comment
  const editComment = async (commentId: string, newContent: string) => {
    try {
      const { error } = await supabase
        .from('post_comments')
        .update({
          content: newContent.trim(),
          is_edited: true,
        })
        .eq('id', commentId);

      if (error) throw error;

      await fetchComments(); // Refresh comments
      
      toast({
        title: "Success",
        description: "Comment updated successfully",
      });

      return true;
    } catch (error) {
      console.error('Error editing comment:', error);
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive",
      });
      return false;
    }
  };

  // Delete a comment
  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      await fetchComments(); // Refresh comments
      
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });

      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  return {
    comments,
    loading,
    submitting,
    addComment,
    editComment,
    deleteComment,
    refreshComments: fetchComments,
  };
};