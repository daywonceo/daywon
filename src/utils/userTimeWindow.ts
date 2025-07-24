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
 * - Each timeframe shows data strictly for its defined range (7, 30, or 365 days)
 * - Exception: If user hasn't reached the full period since account creation, use account creation date as start
 */
export const getUserTimeWindow = async (timeframe: "week" | "month" | "year"): Promise<UserTimeWindow> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !user.created_at) {
      // Fallback to standard timeframe if no user data
      const now = new Date();
      let daysInPeriod: number;
      
      switch (timeframe) {
        case "week": daysInPeriod = 7; break;
        case "month": daysInPeriod = 30; break;
        case "year": daysInPeriod = 365; break;
      }
      
      const startDate = new Date(now);
      startDate.setDate(now.getDate() - daysInPeriod);
      
      return {
        startDate,
        isNewUser: false,
        totalDaysAvailable: daysInPeriod
      };
    }

    const now = new Date();
    const accountCreationDate = new Date(user.created_at);
    const daysSinceCreation = Math.floor((now.getTime() - accountCreationDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Determine days for this timeframe
    let daysInPeriod: number;
    switch (timeframe) {
      case "week": daysInPeriod = 7; break;
      case "month": daysInPeriod = 30; break;
      case "year": daysInPeriod = 365; break;
    }
    
    // Check if user has been on app long enough for full period
    const hasFullPeriod = daysSinceCreation >= daysInPeriod;
    
    let startDate: Date;
    let totalDaysAvailable: number;
    
    if (hasFullPeriod) {
      // User has been on app long enough - use full period
      startDate = new Date(now);
      startDate.setDate(now.getDate() - daysInPeriod);
      totalDaysAvailable = daysInPeriod;
    } else {
      // User hasn't been on app for full period - start from account creation
      startDate = accountCreationDate;
      totalDaysAvailable = daysSinceCreation + 1; // +1 to include today
    }
    
    return {
      startDate,
      isNewUser: !hasFullPeriod,
      totalDaysAvailable
    };
    
  } catch (error) {
    console.error('Error calculating user time window:', error);
    
    // Fallback to standard calculation
    const now = new Date();
    let daysInPeriod: number;
    
    switch (timeframe) {
      case "week": daysInPeriod = 7; break;
      case "month": daysInPeriod = 30; break;
      case "year": daysInPeriod = 365; break;
    }
    
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - daysInPeriod);
    
    return {
      startDate,
      isNewUser: false,
      totalDaysAvailable: daysInPeriod
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
    let daysInPeriod: number;
    
    switch (timeframe) {
      case "week": daysInPeriod = 7; break;
      case "month": daysInPeriod = 30; break;
      case "year": daysInPeriod = 365; break;
    }
    
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - daysInPeriod);
    
    return {
      startDate,
      isNewUser: false,
      totalDaysAvailable: daysInPeriod
    };
  }
  
  const daysSinceCreation = Math.floor((now.getTime() - accountCreationDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Determine days for this timeframe
  let daysInPeriod: number;
  switch (timeframe) {
    case "week": daysInPeriod = 7; break;
    case "month": daysInPeriod = 30; break;
    case "year": daysInPeriod = 365; break;
  }
  
  // Check if user has been on app long enough for full period
  const hasFullPeriod = daysSinceCreation >= daysInPeriod;
  
  let startDate: Date;
  let totalDaysAvailable: number;
  
  if (hasFullPeriod) {
    // User has been on app long enough - use full period
    startDate = new Date(now);
    startDate.setDate(now.getDate() - daysInPeriod);
    totalDaysAvailable = daysInPeriod;
  } else {
    // User hasn't been on app for full period - start from account creation
    startDate = accountCreationDate;
    totalDaysAvailable = daysSinceCreation + 1; // +1 to include today
  }
  
  return {
    startDate,
    isNewUser: !hasFullPeriod,
    totalDaysAvailable
  };
};

/**
 * Cache user creation date in localStorage for sync operations
 */
export const cacheUserCreationDate = (createdAt: string) => {
  localStorage.setItem('user_creation_date', createdAt);
};