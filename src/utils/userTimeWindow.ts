import { supabase } from '@/integrations/supabase/client';

export interface UserTimeWindow {
  startDate: Date;
  isNewUser: boolean; // true if user has been on app for less than 1 year
  totalDaysAvailable: number;
}

/**
 * Calculate the appropriate time window for habit statistics based on user's account creation date
 * 
 * Rules:
 * - If user has been on app < 1 year: use account creation date as start
 * - If user has been on app >= 1 year: use rolling 365-day window from current date
 */
export const getUserTimeWindow = async (timeframe: "week" | "month" | "year"): Promise<UserTimeWindow> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !user.created_at) {
      // Fallback to standard timeframe if no user data
      const now = new Date();
      let startDate: Date;
      
      switch (timeframe) {
        case "week":
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "year":
          startDate = new Date(now);
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      const totalDaysAvailable = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        startDate,
        isNewUser: false,
        totalDaysAvailable
      };
    }

    const now = new Date();
    const accountCreationDate = new Date(user.created_at);
    const daysSinceCreation = Math.floor((now.getTime() - accountCreationDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // If user has been on the app for less than 1 year (365 days)
    const isNewUser = daysSinceCreation < 365;
    
    let startDate: Date;
    
    if (isNewUser) {
      // For new users: always start from account creation date, regardless of timeframe
      startDate = accountCreationDate;
    } else {
      // For established users: use standard rolling windows
      switch (timeframe) {
        case "week":
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "year":
          startDate = new Date(now);
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
    }
    
    // Ensure start date is never before account creation
    if (startDate < accountCreationDate) {
      startDate = accountCreationDate;
    }
    
    const totalDaysAvailable = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      startDate,
      isNewUser,
      totalDaysAvailable
    };
    
  } catch (error) {
    console.error('Error calculating user time window:', error);
    
    // Fallback to standard calculation
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    const totalDaysAvailable = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      startDate,
      isNewUser: false,
      totalDaysAvailable
    };
  }
};

/**
 * Sync version that gets cached user creation date from local storage if available
 */
export const getUserTimeWindowSync = (timeframe: "week" | "month" | "year"): UserTimeWindow => {
  const now = new Date();
  
  // Try to get cached user creation date
  const cachedUserData = localStorage.getItem('user_creation_date');
  let accountCreationDate: Date | null = null;
  
  if (cachedUserData) {
    try {
      accountCreationDate = new Date(cachedUserData);
    } catch (error) {
      console.error('Error parsing cached user creation date:', error);
    }
  }
  
  if (!accountCreationDate) {
    // Fallback to standard timeframe calculation
    let startDate: Date;
    
    switch (timeframe) {
      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    const totalDaysAvailable = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      startDate,
      isNewUser: false,
      totalDaysAvailable
    };
  }
  
  const daysSinceCreation = Math.floor((now.getTime() - accountCreationDate.getTime()) / (1000 * 60 * 60 * 24));
  const isNewUser = daysSinceCreation < 365;
  
  let startDate: Date;
  
  if (isNewUser) {
    startDate = accountCreationDate;
  } else {
    switch (timeframe) {
      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
  }
  
  // Ensure start date is never before account creation
  if (startDate < accountCreationDate) {
    startDate = accountCreationDate;
  }
  
  const totalDaysAvailable = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    startDate,
    isNewUser,
    totalDaysAvailable
  };
};

/**
 * Cache user creation date in localStorage for sync operations
 */
export const cacheUserCreationDate = (createdAt: string) => {
  localStorage.setItem('user_creation_date', createdAt);
};