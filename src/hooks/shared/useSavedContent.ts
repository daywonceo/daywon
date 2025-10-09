import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UseSavedContentConfig<T> {
  tableName: string;
  contentName: string;
}

export function useSavedContent<TItem extends { id: string; saved_at: string }, TInsert extends Record<string, any>>(
  config: UseSavedContentConfig<TItem>
) {
  const [items, setItems] = useState<TItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchItems = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from(config.tableName)
        .select('*')
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false });

      if (error) throw error;
      setItems((data as TItem[]) || []);
    } catch (error) {
      console.error(`Error fetching ${config.contentName}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveItem = async (item: TInsert): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from(config.tableName)
        .insert({
          user_id: user.id,
          ...item
        });

      if (error) throw error;
      
      await fetchItems();
      return true;
    } catch (error) {
      console.error(`Error saving ${config.contentName}:`, error);
      return false;
    }
  };

  const deleteItem = async (itemId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from(config.tableName)
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await fetchItems();
      return true;
    } catch (error) {
      console.error(`Error deleting ${config.contentName}:`, error);
      return false;
    }
  };

  useEffect(() => {
    fetchItems();
  }, [user]);

  return {
    items,
    isLoading,
    saveItem,
    deleteItem,
    refetch: fetchItems
  };
}
