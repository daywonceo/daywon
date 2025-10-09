import { useSavedContent } from "./shared/useSavedContent";

export interface SavedVerse {
  id: string;
  reference: string;
  text: string;
  translation_name: string;
  category?: string;
  saved_at: string;
}

type VerseInsert = Omit<SavedVerse, 'id' | 'saved_at'>;

export const useSavedVerses = () => {
  const { items, isLoading, saveItem, deleteItem, refetch } = useSavedContent<SavedVerse, VerseInsert>({
    tableName: 'saved_verses',
    contentName: 'saved verses'
  });

  return {
    savedVerses: items,
    isLoading,
    saveVerse: saveItem,
    deleteSavedVerse: deleteItem,
    fetchSavedVerses: refetch
  };
};
