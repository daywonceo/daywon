import { useMemo } from 'react';
import { EnhancedActivity, UserActivityPreferences, ENHANCED_ACTIVITIES } from '@/data/enhancedActivities';

export const useActivityRecommendations = (preferences: UserActivityPreferences) => {
  const recommendations = useMemo(() => {
    let filteredActivities = [...ENHANCED_ACTIVITIES];

    // Skip completed activities if preference is set
    if (preferences.skipCompleted) {
      filteredActivities = filteredActivities.filter(
        activity => !preferences.completedActivities.includes(activity.id)
      );
    }

    // Filter by preferred categories
    if (preferences.preferredCategories.length > 0) {
      filteredActivities = filteredActivities.filter(
        activity => preferences.preferredCategories.includes(activity.category)
      );
    }

    // Filter by available time
    if (preferences.availableTime !== 'flexible') {
      filteredActivities = filteredActivities.filter(activity => {
        const maxTime = activity.duration.unit === 'hours' ? activity.duration.max * 60 : 
                       activity.duration.unit === 'days' ? activity.duration.max * 1440 :
                       activity.duration.max;
        
        switch (preferences.availableTime) {
          case 'quick': return maxTime <= 30;
          case 'medium': return maxTime <= 120;
          case 'long': return maxTime > 120;
          default: return true;
        }
      });
    }

    // Filter by difficulty level
    if (preferences.difficultyLevel !== 'mixed') {
      filteredActivities = filteredActivities.filter(
        activity => activity.difficulty === preferences.difficultyLevel
      );
    }

    // Filter by location preference
    if (preferences.preferredLocation !== 'both') {
      filteredActivities = filteredActivities.filter(
        activity => activity.location === preferences.preferredLocation || activity.location === 'both'
      );
    }

    // Filter by social aspect preference
    if (preferences.preferredSocialAspect !== 'both') {
      filteredActivities = filteredActivities.filter(
        activity => activity.socialAspect === preferences.preferredSocialAspect || activity.socialAspect === 'both'
      );
    }

    // Filter by budget
    const budgetOrder = ['free', 'low', 'medium', 'high'];
    const maxBudgetIndex = budgetOrder.indexOf(preferences.budget);
    filteredActivities = filteredActivities.filter(
      activity => budgetOrder.indexOf(activity.estimatedCost) <= maxBudgetIndex
    );

    // Score activities based on preferences
    const scoredActivities = filteredActivities.map(activity => {
      let score = 0;

      // Boost score for current mood match
      if (preferences.currentMood && activity.mood === preferences.currentMood) {
        score += 10;
      }

      // Boost score for favorite activities
      if (preferences.favoriteActivities.includes(activity.id)) {
        score += 15;
      }

      // Boost score for in-progress activities
      if (preferences.inProgressActivities.includes(activity.id)) {
        score += 5;
      }

      // Consider seasonal relevance
      const currentMonth = new Date().getMonth();
      const currentSeason = currentMonth >= 2 && currentMonth <= 4 ? 'spring' :
                           currentMonth >= 5 && currentMonth <= 7 ? 'summer' :
                           currentMonth >= 8 && currentMonth <= 10 ? 'fall' : 'winter';
      
      if (activity.season === currentSeason || activity.season === 'any') {
        score += 3;
      }

      // Weather consideration (simplified - could be enhanced with weather API)
      if (activity.weatherDependent === false) {
        score += 2; // Slight preference for weather-independent activities
      }

      return { ...activity, score };
    });

    // Sort by score (highest first) and return
    return scoredActivities.sort((a, b) => b.score - a.score);
  }, [preferences]);

  const getRandomActivity = () => {
    if (recommendations.length === 0) return null;
    return recommendations[Math.floor(Math.random() * Math.min(recommendations.length, 5))];
  };

  const getTopRecommendations = (count: number = 10) => {
    return recommendations.slice(0, count);
  };

  const getActivityById = (id: string): EnhancedActivity | null => {
    return ENHANCED_ACTIVITIES.find(activity => activity.id === id) || null;
  };

  const getSimilarActivities = (activityId: string, count: number = 3) => {
    const baseActivity = getActivityById(activityId);
    if (!baseActivity) return [];

    return ENHANCED_ACTIVITIES
      .filter(activity => 
        activity.id !== activityId &&
        (activity.category === baseActivity.category ||
         activity.mood === baseActivity.mood ||
         activity.tags.some(tag => baseActivity.tags.includes(tag)))
      )
      .slice(0, count);
  };

  return {
    recommendations,
    getRandomActivity,
    getTopRecommendations,
    getActivityById,
    getSimilarActivities
  };
};