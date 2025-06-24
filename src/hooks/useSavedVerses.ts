
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SavedVerse {
  id: string;
  reference: string;
  text: string;
  translation_name: string;
  category?: string;
  saved_at: string;
}

export const useSavedVerses = () => {
  const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchSavedVerses = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_verses')
        .select('*')
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false });

      if (error) throw error;
      setSavedVerses(data || []);
    } catch (error) {
      console.error('Error fetching saved verses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveVerse = async (verse: {
    reference: string;
    text: string;
    translation_name: string;
    category?: string;
  }) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('saved_verses')
        .insert({
          user_id: user.id,
          reference: verse.reference,
          text: verse.text,
          translation_name: verse.translation_name,
          category: verse.category
        });

      if (error) throw error;
      
      await fetchSavedVerses(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error saving verse:', error);
      return false;
    }
  };

  const deleteSavedVerse = async (verseId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('saved_verses')
        .delete()
        .eq('id', verseId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await fetchSavedVerses(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error deleting saved verse:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchSavedVerses();
  }, [user]);

  return {
    savedVerses,
    isLoading,
    saveVerse,
    deleteSavedVerse,
    fetchSavedVerses
  };
};
