import React, { createContext, useContext, useState, useEffect } from 'react';
import { vibrate, hapticLight, hapticMedium, hapticHeavy, hapticSuccess, hapticError } from '@/utils/haptics';

interface HapticsContextType {
  hapticsEnabled: boolean;
  toggleHaptics: () => void;
  triggerHaptic: (type?: 'light' | 'medium' | 'heavy' | 'success' | 'error') => void;
}

const HapticsContext = createContext<HapticsContextType | undefined>(undefined);

export const HapticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => {
    const stored = localStorage.getItem('hapticsEnabled');
    return stored === null ? true : stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem('hapticsEnabled', String(hapticsEnabled));
  }, [hapticsEnabled]);

  const toggleHaptics = () => {
    setHapticsEnabled(prev => !prev);
  };

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') => {
    if (!hapticsEnabled) return;

    switch (type) {
      case 'light':
        hapticLight();
        break;
      case 'medium':
        hapticMedium();
        break;
      case 'heavy':
        hapticHeavy();
        break;
      case 'success':
        hapticSuccess();
        break;
      case 'error':
        hapticError();
        break;
      default:
        hapticLight();
    }
  };

  return (
    <HapticsContext.Provider value={{ hapticsEnabled, toggleHaptics, triggerHaptic }}>
      {children}
    </HapticsContext.Provider>
  );
};

export const useHaptics = () => {
  const context = useContext(HapticsContext);
  if (!context) {
    throw new Error('useHaptics must be used within HapticsProvider');
  }
  return context;
};
