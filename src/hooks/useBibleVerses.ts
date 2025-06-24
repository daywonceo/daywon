
import { useState, useEffect } from "react";

interface BibleVerse {
  reference: string;
  text: string;
  translation_name: string;
  translation_note?: string;
  category: string;
}

const verseReferences = [
  { ref: "philippians 4:13", fullRef: "philippians 4:10-20", category: "strength" },
  { ref: "1 corinthians 10:31", fullRef: "1 corinthians 10:23-33", category: "purpose" }, 
  { ref: "proverbs 27:17", fullRef: "proverbs 27:14-22", category: "friendship" },
  { ref: "galatians 6:9", fullRef: "galatians 6:6-18", category: "perseverance" },
  { ref: "psalm 23:1", fullRef: "psalm 23:1-6", category: "comfort" },
  { ref: "jeremiah 29:11", fullRef: "jeremiah 29:10-14", category: "hope" },
  { ref: "romans 8:28", fullRef: "romans 8:26-39", category: "faith" },
  { ref: "matthew 6:26", fullRef: "matthew 6:25-34", category: "trust" },
  { ref: "joshua 1:9", fullRef: "joshua 1:6-18", category: "courage" },
  { ref: "2 timothy 1:7", fullRef: "2 timothy 1:3-14", category: "courage" },
  { ref: "isaiah 40:31", fullRef: "isaiah 40:28-31", category: "strength" },
  { ref: "romans 12:2", fullRef: "romans 12:1-8", category: "transformation" },
  { ref: "psalm 139:14", fullRef: "psalm 139:13-18", category: "identity" },
  { ref: "ephesians 2:10", fullRef: "ephesians 2:8-22", category: "purpose" },
  { ref: "1 peter 5:7", fullRef: "1 peter 5:6-11", category: "peace" },
  { ref: "hebrews 11:1", fullRef: "hebrews 11:1-6", category: "faith" },
  { ref: "psalm 46:10", fullRef: "psalm 46:7-11", category: "peace" },
  { ref: "matthew 5:16", fullRef: "matthew 5:14-20", category: "purpose" }
];

export const useBibleVerses = (selectedTranslation: string = "esv", selectedCategory: string = "all", isFullPassage: boolean = false) => {
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
      
      const fetchPromises = selectedRefs.map(async ({ ref, fullRef, category }) => {
        // Use full reference if isFullPassage is true, otherwise use short reference
        const referenceToFetch = isFullPassage ? fullRef : ref;
        
        const apiUrl = selectedTranslation === "kjv" 
          ? `https://bible-api.com/${encodeURIComponent(referenceToFetch)}?translation=kjv`
          : `https://bible-api.com/${encodeURIComponent(referenceToFetch)}`;
        
        console.log(`Fetching: ${apiUrl}`);
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${referenceToFetch}`);
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
  }, [selectedTranslation, selectedCategory, isFullPassage]);

  return {
    bibleVerses,
    isLoadingVerses,
    versesError,
    fetchBibleVerses,
    getAvailableCategories
  };
};
