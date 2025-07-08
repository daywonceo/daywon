import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface TimeSession {
  startTime: number;
  section: string;
  isActive: boolean;
}

interface SectionTime {
  [key: string]: number; // minutes spent in each section
}

export const useAppTimeTracking = () => {
  const location = useLocation();
  const [isActive, setIsActive] = useState(true);
  const [sessionTime, setSessionTime] = useState(0); // total minutes today
  const [sectionTimes, setSectionTimes] = useState<SectionTime>({});
  
  const currentSessionRef = useRef<TimeSession | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get current section from route
  const getCurrentSection = useCallback(() => {
    const path = location.pathname;
    if (path === '/') return 'Home';
    if (path.startsWith('/guidance')) return 'Guidance';
    if (path.startsWith('/social')) return 'Social';
    if (path.startsWith('/calendar')) return 'Calendar';
    if (path.startsWith('/profile')) return 'Profile';
    return 'Other';
  }, [location.pathname]);

  // Save session data to localStorage
  const saveSessionData = useCallback((totalTime: number, sections: SectionTime) => {
    const today = new Date().toISOString().split('T')[0];
    const sessionData = {
      date: today,
      totalTime,
      sections,
      lastUpdated: Date.now()
    };
    localStorage.setItem('appTimeSession', JSON.stringify(sessionData));
  }, []);

  // Load session data from localStorage
  const loadSessionData = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem('appTimeSession');
    
    if (stored) {
      const data = JSON.parse(stored);
      // Only use data if it's from today
      if (data.date === today) {
        setSessionTime(data.totalTime || 0);
        setSectionTimes(data.sections || {});
        return;
      }
    }
    
    // Reset for new day
    setSessionTime(0);
    setSectionTimes({});
  }, []);

  // Start tracking for current section
  const startSession = useCallback(() => {
    if (currentSessionRef.current) return; // Already tracking
    
    const section = getCurrentSection();
    currentSessionRef.current = {
      startTime: performance.now(),
      section,
      isActive: true
    };
    
    // Clear any existing idle timeout
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }
  }, [getCurrentSection]);

  // Stop current session and update totals
  const stopSession = useCallback(() => {
    if (!currentSessionRef.current) return;
    
    const session = currentSessionRef.current;
    const duration = (performance.now() - session.startTime) / 1000 / 60; // convert to minutes
    
    if (duration > 0.1) { // Only count if more than 6 seconds
      const newTotalTime = sessionTime + duration;
      const newSectionTimes = {
        ...sectionTimes,
        [session.section]: (sectionTimes[session.section] || 0) + duration
      };
      
      setSessionTime(newTotalTime);
      setSectionTimes(newSectionTimes);
      saveSessionData(newTotalTime, newSectionTimes);
    }
    
    currentSessionRef.current = null;
  }, [sessionTime, sectionTimes, saveSessionData]);

  // Handle idle timeout
  const handleIdle = useCallback(() => {
    if (currentSessionRef.current) {
      currentSessionRef.current.isActive = false;
      stopSession();
    }
    setIsActive(false);
  }, [stopSession]);

  // Reset idle timeout
  const resetIdleTimeout = useCallback(() => {
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }
    
    idleTimeoutRef.current = setTimeout(handleIdle, 2 * 60 * 1000); // 2 minutes
    
    if (!isActive) {
      setIsActive(true);
      startSession();
    }
  }, [isActive, handleIdle, startSession]);

  // Handle section changes
  useEffect(() => {
    stopSession();
    startSession();
  }, [location.pathname]);

  // Initialize tracking
  useEffect(() => {
    loadSessionData();
    startSession();
    
    // Set up activity listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => resetIdleTimeout();
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });
    
    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopSession();
        setIsActive(false);
      } else {
        setIsActive(true);
        resetIdleTimeout();
        startSession();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Initial idle timeout
    resetIdleTimeout();
    
    return () => {
      stopSession();
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    updateIntervalRef.current = setInterval(() => {
      if (currentSessionRef.current && currentSessionRef.current.isActive) {
        const duration = (performance.now() - currentSessionRef.current.startTime) / 1000 / 60;
        if (duration > 0.5) { // Save if more than 30 seconds
          const newTotalTime = sessionTime + duration;
          const newSectionTimes = {
            ...sectionTimes,
            [currentSessionRef.current.section]: (sectionTimes[currentSessionRef.current.section] || 0) + duration
          };
          
          setSessionTime(newTotalTime);
          setSectionTimes(newSectionTimes);
          saveSessionData(newTotalTime, newSectionTimes);
          
          // Reset start time
          currentSessionRef.current.startTime = performance.now();
        }
      }
    }, 30000); // 30 seconds
    
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [sessionTime, sectionTimes, saveSessionData]);

  return {
    sessionTime: Math.round(sessionTime),
    sectionTimes: Object.fromEntries(
      Object.entries(sectionTimes).map(([key, value]) => [key, Math.round(value)])
    ),
    isActive,
    getCurrentSection: getCurrentSection()
  };
};