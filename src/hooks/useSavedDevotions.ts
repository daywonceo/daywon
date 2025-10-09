import { useSavedContent } from "./shared/useSavedContent";

export interface SavedDevotion {
  id: string;
  title: string;
  content: string;
  verse_reference?: string;
  category?: string;
  saved_at: string;
}

type DevotionInsert = Omit<SavedDevotion, 'id' | 'saved_at'>;

export const useSavedDevotions = () => {
  const { items, isLoading, saveItem, deleteItem, refetch } = useSavedContent<SavedDevotion, DevotionInsert>({
    tableName: 'saved_devotions',
    contentName: 'saved devotions'
  });

  return {
    savedDevotions: items,
    isLoading,
    saveDevotion: saveItem,
    deleteSavedDevotion: deleteItem,
    fetchSavedDevotions: refetch
  };
};
