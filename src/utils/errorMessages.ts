/**
 * @deprecated Import ERROR_MESSAGES from '@/lib/errors/ErrorHandler' instead
 * This file is kept for backward compatibility
 */

import { ERROR_MESSAGES } from '@/lib/errors/ErrorHandler';

export { ERROR_MESSAGES };

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;

export const getErrorMessage = (error: any): string => {
  if (!navigator.onLine) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  if (error?.message?.includes('JWT') || 
      error?.message?.includes('token') ||
      error?.message?.includes('unauthorized')) {
    return ERROR_MESSAGES.AUTH_EXPIRED;
  }
  
  if (error?.message?.includes('timeout') || 
      error?.code === 'ETIMEDOUT') {
    return ERROR_MESSAGES.TIMEOUT;
  }
  
  if (error?.code === 'PGRST116') {
    return ERROR_MESSAGES.DATA_LOAD_FAILED;
  }
  
  if (error?.message && error.message.length < 100 && !error.message.includes('stack')) {
    return error.message;
  }
  
  return ERROR_MESSAGES.GENERIC_ERROR;
};

export const getUserFriendlyError = (context: string, error: any): string => {
  const baseMessage = getErrorMessage(error);
  
  if (baseMessage === ERROR_MESSAGES.GENERIC_ERROR && context) {
    return `Unable to ${context}. Please try again.`;
  }
  
  return baseMessage;
};
