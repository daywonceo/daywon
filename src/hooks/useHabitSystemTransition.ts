import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { migrateHabitActivitiesToV2, initHabitSync } from '@/utils/habitTracking';
import { toast } from './use-toast';

const V2_MIGRATION_SHOWN_KEY = 'habit_v2_migration_shown';

export const useHabitSystemTransition = () => {
  const { user } = useAuth();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isV2Ready, setIsV2Ready] = useState(false);

  useEffect(() => {
    if (!user) return;

    const initializeV2System = async () => {
      try {
        setIsTransitioning(true);
        
        // Initialize the V2 sync system
        const cleanupSync = initHabitSync();
        
        // Migrate existing data to V2 format
        await migrateHabitActivitiesToV2();
        
        setIsV2Ready(true);
        console.log('Habit system V2 initialized successfully');
        
        // Only show notification once per user
        const migrationShown = localStorage.getItem(V2_MIGRATION_SHOWN_KEY);
        if (!migrationShown) {
          toast({
            title: "System Updated",
            description: "Habit tracking system has been upgraded with improved duplicate handling.",
            duration: 3000,
          });
          localStorage.setItem(V2_MIGRATION_SHOWN_KEY, 'true');
        }

        // Store cleanup function for unmount
        return cleanupSync;
      } catch (error) {
        console.error('Failed to initialize V2 system:', error);
        toast({
          title: "Update Warning",
          description: "Some features may not work properly. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsTransitioning(false);
      }
    };

    const cleanup = initializeV2System();
    
    // Cleanup on unmount
    return () => {
      if (cleanup && typeof cleanup.then === 'function') {
        cleanup.then(cleanupFn => cleanupFn && cleanupFn());
      }
    };
  }, [user]);

  return {
    isTransitioning,
    isV2Ready
  };
};