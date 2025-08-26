export interface HabitTemplate {
  id: string;
  name: string;
  category: 'Physical' | 'Mental' | 'Professional' | 'Financial' | 'Relational';
  description?: string;
}

export const HABIT_TEMPLATES: HabitTemplate[] = [
  // Physical habits
  { id: 'physical-workout', name: 'Workout', category: 'Physical' },
  { id: 'physical-drink-water', name: 'Drink Water', category: 'Physical' },
  { id: 'physical-stretch', name: 'Stretch', category: 'Physical' },
  { id: 'physical-morning-walk', name: 'Morning Walk', category: 'Physical' },
  { id: 'physical-evening-walk', name: 'Evening Walk', category: 'Physical' },
  { id: 'physical-sleep-8-hours', name: 'Sleep 8 Hours', category: 'Physical' },
  { id: 'physical-healthy-breakfast', name: 'Healthy Breakfast', category: 'Physical' },
  { id: 'physical-take-vitamins', name: 'Take Vitamins', category: 'Physical' },
  { id: 'physical-walking-after-lunch', name: 'Walking after Lunch', category: 'Physical' },
  { id: 'physical-yoga', name: 'Yoga', category: 'Physical' },
  { id: 'physical-no-caffeine-after-4pm', name: 'No Caffeine After 4pm', category: 'Physical' },
  { id: 'physical-no-sugar', name: 'No Sugar', category: 'Physical' },
  { id: 'physical-eat-fruits', name: 'Eat Fruits', category: 'Physical' },

  // Mental habits
  { id: 'mental-gratitude-journal', name: 'Gratitude Journal', category: 'Mental' },
  { id: 'mental-practice-mindfulness', name: 'Practice Mindfulness', category: 'Mental' },
  { id: 'mental-journal', name: 'Journal', category: 'Mental' },
  { id: 'mental-daily-reflection', name: 'Daily Reflection', category: 'Mental' },
  { id: 'mental-devotion', name: 'Devotion', category: 'Mental' },
  { id: 'mental-read', name: 'Read', category: 'Mental' },
  { id: 'mental-meditate', name: 'Meditate', category: 'Mental' },
  { id: 'mental-mindful-breathing', name: 'Mindful Breathing', category: 'Mental' },

  // Professional habits
  { id: 'professional-focus-work', name: 'Focus Work', category: 'Professional' },
  { id: 'professional-plan-tomorrow', name: 'Plan Tomorrow', category: 'Professional' },
  { id: 'professional-declutter-desk', name: 'Declutter Desk', category: 'Professional' },
  { id: 'professional-organize-workspace', name: 'Organize Workspace', category: 'Professional' },
  { id: 'professional-set-daily-priority', name: 'Set a Daily Priority', category: 'Professional' },

  // Financial habits
  { id: 'financial-budget-review', name: 'Budget Review', category: 'Financial' },
  { id: 'financial-meal-prep', name: 'Meal Prep', category: 'Financial' },
  { id: 'financial-track-daily-spending', name: 'Track Daily Spending', category: 'Financial' },
  { id: 'financial-review-subscriptions', name: 'Review Subscriptions', category: 'Financial' },
  { id: 'financial-set-weekly-savings-goal', name: 'Set a Weekly Savings Goal', category: 'Financial' },

  // Relational habits
  { id: 'relational-family-time', name: 'Family Time', category: 'Relational' },
  { id: 'relational-call-loved-one', name: 'Call a Loved One', category: 'Relational' },
  { id: 'relational-practice-active-listening', name: 'Practice active listening today', category: 'Relational' },
  { id: 'relational-send-thoughtful-message', name: 'Send a thoughtful message to someone', category: 'Relational' },
  { id: 'relational-schedule-catchup', name: 'Schedule a catch-up with a friend', category: 'Relational' }
];

export const getHabitTemplatesByCategory = (category?: string): HabitTemplate[] => {
  if (!category) return HABIT_TEMPLATES;
  return HABIT_TEMPLATES.filter(habit => habit.category === category);
};

export const getAllHabitTemplateNames = (): string[] => {
  return HABIT_TEMPLATES.map(habit => habit.name);
};

// Legacy support - maintain backward compatibility
export const SUGGESTED_HABITS = getAllHabitTemplateNames();