
import { useState, useEffect } from "react";

interface BibleVerse {
  reference: string;
  text: string;
  translation_name: string;
  translation_note?: string;
  category: string;
}

const verseReferences = [
  { ref: "philippians 4:13", category: "strength" },
  { ref: "1 corinthians 10:31", category: "purpose" }, 
  { ref: "proverbs 27:17", category: "friendship" },
  { ref: "galatians 6:9", category: "perseverance" },
  { ref: "psalm 23:1", category: "comfort" },
  { ref: "jeremiah 29:11", category: "hope" },
  { ref: "romans 8:28", category: "faith" },
  { ref: "matthew 6:26", category: "trust" },
  { ref: "joshua 1:9", category: "courage" },
  { ref: "2 timothy 1:7", category: "courage" },
  { ref: "isaiah 40:31", category: "strength" },
  { ref: "romans 12:2", category: "transformation" },
  { ref: "psalm 139:14", category: "identity" },
  { ref: "ephesians 2:10", category: "purpose" },
  { ref: "1 peter 5:7", category: "peace" },
  { ref: "hebrews 11:1", category: "faith" },
  { ref: "psalm 46:10", category: "peace" },
  { ref: "matthew 5:16", category: "purpose" }
];

export const useBibleVerses = (selectedTranslation: string = "esv", selectedCategory: string = "all") => {
  const [bibleVerses, setBibleVerses] = useState<BibleVerse[]>([]);
  const [isLoadingVerses, setIsLoadingVerses] = useState(true);
  const [versesError, setVersesError] = useState<string | null>(null);

  const fetchBibleVerses = async () => {
    setIsLoadingVerses(true);
    setVersesError(null);
    
    try {
      // Filter by category first
      const filteredRefs = selectedCategory === "all" 
        ? verseReferences 
        : verseReferences.filter(verse => verse.category === selectedCategory);
      
      const selectedRefs = filteredRefs
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
      
      const fetchPromises = selectedRefs.map(async ({ ref, category }) => {
        // The Bible API doesn't support ESV, so we'll use the default (WEB) for most translations
        // and only specify translation for supported ones like KJV
        const apiUrl = selectedTranslation === "kjv" 
          ? `https://bible-api.com/${encodeURIComponent(ref)}?translation=kjv`
          : `https://bible-api.com/${encodeURIComponent(ref)}`;
        
        console.log(`Fetching: ${apiUrl}`);
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${ref}`);
        }
        const result = await response.json();
        return { ...result, category };
      });

      const results = await Promise.all(fetchPromises);
      
      const formattedVerses: BibleVerse[] = results.map((result) => ({
        reference: result.reference,
        text: result.text.trim(),
        translation_name: getTranslationDisplayName(selectedTranslation),
        translation_note: result.translation_note,
        category: result.category
      }));

      setBibleVerses(formattedVerses);
    } catch (error) {
      console.error('Error fetching Bible verses:', error);
      setVersesError('Failed to load verses. Please try again.');
    } finally {
      setIsLoadingVerses(false);
    }
  };

  const getTranslationDisplayName = (translation: string) => {
    const translationNames: { [key: string]: string } = {
      "esv": "English Standard Version",
      "niv": "New International Version", 
      "nlt": "New Living Translation",
      "web": "World English Bible",
      "kjv": "King James Version",
      "nasb": "New American Standard Bible"
    };
    return translationNames[translation] || "World English Bible";
  };

  const getAvailableCategories = () => {
    const categories = [...new Set(verseReferences.map(verse => verse.category))];
    return categories.sort();
  };

  useEffect(() => {
    fetchBibleVerses();
  }, [selectedTranslation, selectedCategory]);

  return {
    bibleVerses,
    isLoadingVerses,
    versesError,
    fetchBibleVerses,
    getAvailableCategories
  };
};
