import { useEffect } from 'react';

// Hook for persisting onboarding draft state
export function useOnboardingPersistence() {
  const STORAGE_KEY = 'onboarding_draft';

  const saveDraft = (data: any) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...data,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.warn('Failed to save onboarding draft:', error);
    }
  };

  const loadDraft = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only restore if less than 24 hours old
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Failed to load onboarding draft:', error);
    }
    return null;
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear onboarding draft:', error);
    }
  };

  // Save draft on page visibility change (backgrounding)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // State will be saved by parent component
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return { saveDraft, loadDraft, clearDraft };
}