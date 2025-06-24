
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Reflection {
  id: string;
  verse_reference?: string;
  devotion_title?: string;
  sermon_title?: string;
  reflection_text: string;
  created_at: string;
  updated_at: string;
}

export const useReflections = () => {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchReflections = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_reflections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReflections(data || []);
    } catch (error) {
      console.error('Error fetching reflections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveReflection = async (reflection: {
    verse_reference?: string;
    devotion_title?: string;
    sermon_title?: string;
    reflection_text: string;
  }) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_reflections')
        .insert({
          user_id: user.id,
          ...reflection
        });

      if (error) throw error;
      
      await fetchReflections(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error saving reflection:', error);
      return false;
    }
  };

  const deleteReflection = async (reflectionId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_reflections')
        .delete()
        .eq('id', reflectionId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await fetchReflections(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error deleting reflection:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchReflections();
  }, [user]);

  return {
    reflections,
    isLoading,
    saveReflection,
    deleteReflection,
    fetchReflections
  };
};
