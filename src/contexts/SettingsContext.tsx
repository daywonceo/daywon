
import { createContext, useContext, useState, ReactNode } from 'react';
import { Settings } from 'lucide-react';

type SettingsContextType = {
  reducedMotion: boolean;
  toggleReducedMotion: () => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [reducedMotion, setReducedMotion] = useState(
    localStorage.getItem('reducedMotion') === 'true' || false
  );

  const toggleReducedMotion = () => {
    const newValue = !reducedMotion;
    setReducedMotion(newValue);
    localStorage.setItem('reducedMotion', String(newValue));
    
    // Apply reduced motion class to document
    if (newValue) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  };

  return (
    <SettingsContext.Provider value={{ reducedMotion, toggleReducedMotion }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const ReducedMotionToggle = () => {
  const { reducedMotion, toggleReducedMotion } = useSettings();
  
  return (
    <button 
      onClick={toggleReducedMotion}
      className={`flex items-center gap-2 px-3 py-2 rounded-md ${
        reducedMotion ? 'bg-green-100 text-green-800' : 'text-gray-600'
      }`}
    >
      <Settings size={18} />
      <span>{reducedMotion ? 'Reduced Motion: ON' : 'Reduced Motion: OFF'}</span>
    </button>
  );
};
