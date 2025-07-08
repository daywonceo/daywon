import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface GuidanceActivity {
  id: string;
  type: 'verse' | 'recipe' | 'workout' | 'reflection' | 'devotion' | 'sermon';
  title: string;
  timestamp: string;
  reference?: string;
  category?: string;
  duration?: number;
  details?: string;
}

export const useGuidanceActivity = (date: string) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<GuidanceActivity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !date) return;

    const fetchActivities = async () => {
      setLoading(true);
      try {
        const startDate = `${date} 00:00:00`;
        const endDate = `${date} 23:59:59`;
        
        const [versesRes, recipesRes, workoutsRes, reflectionsRes, devotionsRes, sermonsRes] = await Promise.all([
          supabase
            .from('saved_verses')
            .select('*')
            .eq('user_id', user.id)
            .gte('saved_at', startDate)
            .lte('saved_at', endDate),
          
          supabase
            .from('saved_recipes')
            .select('*')
            .eq('user_id', user.id)
            .gte('saved_at', startDate)
            .lte('saved_at', endDate),
          
          supabase
            .from('workout_sessions')
            .select('*')
            .eq('user_id', user.id)
            .eq('workout_date', date)
            .eq('is_completed', true),
          
          supabase
            .from('user_reflections')
            .select('*')
            .eq('user_id', user.id)
            .gte('created_at', startDate)
            .lte('created_at', endDate),
          
          supabase
            .from('saved_devotions')
            .select('*')
            .eq('user_id', user.id)
            .gte('saved_at', startDate)
            .lte('saved_at', endDate),
          
          supabase
            .from('saved_sermons')
            .select('*')
            .eq('user_id', user.id)
            .gte('saved_at', startDate)
            .lte('saved_at', endDate)
        ]);

        const allActivities: GuidanceActivity[] = [];

        // Add verses
        versesRes.data?.forEach(verse => {
          allActivities.push({
            id: verse.id,
            type: 'verse',
            title: verse.reference,
            timestamp: verse.saved_at,
            reference: verse.reference,
            category: verse.category,
            details: verse.text.substring(0, 100) + '...'
          });
        });

        // Add recipes
        recipesRes.data?.forEach(recipe => {
          allActivities.push({
            id: recipe.id,
            type: 'recipe',
            title: recipe.recipe_title,
            timestamp: recipe.saved_at,
            category: recipe.recipe_category,
            details: `${recipe.recipe_servings} servings • ${recipe.recipe_ready_in_minutes} min`
          });
        });

        // Add workouts
        workoutsRes.data?.forEach(workout => {
          allActivities.push({
            id: workout.id,
            type: 'workout',
            title: `${workout.workout_type} Workout`,
            timestamp: workout.created_at,
            duration: workout.duration_minutes,
            details: workout.notes || 'Completed workout session'
          });
        });

        // Add reflections
        reflectionsRes.data?.forEach(reflection => {
          allActivities.push({
            id: reflection.id,
            type: 'reflection',
            title: reflection.verse_reference || reflection.devotion_title || 'Personal Reflection',
            timestamp: reflection.created_at,
            details: reflection.reflection_text.substring(0, 100) + '...'
          });
        });

        // Add devotions
        devotionsRes.data?.forEach(devotion => {
          allActivities.push({
            id: devotion.id,
            type: 'devotion',
            title: devotion.title,
            timestamp: devotion.saved_at,
            category: devotion.category,
            reference: devotion.verse_reference,
            details: devotion.content.substring(0, 100) + '...'
          });
        });

        // Add sermons
        sermonsRes.data?.forEach(sermon => {
          allActivities.push({
            id: sermon.id,
            type: 'sermon',
            title: sermon.title,
            timestamp: sermon.saved_at,
            category: sermon.category,
            details: sermon.author ? `By ${sermon.author}` : undefined
          });
        });

        // Sort by timestamp (most recent first)
        allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        setActivities(allActivities);
      } catch (error) {
        console.error('Error fetching guidance activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user, date]);

  return { activities, loading };
};