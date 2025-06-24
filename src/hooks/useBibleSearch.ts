
import { useState } from "react";

interface SearchResult {
  reference: string;
  text: string;
  translation_name: string;
  category?: string;
}

export const useBibleSearch = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const searchBible = async (keyword: string, translation: string = "web") => {
    if (!keyword.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      // For demo purposes, we'll search through a larger set of verses
      // In a real app, you'd want to use a proper Bible API with search functionality
      const searchVerses = [
        { ref: "john 3:16", category: "love" },
        { ref: "romans 8:28", category: "hope" },
        { ref: "philippians 4:13", category: "strength" },
        { ref: "jeremiah 29:11", category: "hope" },
        { ref: "psalm 23:1-6", category: "comfort" },
        { ref: "1 corinthians 13:4-8", category: "love" },
        { ref: "ephesians 2:8-9", category: "grace" },
        { ref: "romans 3:23", category: "grace" },
        { ref: "2 timothy 1:7", category: "courage" },
        { ref: "isaiah 41:10", category: "fear" },
        { ref: "matthew 11:28-30", category: "rest" },
        { ref: "proverbs 3:5-6", category: "trust" },
        { ref: "psalms 46:10", category: "peace" },
        { ref: "romans 12:2", category: "transformation" },
        { ref: "galatians 2:20", category: "identity" },
        { ref: "1 peter 5:7", category: "anxiety" },
        { ref: "joshua 1:9", category: "courage" },
        { ref: "psalm 139:13-14", category: "identity" }
      ];

      // Filter verses that might contain the keyword (simplified search)
      const filteredVerses = searchVerses.filter(verse => 
        verse.category.toLowerCase().includes(keyword.toLowerCase()) ||
        verse.ref.toLowerCase().includes(keyword.toLowerCase())
      );

      const fetchPromises = filteredVerses.slice(0, 10).map(async ({ ref, category }) => {
        const apiUrl = translation === "kjv" 
          ? `https://bible-api.com/${encodeURIComponent(ref)}?translation=kjv`
          : `https://bible-api.com/${encodeURIComponent(ref)}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${ref}`);
        }
        const result = await response.json();
        return { ...result, category };
      });

      const results = await Promise.all(fetchPromises);
      
      const formattedResults: SearchResult[] = results.map((result) => ({
        reference: result.reference,
        text: result.text.trim(),
        translation_name: getTranslationDisplayName(translation),
        category: result.category
      }));

      setSearchResults(formattedResults);
    } catch (error) {
      console.error('Error searching Bible:', error);
      setSearchError('Failed to search verses. Please try again.');
    } finally {
      setIsSearching(false);
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

  const highlightKeyword = (text: string, keyword: string) => {
    if (!keyword) return text;
    
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
  };

  return {
    searchResults,
    isSearching,
    searchError,
    searchBible,
    highlightKeyword
  };
};
