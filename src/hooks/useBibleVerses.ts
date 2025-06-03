
import { useState, useEffect } from "react";

interface BibleVerse {
  reference: string;
  text: string;
  translation_name: string;
  translation_note?: string;
}

const verseReferences = [
  "philippians 4:13",
  "1 corinthians 10:31", 
  "proverbs 27:17",
  "galatians 6:9",
  "psalm 23:1",
  "jeremiah 29:11",
  "romans 8:28",
  "matthew 6:26",
  "joshua 1:9"
];

export const useBibleVerses = (selectedTranslation: string = "esv") => {
  const [bibleVerses, setBibleVerses] = useState<BibleVerse[]>([]);
  const [isLoadingVerses, setIsLoadingVerses] = useState(true);
  const [versesError, setVersesError] = useState<string | null>(null);

  const fetchBibleVerses = async () => {
    setIsLoadingVerses(true);
    setVersesError(null);
    
    try {
      const selectedRefs = verseReferences
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
      
      const fetchPromises = selectedRefs.map(async (ref) => {
        const apiUrl = selectedTranslation === "esv" 
          ? `https://bible-api.com/${encodeURIComponent(ref)}?translation=esv`
          : `https://bible-api.com/${encodeURIComponent(ref)}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${ref}`);
        }
        return response.json();
      });

      const results = await Promise.all(fetchPromises);
      
      const formattedVerses: BibleVerse[] = results.map((result) => ({
        reference: result.reference,
        text: result.text.trim(),
        translation_name: result.translation_name || (selectedTranslation === "esv" ? "ESV" : "WEB"),
        translation_note: result.translation_note
      }));

      setBibleVerses(formattedVerses);
    } catch (error) {
      console.error('Error fetching Bible verses:', error);
      setVersesError('Failed to load verses. Please try again.');
    } finally {
      setIsLoadingVerses(false);
    }
  };

  useEffect(() => {
    fetchBibleVerses();
  }, [selectedTranslation]);

  return {
    bibleVerses,
    isLoadingVerses,
    versesError,
    fetchBibleVerses
  };
};
