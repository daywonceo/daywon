import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserMention {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
}

interface MentionMatch {
  user: UserMention;
  startIndex: number;
  endIndex: number;
  query: string;
}

export const useMentions = () => {
  const [searchResults, setSearchResults] = useState<UserMention[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');

  // Search users by username and display_name prefix
  const searchUsers = useCallback(async (query: string): Promise<UserMention[]> => {
    if (!query || query.length < 2) return [];

    try {
      const { data, error } = await supabase.rpc('search_users_for_mentions', {
        search_query: query
      });

      if (error) {
        console.error('Error searching users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in user search:', error);
      return [];
    }
  }, []);

  // Debounced search with caching
  useEffect(() => {
    if (!currentQuery || currentQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      const results = await searchUsers(currentQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [currentQuery, searchUsers]);

  // Detect @ mentions in text
  const detectMentions = useCallback((text: string, cursorPosition: number) => {
    const beforeCursor = text.slice(0, cursorPosition);
    const mentionRegex = /@(\w{2,}?)$/;
    const match = beforeCursor.match(mentionRegex);
    
    if (match) {
      const query = match[1];
      const startIndex = beforeCursor.lastIndexOf('@');
      return {
        isActive: true,
        query,
        startIndex,
        endIndex: cursorPosition
      };
    }
    
    return { isActive: false, query: '', startIndex: -1, endIndex: -1 };
  }, []);

  // Replace mention text with username
  const insertMention = useCallback((
    text: string, 
    mention: { startIndex: number; endIndex: number }, 
    username: string
  ): string => {
    const before = text.slice(0, mention.startIndex);
    const after = text.slice(mention.endIndex);
    return `${before}@${username} ${after}`;
  }, []);

  // Parse mentions from text for rendering
  const parseMentions = useCallback((text: string): (string | { type: 'mention'; username: string })[] => {
    const mentionRegex = /@(\w+)/g;
    const parts: (string | { type: 'mention'; username: string })[] = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      
      // Add mention
      parts.push({
        type: 'mention',
        username: match[1]
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    
    return parts;
  }, []);

  return {
    searchResults,
    isSearching,
    searchUsers,
    detectMentions,
    insertMention,
    parseMentions,
    setCurrentQuery
  };
};