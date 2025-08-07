export interface HabitSuggestion {
  habit: string;
  description: string;
  reasoning: string;
}

export interface CadenceFocusMapping {
  [cadence: string]: {
    [focusArea: string]: HabitSuggestion;
  };
}

export const HABIT_SUGGESTIONS: CadenceFocusMapping = {
  week: {
    Physical: {
      habit: "Drink Water",
      description: "Drink a full glass of water each morning",
      reasoning: "A simple, refreshing start to build momentum"
    },
    Mental: {
      habit: "Gratitude Journal", 
      description: "Write down one thing you're grateful for each morning",
      reasoning: "A quick way to shift your mindset positively"
    },
    Professional: {
      habit: "Set a Daily Priority",
      description: "Choose your most important task each morning",
      reasoning: "Focus your energy on what matters most"
    },
    Financial: {
      habit: "Track Daily Spending",
      description: "Write down what you spend each day",
      reasoning: "Simple awareness to understand your spending patterns"
    },
    Relational: {
      habit: "Send a thoughtful message to someone",
      description: "Send one meaningful message to someone each day",
      reasoning: "Small acts of connection that brighten someone's day"
    }
  },
  month: {
    Physical: {
      habit: "Morning Walk",
      description: "Take a 10-minute walk each morning",
      reasoning: "Build a consistent movement routine that energizes your day"
    },
    Mental: {
      habit: "Journal",
      description: "Write 3 sentences in your journal each day", 
      reasoning: "Develop clarity through consistent reflection"
    },
    Professional: {
      habit: "Plan Tomorrow",
      description: "Spend 5 minutes each evening planning tomorrow",
      reasoning: "Create structure and intention for productive days"
    },
    Financial: {
      habit: "Budget Review",
      description: "Check your budget and spending each week",
      reasoning: "Build awareness and control over your finances"
    },
    Relational: {
      habit: "Family Time",
      description: "Spend 15 minutes of focused time with family daily",
      reasoning: "Strengthen bonds through consistent quality time"
    }
  },
  season: {
    Physical: {
      habit: "Workout",
      description: "Complete a 20-30 minute workout 4 days per week",
      reasoning: "Build lasting strength and fitness habits"
    },
    Mental: {
      habit: "Practice Mindfulness",
      description: "Practice 10 minutes of mindfulness or meditation daily",
      reasoning: "Develop mental resilience and inner peace"
    },
    Professional: {
      habit: "Focus Work",
      description: "Plan your top 3 tasks the night before workdays",
      reasoning: "Create systems for sustained productivity and achievement"
    },
    Financial: {
      habit: "Set a Weekly Savings Goal",
      description: "Set and track a specific savings target each week",
      reasoning: "Build long-term financial security through consistent saving"
    },
    Relational: {
      habit: "Schedule a catch-up with a friend",
      description: "Schedule one meaningful conversation with a friend each week",
      reasoning: "Nurture important relationships through intentional connection"
    }
  },
  ongoing: {
    Physical: {
      habit: "Sleep 8 Hours",
      description: "Maintain a consistent 8-hour sleep schedule",
      reasoning: "Foundation for lifelong health and wellbeing"
    },
    Mental: {
      habit: "Daily Reflection",
      description: "Reflect on your day and growth each evening",
      reasoning: "Cultivate self-awareness as a way of being"
    },
    Professional: {
      habit: "Organize Workspace",
      description: "Keep your workspace clean and organized daily",
      reasoning: "Create an environment that supports your best work"
    },
    Financial: {
      habit: "Review Subscriptions",
      description: "Review and optimize your subscriptions monthly",
      reasoning: "Maintain financial clarity and intentional spending"
    },
    Relational: {
      habit: "Practice active listening today",
      description: "Check in with one person each week",
      reasoning: "Be someone who truly sees and connects with others"
    }
  }
};

// Map focus area IDs from PickFocusScreen to our suggestion categories
const FOCUS_AREA_MAPPING: { [key: string]: string } = {
  move: 'Physical',
  sleep: 'Physical', 
  nutrition: 'Physical',
  mindfulness: 'Mental',
  learning: 'Mental',
  custom: 'Mental' // Default fallback
};

export const getHabitSuggestion = (cadence: string, focusAreaId: string): HabitSuggestion | null => {
  const mappedFocusArea = FOCUS_AREA_MAPPING[focusAreaId] || 'Mental';
  return HABIT_SUGGESTIONS[cadence]?.[mappedFocusArea] || null;
};

export const getDefaultHabitSuggestion = (): HabitSuggestion => {
  return {
    habit: "Drink Water",
    description: "Drink a full glass of water each morning",
    reasoning: "A simple, refreshing way to start building positive habits"
  };
};