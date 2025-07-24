import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChallengeComment {
  id: string;
  challenge_id: string;
  user_id: string;
  parent_comment_id?: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  profiles?: {
    display_name?: string;
    email?: string;
    avatar_url?: string;
  };
  replies?: ChallengeComment[];
}

export const useChallengeComments = (challengeId?: string) => {
  const [comments, setComments] = useState<ChallengeComment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchComments = useCallback(async () => {
    if (!challengeId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('challenge_comments')
        .select(`
          *,
          profiles (
            display_name,
            email,
            avatar_url
          )
        `)
        .eq('challenge_id', challengeId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Organize comments into threads
      const commentMap = new Map<string, ChallengeComment>();
      const rootComments: ChallengeComment[] = [];

      data?.forEach(comment => {
        const commentWithReplies = { ...comment, replies: [] };
        commentMap.set(comment.id, commentWithReplies);

        if (!comment.parent_comment_id) {
          rootComments.push(commentWithReplies);
        }
      });

      // Add replies to parent comments
      data?.forEach(comment => {
        if (comment.parent_comment_id) {
          const parent = commentMap.get(comment.parent_comment_id);
          const child = commentMap.get(comment.id);
          if (parent && child) {
            parent.replies?.push(child);
          }
        }
      });

      setComments(rootComments);
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
  }, [challengeId, toast]);

  const addComment = async (content: string, parentCommentId?: string) => {
    if (!challengeId) return { success: false };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('challenge_comments')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          parent_comment_id: parentCommentId || null,
          content,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Comment added successfully",
      });

      return { success: true };
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const editComment = async (commentId: string, content: string) => {
    try {
      const { error } = await supabase
        .from('challenge_comments')
        .update({
          content,
          is_edited: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Comment updated successfully",
      });

      return { success: true };
    } catch (error) {
      console.error('Error editing comment:', error);
      toast({
        title: "Error",
        description: "Failed to edit comment",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('challenge_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!challengeId) return;

    fetchComments();

    const channel = supabase
      .channel(`challenge-comments-${challengeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'challenge_comments',
          filter: `challenge_id=eq.${challengeId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [challengeId, fetchComments]);

  return {
    comments,
    loading,
    addComment,
    editComment,
    deleteComment,
    refreshComments: fetchComments,
  };
};