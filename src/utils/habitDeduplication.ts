
// Utility functions for habit deduplication and normalization

export const normalizeHabitName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    // Remove plural 's' if it exists (simple approach)
    .replace(/s$/, '')
    // Remove common variations
    .replace(/workout/g, 'workout')
    .replace(/devotion/g, 'devotion')
    .replace(/read/g, 'read');
};

export const areHabitsEquivalent = (habit1: string, habit2: string): boolean => {
  const normalized1 = normalizeHabitName(habit1);
  const normalized2 = normalizeHabitName(habit2);
  return normalized1 === normalized2;
};

export const findDuplicateHabit = (newHabitName: string, existingHabits: { name: string }[]): { name: string } | null => {
  return existingHabits.find(habit => 
    areHabitsEquivalent(newHabitName, habit.name)
  ) || null;
};

// Get the preferred name for a habit (usually the first one alphabetically or most common)
export const getPreferredHabitName = (duplicateNames: string[]): string => {
  // Preference order: capitalize first letter, singular form
  const preferences = ['WORKOUT', 'DEVOTIONS', 'READ'];
  
  for (const preferred of preferences) {
    const match = duplicateNames.find(name => 
      normalizeHabitName(name) === normalizeHabitName(preferred)
    );
    if (match) return preferred;
  }
  
  // Default: return the version with proper capitalization
  const sorted = duplicateNames.sort((a, b) => {
    // Prefer capitalized versions
    const aCapitalized = a.charAt(0).toUpperCase() === a.charAt(0);
    const bCapitalized = b.charAt(0).toUpperCase() === b.charAt(0);
    
    if (aCapitalized && !bCapitalized) return -1;
    if (!aCapitalized && bCapitalized) return 1;
    
    // Prefer singular versions (shorter names)
    return a.length - b.length;
  });
  
  return sorted[0];
};
