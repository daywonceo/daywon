import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SavedDevotion {
  id: string;
  title: string;
  content: string;
  verse_reference?: string;
  category?: string;
  saved_at: string;
}

export const useSavedDevotions = () => {
  const [savedDevotions, setSavedDevotions] = useState<SavedDevotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchSavedDevotions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_devotions')
        .select('*')
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false });

      if (error) throw error;
      setSavedDevotions(data || []);
    } catch (error) {
      console.error('Error fetching saved devotions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDevotion = async (devotion: {
    title: string;
    content: string;
    verse_reference?: string;
    category?: string;
  }) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('saved_devotions')
        .insert({
          user_id: user.id,
          ...devotion
        });

      if (error) throw error;
      
      await fetchSavedDevotions();
      return true;
    } catch (error) {
      console.error('Error saving devotion:', error);
      return false;
    }
  };

  const deleteSavedDevotion = async (devotionId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('saved_devotions')
        .delete()
        .eq('id', devotionId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await fetchSavedDevotions();
      return true;
    } catch (error) {
      console.error('Error deleting devotion:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchSavedDevotions();
  }, [user]);

  return {
    savedDevotions,
    isLoading,
    saveDevotion,
    deleteSavedDevotion,
    fetchSavedDevotions
  };
};
