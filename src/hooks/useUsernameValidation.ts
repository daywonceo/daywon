import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseUsernameValidationReturn {
  username: string;
  setUsername: (username: string) => void;
  isChecking: boolean;
  isAvailable: boolean | null;
  error: string | null;
  suggestions: string[];
}

export const useUsernameValidation = (displayName: string = ''): UseUsernameValidationReturn => {
  const [username, setUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Generate username suggestions based on display name
  const generateSuggestions = (name: string): string[] => {
    if (!name) return [];
    
    const baseUsername = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 12);
    
    if (!baseUsername) return [];
    
    return [
      baseUsername,
      `${baseUsername}${Math.floor(Math.random() * 99) + 1}`,
      `${baseUsername}${new Date().getFullYear()}`,
      `${baseUsername}${Math.floor(Math.random() * 999) + 100}`,
      `${baseUsername}_${Math.floor(Math.random() * 99) + 1}`
    ];
  };

  // Auto-suggest username when display name changes
  useEffect(() => {
    if (displayName && !username) {
      const suggestions = generateSuggestions(displayName);
      setSuggestions(suggestions);
      if (suggestions.length > 0) {
        setUsername(suggestions[0]);
      }
    }
  }, [displayName, username]);

  // Validate username format
  const validateUsernameFormat = (value: string): string | null => {
    if (!value) return 'Username is required';
    if (value.length < 3) return 'Username must be at least 3 characters';
    if (value.length > 20) return 'Username must be 20 characters or less';
    if (!/^[a-z0-9_]+$/.test(value)) return 'Username can only contain lowercase letters, numbers, and underscores';
    if (value.startsWith('_') || value.endsWith('_')) return 'Username cannot start or end with underscore';
    return null;
  };

  // Check username availability
  const checkAvailability = async (value: string) => {
    if (!value) return;
    
    const formatError = validateUsernameFormat(value);
    if (formatError) {
      setError(formatError);
      setIsAvailable(false);
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', value.toLowerCase())
        .maybeSingle();

      if (queryError) {
        setError('Error checking username availability');
        setIsAvailable(false);
      } else {
        const available = !data;
        setIsAvailable(available);
        if (!available) {
          setError('Username is already taken');
          // Generate new suggestions when current username is taken
          const newSuggestions = generateSuggestions(displayName || value);
          setSuggestions(newSuggestions.filter(s => s !== value));
        }
      }
    } catch (err) {
      setError('Error checking username availability');
      setIsAvailable(false);
    } finally {
      setIsChecking(false);
    }
  };

  // Debounced username validation
  useEffect(() => {
    if (!username) {
      setIsAvailable(null);
      setError(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      checkAvailability(username);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleSetUsername = (value: string) => {
    // Convert to lowercase and remove invalid characters
    const cleanValue = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(cleanValue);
  };

  return {
    username,
    setUsername: handleSetUsername,
    isChecking,
    isAvailable,
    error,
    suggestions
  };
};