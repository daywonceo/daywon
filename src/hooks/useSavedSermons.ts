import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SavedSermon {
  id: string;
  title: string;
  author?: string;
  url?: string;
  description?: string;
  category?: string;
  saved_at: string;
}

export const useSavedSermons = () => {
  const [savedSermons, setSavedSermons] = useState<SavedSermon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchSavedSermons = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_sermons')
        .select('*')
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false });

      if (error) throw error;
      setSavedSermons(data || []);
    } catch (error) {
      console.error('Error fetching saved sermons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSermon = async (sermon: {
    title: string;
    author?: string;
    url?: string;
    description?: string;
    category?: string;
  }) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('saved_sermons')
        .insert({
          user_id: user.id,
          ...sermon
        });

      if (error) throw error;
      
      await fetchSavedSermons();
      return true;
    } catch (error) {
      console.error('Error saving sermon:', error);
      return false;
    }
  };

  const deleteSavedSermon = async (sermonId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('saved_sermons')
        .delete()
        .eq('id', sermonId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await fetchSavedSermons();
      return true;
    } catch (error) {
      console.error('Error deleting sermon:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchSavedSermons();
  }, [user]);

  return {
    savedSermons,
    isLoading,
    saveSermon,
    deleteSavedSermon,
    fetchSavedSermons
  };
};
