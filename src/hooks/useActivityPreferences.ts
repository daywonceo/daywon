import { useState, useEffect } from 'react';
import { UserActivityPreferences, ActivityCategory } from '@/data/enhancedActivities';

const DEFAULT_PREFERENCES: UserActivityPreferences = {
  preferredCategories: [],
  availableTime: 'flexible',
  difficultyLevel: 'mixed',
  preferredLocation: 'both',
  preferredSocialAspect: 'both',
  budget: 'free',
  skipCompleted: true,
  favoriteActivities: [],
  completedActivities: [],
  inProgressActivities: []
};

export const useActivityPreferences = () => {
  const [preferences, setPreferencesState] = useState<UserActivityPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPreferences = () => {
      try {
        const saved = localStorage.getItem('activityPreferences');
        if (saved) {
          const parsed = JSON.parse(saved);
          setPreferencesState({ ...DEFAULT_PREFERENCES, ...parsed });
        }
      } catch (error) {
        console.error('Error loading activity preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const setPreferences = (newPreferences: Partial<UserActivityPreferences>) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferencesState(updated);
    localStorage.setItem('activityPreferences', JSON.stringify(updated));
  };

  const addFavorite = (activityId: string) => {
    if (!preferences.favoriteActivities.includes(activityId)) {
      setPreferences({
        favoriteActivities: [...preferences.favoriteActivities, activityId]
      });
    }
  };

  const removeFavorite = (activityId: string) => {
    setPreferences({
      favoriteActivities: preferences.favoriteActivities.filter(id => id !== activityId)
    });
  };

  const markCompleted = (activityId: string) => {
    const newCompleted = [...preferences.completedActivities];
    const newInProgress = preferences.inProgressActivities.filter(id => id !== activityId);
    
    if (!newCompleted.includes(activityId)) {
      newCompleted.push(activityId);
    }

    setPreferences({
      completedActivities: newCompleted,
      inProgressActivities: newInProgress
    });
  };

  const markInProgress = (activityId: string) => {
    if (!preferences.inProgressActivities.includes(activityId) && 
        !preferences.completedActivities.includes(activityId)) {
      setPreferences({
        inProgressActivities: [...preferences.inProgressActivities, activityId]
      });
    }
  };

  const resetProgress = (activityId: string) => {
    setPreferences({
      completedActivities: preferences.completedActivities.filter(id => id !== activityId),
      inProgressActivities: preferences.inProgressActivities.filter(id => id !== activityId)
    });
  };

  const updateMood = (mood: UserActivityPreferences['currentMood']) => {
    setPreferences({ currentMood: mood });
  };

  return {
    preferences,
    isLoading,
    setPreferences,
    addFavorite,
    removeFavorite,
    markCompleted,
    markInProgress,
    resetProgress,
    updateMood
  };
};