
import { Clock } from "lucide-react";
import React from "react";
import { HabitActivity } from "./habitActivity";

const STORAGE_KEY = 'dayWon_offlineData';

export type OfflineData = {
  lastUpdated: number;
  habits: any[];
  activities: any[];
  stats: any;
  habitActivities: HabitActivity[];
  habitActivitiesV2: HabitActivity[];
  habitCategories: string[];
};

// Save data to localStorage
export const saveOfflineData = (data: Partial<OfflineData>): void => {
  try {
    const existingData = getOfflineData();
    const mergedData = {
      ...existingData,
      ...data,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedData));
  } catch (error) {
    console.error('Failed to save offline data:', error);
  }
};

// Get data from localStorage
export const getOfflineData = (): OfflineData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to get offline data:', error);
  }
  
  return {
    lastUpdated: 0,
    habits: [],
    activities: [],
    stats: {},
    habitActivities: [],
    habitActivitiesV2: [],
    habitCategories: [],
  };
};

// Clear all offline data
export const clearOfflineData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear offline data:', error);
  }
};

// Check if app is online
export const isOnline = (): boolean => {
  return navigator.onLine;
};

export const OfflineIndicator: React.FC = () => {
  const online = isOnline();
  if (online) return null;
  
  return (
    <div className="flex items-center justify-center gap-2 bg-amber-500 text-white text-sm py-1 px-3 rounded-full fixed top-2 right-2 z-50">
      <Clock size={14} />
      <span>Offline Mode</span>
    </div>
  );
};
