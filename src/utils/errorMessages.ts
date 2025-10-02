// User-friendly error messages for common scenarios

export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: "Unable to connect. Please check your internet connection and try again.",
  TIMEOUT: "The request took too long. Please try again.",
  
  // Authentication errors
  AUTH_EXPIRED: "Your session has expired. Please sign in again.",
  AUTH_INVALID: "Authentication failed. Please sign in again.",
  AUTH_REQUIRED: "Please sign in to access this feature.",
  
  // Habit tracking errors
  HABIT_UPDATE_FAILED: "Unable to update habit. Your progress is saved locally and will sync when connection is restored.",
  HABIT_CREATE_FAILED: "Unable to create habit. Please try again.",
  HABIT_DELETE_FAILED: "Unable to delete habit. Please try again.",
  HABIT_LOAD_FAILED: "Unable to load your habits. Please refresh the page.",
  
  // Social features errors
  POST_CREATE_FAILED: "Unable to post. Please try again.",
  COMMENT_FAILED: "Unable to add comment. Please try again.",
  FOLLOW_FAILED: "Unable to follow user. Please try again.",
  CHALLENGE_JOIN_FAILED: "Unable to join challenge. Please try again.",
  
  // Workout errors
  WORKOUT_START_FAILED: "Unable to start workout. Please try again.",
  WORKOUT_SAVE_FAILED: "Unable to save workout. Your progress is saved locally.",
  EXERCISE_LOAD_FAILED: "Unable to load exercises. Please try again.",
  
  // Recipe errors
  RECIPE_SAVE_FAILED: "Unable to save recipe. Please try again.",
  RECIPE_LOAD_FAILED: "Unable to load recipes. Please try again.",
  
  // Generic errors
  GENERIC_ERROR: "Something went wrong. Please try again.",
  DATA_SAVE_FAILED: "Unable to save. Please try again.",
  DATA_LOAD_FAILED: "Unable to load data. Please refresh the page.",
  
  // Validation errors
  INVALID_INPUT: "Please check your input and try again.",
  REQUIRED_FIELD: "This field is required.",
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;

export const getErrorMessage = (error: any): string => {
  // Check for network errors
  if (!navigator.onLine) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  // Check for authentication errors
  if (error?.message?.includes('JWT') || 
      error?.message?.includes('token') ||
      error?.message?.includes('unauthorized')) {
    return ERROR_MESSAGES.AUTH_EXPIRED;
  }
  
  // Check for timeout
  if (error?.message?.includes('timeout') || 
      error?.code === 'ETIMEDOUT') {
    return ERROR_MESSAGES.TIMEOUT;
  }
  
  // Check for Supabase-specific errors
  if (error?.code === 'PGRST116') {
    return ERROR_MESSAGES.DATA_LOAD_FAILED;
  }
  
  // Return the error message if it's user-friendly, otherwise use generic
  if (error?.message && error.message.length < 100 && !error.message.includes('stack')) {
    return error.message;
  }
  
  return ERROR_MESSAGES.GENERIC_ERROR;
};

export const getUserFriendlyError = (context: string, error: any): string => {
  const baseMessage = getErrorMessage(error);
  
  // Add context if it's a generic error
  if (baseMessage === ERROR_MESSAGES.GENERIC_ERROR && context) {
    return `Unable to ${context}. Please try again.`;
  }
  
  return baseMessage;
};
