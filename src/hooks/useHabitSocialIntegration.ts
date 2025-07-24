import { useEffect } from 'react';
import { useSocialPosts } from './useSocialPosts';
import { calculateStreakForDateV2 } from '@/utils/habitStreaksV2';
import { getHabitActivitiesV2 } from '@/utils/habitActivityV2';

interface HabitCompletionEvent extends CustomEvent {
  detail: {
    category: string;
    status: 'completed' | 'failed' | 'empty';
    date: string;
  };
}

export const useHabitSocialIntegration = () => {
  const { createHabitPost } = useSocialPosts();

  // Determine if completion is a milestone
  const isMilestone = (streak: number): boolean => {
    if (streak <= 0) return false;
    
    // Define milestone thresholds
    const milestones = [7, 14, 21, 30, 50, 75, 100, 150, 200, 365, 500, 1000];
    return milestones.includes(streak);
  };

  // Generate milestone message
  const getMilestoneMessage = (habitName: string, streak: number): string => {
    const messages = {
      7: `One week strong! 💪 ${streak} days of ${habitName}`,
      14: `Two weeks of consistency! 🔥 ${streak} days of ${habitName}`,
      21: `Three weeks of building habits! ⭐ ${streak} days of ${habitName}`,
      30: `One month milestone! 🏆 ${streak} days of ${habitName}`,
      50: `50 days of dedication! 🎯 Amazing progress on ${habitName}`,
      75: `75 days of consistency! 💎 You're crushing ${habitName}`,
      100: `100 DAYS! 🎉 Triple digits for ${habitName}!`,
      150: `150 days of pure dedication! 🚀 ${habitName} mastery`,
      200: `200 days strong! 💪 ${habitName} has become second nature`,
      365: `ONE FULL YEAR! 🎊 365 days of ${habitName} - incredible!`,
      500: `500 days of excellence! 👑 ${habitName} legend status`,
      1000: `1000 DAYS! 🏆 Ultimate ${habitName} master!`
    };

    return messages[streak as keyof typeof messages] || `${streak} days of ${habitName}! 🔥`;
  };

  // Generate regular completion message
  const getCompletionMessage = (habitName: string, streak: number): string => {
    const messages = [
      `Crushed another ${habitName} session! 💪`,
      `${habitName} complete! Keeping the momentum going 🔥`,
      `Another day, another ${habitName} win! ⭐`,
      `${habitName} ✅ - consistency is key!`,
      `Locked in another ${habitName} session! 🎯`,
      `${habitName} done! Small wins add up 📈`,
      `Daily ${habitName} complete! Building that habit 🏗️`,
      `${habitName} in the books! 📚`,
      `Another step forward with ${habitName}! 👏`,
      `${habitName} accomplished! Progress over perfection 💯`
    ];

    const baseMessage = messages[Math.floor(Math.random() * messages.length)];
    
    if (streak > 1) {
      return `${baseMessage} (${streak} day streak!)`;
    }
    
    return baseMessage;
  };

  // Determine habit category/type for better post categorization
  const getHabitType = (habitName: string): string => {
    const typeMap: Record<string, string> = {
      'WORKOUT': 'fitness',
      'workout': 'fitness',
      'exercise': 'fitness',
      'gym': 'fitness',
      'run': 'fitness',
      'yoga': 'fitness',
      'DEVOTIONS': 'spiritual',
      'devotions': 'spiritual',
      'prayer': 'spiritual',
      'meditation': 'meditation',
      'meditate': 'meditation',
      'mindfulness': 'mindfulness',
      'READ': 'reading',
      'reading': 'reading',
      'book': 'reading',
      'study': 'education',
      'learn': 'education',
      'water': 'health',
      'sleep': 'health',
      'nutrition': 'nutrition',
      'diet': 'nutrition',
      'meal': 'nutrition',
      'journal': 'journaling',
      'write': 'journaling'
    };

    const habitLower = habitName.toLowerCase();
    
    // Check for exact matches first
    if (typeMap[habitLower]) {
      return typeMap[habitLower];
    }

    // Check for partial matches
    for (const [key, value] of Object.entries(typeMap)) {
      if (habitLower.includes(key) || key.includes(habitLower)) {
        return value;
      }
    }

    return 'personal';
  };

  // Handle habit completion events
  const handleHabitCompletion = async (event: HabitCompletionEvent) => {
    const { category, status, date } = event.detail;

    // Only create posts for completed habits
    if (status !== 'completed') return;

    try {
      // Calculate current streak for this completion using habit_id
      const completionDate = new Date(date);
      const activities = getHabitActivitiesV2();
      const habitActivity = activities.find(a => a.habitName === category && a.habitId);
      
      if (!habitActivity?.habitId) {
        console.warn(`No habit_id found for ${category}, skipping social post`);
        return;
      }
      
      const streak = calculateStreakForDateV2(habitActivity.habitId, completionDate);
      
      console.log(`Habit completed: ${category}, streak: ${streak}`);

      // Determine if this is a milestone
      const isMilestoneCompletion = isMilestone(streak);
      
      // Generate appropriate message
      const content = isMilestoneCompletion 
        ? getMilestoneMessage(category, streak)
        : getCompletionMessage(category, streak);

      // Add motivational caption for milestones
      const caption = isMilestoneCompletion 
        ? `Every day counts! This milestone represents dedication, consistency, and the power of small actions. Here's to the next chapter! 🌟`
        : null;

      // Create the social post
      await createHabitPost(
        category,
        getHabitType(category),
        streak
      );

      console.log(`Created social post for ${category} completion (streak: ${streak})`);
    } catch (error) {
      console.error('Failed to create social post for habit completion:', error);
    }
  };

  // Set up event listener for habit completions
  useEffect(() => {
    const handleHabitChange = (event: Event) => {
      handleHabitCompletion(event as HabitCompletionEvent);
    };

    window.addEventListener('habitStatusChanged', handleHabitChange);

    return () => {
      window.removeEventListener('habitStatusChanged', handleHabitChange);
    };
  }, [createHabitPost]);

  // Function to manually create a post for a past habit completion
  const shareHabitMilestone = async (habitName: string, date?: Date) => {
    try {
      const targetDate = date || new Date();
      const activities = getHabitActivitiesV2();
      const habitActivity = activities.find(a => a.habitName === habitName && a.habitId);
      
      if (!habitActivity?.habitId) {
        throw new Error(`No habit_id found for ${habitName}`);
      }
      
      const streak = calculateStreakForDateV2(habitActivity.habitId, targetDate);
      
      if (streak === 0) {
        throw new Error('Cannot share milestone for incomplete habit');
      }

      const isMilestoneCompletion = isMilestone(streak);
      const content = isMilestoneCompletion 
        ? getMilestoneMessage(habitName, streak)
        : getCompletionMessage(habitName, streak);

      const caption = isMilestoneCompletion 
        ? `Celebrating this milestone! ${streak} days of consistent effort and growth. 🎉`
        : `Sharing my progress - ${streak} days of building better habits! 💪`;

      await createHabitPost(habitName, getHabitType(habitName), streak);
      
      return { success: true, streak, isMilestone: isMilestoneCompletion };
    } catch (error) {
      console.error('Failed to share habit milestone:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  // Get user's current streaks for sharing using habit_id
  const getCurrentStreaks = () => {
    const activities = getHabitActivitiesV2();
    const today = new Date();
    
    // Group by habit_id when available, fallback to habit_name
    const habitGroups = new Map<string, { habitName: string; habitId?: string }>();
    activities.forEach(activity => {
      const key = activity.habitId || activity.habitName;
      if (!habitGroups.has(key)) {
        habitGroups.set(key, { 
          habitName: activity.habitName, 
          habitId: activity.habitId 
        });
      }
    });
    
    return Array.from(habitGroups.values()).map(({ habitName, habitId }) => {
      const streak = habitId 
        ? calculateStreakForDateV2(habitId, today)
        : 0; // Fallback for legacy data without habit_id
      return {
        habitName,
        streak,
        isMilestone: isMilestone(streak),
        habitType: getHabitType(habitName)
      };
    }).filter(habit => habit.streak > 0);
  };

  return {
    shareHabitMilestone,
    getCurrentStreaks,
    isMilestone
  };
};