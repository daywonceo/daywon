import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SocialPost {
  id: string;
  user_id: string;
  habit_name: string;
  habit_type: string | null;
  content: string;
  caption: string | null;
  streak_count: number;
  is_milestone: boolean;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    display_name: string | null;
    email: string;
    avatar_url: string | null;
    status: 'online' | 'away' | 'offline';
  };
  reactions?: PostReaction[];
  reaction_counts?: { [key: string]: number };
  user_reaction?: string | null;
}

export interface PostReaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: 'like' | 'love' | 'fire' | 'clap' | 'star' | 'strong' | 'mind_blown' | 'celebrate';
  created_at: string;
}

export interface CreatePostData {
  habit_name: string;
  habit_type?: string;
  content: string;
  caption?: string;
  photo_url?: string;
  streak_count?: number;
  is_milestone?: boolean;
}

export const useSocialPosts = () => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch social posts (from friends and own posts)
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('social_posts')
        .select(`
          *,
          profiles(
            id,
            display_name,
            email,
            avatar_url,
            status
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch reaction counts for each post
      const postsWithReactions = await Promise.all(
        (data || []).map(async (post) => {
          const { data: reactions, error: reactionsError } = await supabase
            .from('post_reactions')
            .select('*')
            .eq('post_id', post.id);

          if (reactionsError) {
            console.error('Error fetching reactions:', reactionsError);
            return { ...post, reactions: [], reaction_counts: {}, user_reaction: null };
          }

          // Count reactions by type
          const reactionCounts = reactions.reduce((acc, reaction) => {
            acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1;
            return acc;
          }, {} as { [key: string]: number });

          // Find user's reaction
          const userReaction = reactions.find(r => r.user_id === user.id);

          return {
            ...post,
            reactions,
            reaction_counts: reactionCounts,
            user_reaction: userReaction?.reaction_type || null,
          };
        })
      );

      setPosts(postsWithReactions);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load social posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new social post
  const createPost = async (postData: CreatePostData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('social_posts')
        .insert({
          user_id: user.id,
          ...postData,
        })
        .select(`
          *,
          profiles(
            id,
            display_name,
            email,
            avatar_url,
            status
          )
        `)
        .single();

      if (error) throw error;

      toast({
        title: "Post created",
        description: "Your activity has been shared!",
      });

      // Add to local state
      setPosts(prev => [{ ...data, reactions: [], reaction_counts: {}, user_reaction: null }, ...prev]);
      
      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Delete a post
  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('social_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Post deleted",
        description: "Your post has been deleted",
      });

      // Remove from local state
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  // Add or remove reaction
  const toggleReaction = async (postId: string, reactionType: 'like' | 'love' | 'fire' | 'clap' | 'star' | 'strong' | 'mind_blown' | 'celebrate') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const post = posts.find(p => p.id === postId);
      if (!post) return;

      // Check if user already reacted with this type
      const existingReaction = post.reactions?.find(r => r.user_id === user.id && r.reaction_type === reactionType);

      if (existingReaction) {
        // Remove reaction
        const { error } = await supabase
          .from('post_reactions')
          .delete()
          .eq('id', existingReaction.id);

        if (error) throw error;
      } else {
        // Add reaction (remove any existing reaction first)
        const existingUserReaction = post.reactions?.find(r => r.user_id === user.id);
        if (existingUserReaction) {
          await supabase
            .from('post_reactions')
            .delete()
            .eq('id', existingUserReaction.id);
        }

        const { error } = await supabase
          .from('post_reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: reactionType,
          });

        if (error) throw error;

        // Create notification for post owner (if not reacting to own post)
        if (post.user_id !== user.id) {
          await supabase.from('notifications').insert({
            user_id: post.user_id,
            actor_id: user.id,
            type: 'reaction',
            entity_type: 'post',
            entity_id: postId,
            message: `reacted ${reactionType} to your ${post.habit_name} post`,
          });
        }
      }

      // Refresh posts to get updated reactions
      fetchPosts();
    } catch (error) {
      console.error('Error toggling reaction:', error);
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive",
      });
    }
  };

  // Get posts by user ID
  const getPostsByUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('social_posts')
        .select(`
          *,
          profiles(
            id,
            display_name,
            email,
            avatar_url,
            status
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user posts:', error);
      return [];
    }
  };

  // Auto-create post from habit activity with enhanced messaging
  const createHabitPost = async (habitName: string, habitType: string, streakCount: number = 0) => {
    // Generate milestone-aware content
    const isMilestone = streakCount > 0 && 
      ([7, 14, 21, 30, 50, 75, 100, 150, 200, 365, 500, 1000].includes(streakCount));
    
    const getMilestoneMessage = (name: string, streak: number): string => {
      const messages = {
        7: `One week strong! 💪 ${streak} days of ${name}`,
        14: `Two weeks of consistency! 🔥 ${streak} days of ${name}`,
        21: `Three weeks of building habits! ⭐ ${streak} days of ${name}`,
        30: `One month milestone! 🏆 ${streak} days of ${name}`,
        50: `50 days of dedication! 🎯 Amazing progress on ${name}`,
        75: `75 days of consistency! 💎 You're crushing ${name}`,
        100: `100 DAYS! 🎉 Triple digits for ${name}!`,
        150: `150 days of pure dedication! 🚀 ${name} mastery`,
        200: `200 days strong! 💪 ${name} has become second nature`,
        365: `ONE FULL YEAR! 🎊 365 days of ${name} - incredible!`,
        500: `500 days of excellence! 👑 ${name} legend status`,
        1000: `1000 DAYS! 🏆 Ultimate ${name} master!`
      };
      
      return messages[streak as keyof typeof messages] || `${streak} days of ${name}! 🔥`;
    };

    const getRegularMessage = (name: string, streak: number): string => {
      const messages = [
        `Crushed another ${name} session! 💪`,
        `${name} complete! Keeping the momentum going 🔥`,
        `Another day, another ${name} win! ⭐`,
        `${name} ✅ - consistency is key!`,
        `Locked in another ${name} session! 🎯`,
        `${name} done! Small wins add up 📈`,
        `Daily ${name} complete! Building that habit 🏗️`,
        `${name} in the books! 📚`,
        `Another step forward with ${name}! 👏`,
        `${name} accomplished! Progress over perfection 💯`
      ];

      const baseMessage = messages[Math.floor(Math.random() * messages.length)];
      
      if (streak > 1) {
        return `${baseMessage} (${streak} day streak!)`;
      }
      
      return baseMessage;
    };

    const content = isMilestone 
      ? getMilestoneMessage(habitName, streakCount)
      : getRegularMessage(habitName, streakCount);

    const caption = isMilestone 
      ? `Every day counts! This milestone represents dedication, consistency, and the power of small actions. Here's to the next chapter! 🌟`
      : null;
    
    return createPost({
      habit_name: habitName,
      habit_type: habitType,
      content,
      caption,
      streak_count: streakCount,
      is_milestone: isMilestone,
    });
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    createPost,
    deletePost,
    toggleReaction,
    getPostsByUser,
    createHabitPost,
    refetch: fetchPosts,
  };
};