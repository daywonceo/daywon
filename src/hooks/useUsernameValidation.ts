import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { trackEvent } from '@/utils/analytics';

interface UseUsernameValidationReturn {
  username: string;
  setUsername: (username: string) => void;
  isChecking: boolean;
  isAvailable: boolean | null;
  error: string | null;
  errorCode: string | null;
  suggestions: string[];
}

export const useUsernameValidation = (displayName: string = '', userId?: string): UseUsernameValidationReturn => {
  const [username, setUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Generate username suggestions based on display name
  const generateSuggestions = (name: string): string[] => {
    if (!name) return [];
    
    const baseUsername = name
      .toLowerCase()
      .replace(/[^a-z0-9._]/g, '')
      .slice(0, 12);
    
    if (!baseUsername || baseUsername.length < 3) return [];
    
    return [
      baseUsername,
      `${baseUsername}${Math.floor(Math.random() * 99) + 1}`,
      `${baseUsername}.${new Date().getFullYear()}`,
      `${baseUsername}_${Math.floor(Math.random() * 999) + 100}`,
      `user_${baseUsername}`
    ].filter(suggestion => suggestion.length >= 3 && suggestion.length <= 30);
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

  // Check username availability using enhanced validation
  const checkAvailability = async (value: string) => {
    if (!value) return;
    
    setIsChecking(true);
    setError(null);
    setErrorCode(null);

    try {
      // Track username check analytics
      trackEvent('profile.username_check', {
        username_length: value.length,
        has_special_chars: /[._]/.test(value)
      });

      const { data, error: rpcError } = await supabase.rpc('check_username_availability', {
        username_input: value
      });

      if (rpcError) {
        console.error('Username validation error:', rpcError);
        setError('Error checking username availability');
        setErrorCode('VALIDATION_ERROR');
        setIsAvailable(false);
        return;
      }

      const result = data as { valid: boolean; error?: string; message?: string; suggestions?: string[] };
      setIsAvailable(result.valid);
      
      if (!result.valid) {
        setError(result.message || 'Username is invalid');
        setErrorCode(result.error || 'UNKNOWN_ERROR');
        
        // Use pre-checked suggestions from the server when available
        if (result.suggestions && result.suggestions.length > 0) {
          setSuggestions(result.suggestions);
        } else if (result.error === 'USERNAME_TAKEN' || result.error === 'USERNAME_INVALID') {
          // Fallback to client-side suggestions if server didn't provide any
          const newSuggestions = generateSuggestions(displayName || value);
          setSuggestions(newSuggestions.filter(s => s !== value));
        } else {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Error checking username availability');
      setErrorCode('NETWORK_ERROR');
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
    // Clean input but preserve dots - let server-side validation handle the rest
    const cleanValue = value.toLowerCase().replace(/[^a-z0-9._]/g, '');
    setUsername(cleanValue);
  };

  return {
    username,
    setUsername: handleSetUsername,
    isChecking,
    isAvailable,
    error,
    errorCode,
    suggestions
  };
};