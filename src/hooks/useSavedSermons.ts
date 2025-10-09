import { useSavedContent } from "./shared/useSavedContent";

export interface SavedSermon {
  id: string;
  title: string;
  author?: string;
  url?: string;
  description?: string;
  category?: string;
  saved_at: string;
}

type SermonInsert = Omit<SavedSermon, 'id' | 'saved_at'>;

export const useSavedSermons = () => {
  const { items, isLoading, saveItem, deleteItem, refetch } = useSavedContent<SavedSermon, SermonInsert>({
    tableName: 'saved_sermons',
    contentName: 'saved sermons'
  });

  return {
    savedSermons: items,
    isLoading,
    saveSermon: saveItem,
    deleteSavedSermon: deleteItem,
    fetchSavedSermons: refetch
  };
};
