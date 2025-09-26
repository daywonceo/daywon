import React, { useRef, useEffect, useState } from 'react';
import FocusTrap from 'focus-trap-react';

// Accessibility context for managing focus and screen reader announcements
const AccessibilityContext = React.createContext<{
  announceToScreenReader: (message: string) => void;
  setCurrentPageTitle: (title: string) => void;
}>({
  announceToScreenReader: () => {},
  setCurrentPageTitle: () => {},
});

export const useAccessibility = () => React.useContext(AccessibilityContext);

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const announcementRef = useRef<HTMLDivElement>(null);
  
  const announceToScreenReader = (message: string) => {
    if (announcementRef.current) {
      announcementRef.current.textContent = message;
      // Clear after announcement to allow repeat announcements
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, 1000);
    }
  };

  const setCurrentPageTitle = (title: string) => {
    document.title = `${title} - DayWon`;
    announceToScreenReader(`Navigated to ${title}`);
  };

  return (
    <AccessibilityContext.Provider value={{ announceToScreenReader, setCurrentPageTitle }}>
      {children}
      {/* Screen reader announcements */}
      <div
        ref={announcementRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </AccessibilityContext.Provider>
  );
};

// Skip navigation link
interface SkipLinkProps {
  target: string;
  children: React.ReactNode;
}

export const SkipLink: React.FC<SkipLinkProps> = ({ target, children }) => (
  <a
    href={target}
    className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 
               bg-primary text-primary-foreground px-4 py-2 rounded-md z-50
               focus:outline-none focus:ring-2 focus:ring-ring"
  >
    {children}
  </a>
);

// Focus management hook
export const useFocusManagement = () => {
  const focusRef = useRef<HTMLElement | null>(null);
  
  const setFocusRef = (element: HTMLElement | null) => {
    focusRef.current = element;
  };
  
  const focusElement = () => {
    if (focusRef.current) {
      focusRef.current.focus();
    }
  };
  
  const focusFirst = (container: HTMLElement) => {
    const focusable = container.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;
    if (focusable) {
      focusable.focus();
    }
  };
  
  return { setFocusRef, focusElement, focusFirst };
};

// Keyboard navigation hook
export const useKeyboardNavigation = (
  items: any[],
  onSelect?: (index: number) => void,
  isVertical: boolean = true
) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  
  const handleKeyDown = (event: React.KeyboardEvent) => {
    const { key } = event;
    const length = items.length;
    
    if (length === 0) return;
    
    switch (key) {
      case isVertical ? 'ArrowDown' : 'ArrowRight':
        event.preventDefault();
        setActiveIndex((prev) => (prev + 1) % length);
        break;
        
      case isVertical ? 'ArrowUp' : 'ArrowLeft':
        event.preventDefault();
        setActiveIndex((prev) => (prev - 1 + length) % length);
        break;
        
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
        
      case 'End':
        event.preventDefault();
        setActiveIndex(length - 1);
        break;
        
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (activeIndex >= 0 && onSelect) {
          onSelect(activeIndex);
        }
        break;
        
      case 'Escape':
        setActiveIndex(-1);
        break;
    }
  };
  
  return { activeIndex, handleKeyDown, setActiveIndex };
};

// High contrast mode detector
export const useHighContrastMode = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);
  
  useEffect(() => {
    const checkHighContrast = () => {
      const isHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      setIsHighContrast(isHighContrast);
    };
    
    checkHighContrast();
    
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    mediaQuery.addEventListener('change', checkHighContrast);
    
    return () => mediaQuery.removeEventListener('change', checkHighContrast);
  }, []);
  
  return isHighContrast;
};

// Reduced motion preference
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const checkReducedMotion = () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setPrefersReducedMotion(prefersReducedMotion);
    };
    
    checkReducedMotion();
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', checkReducedMotion);
    
    return () => mediaQuery.removeEventListener('change', checkReducedMotion);
  }, []);
  
  return prefersReducedMotion;
};

// Modal with focus trap
interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}) => {
  const { announceToScreenReader } = useAccessibility();
  
  useEffect(() => {
    if (isOpen) {
      announceToScreenReader(`Modal opened: ${title}`);
    }
  }, [isOpen, title, announceToScreenReader]);
  
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <FocusTrap>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          className={`bg-background border rounded-lg shadow-lg max-w-lg w-full mx-4 ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h2 id="modal-title" className="text-lg font-semibold">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Close modal"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </FocusTrap>
  );
};

// ARIA live region for dynamic content updates
interface LiveRegionProps {
  children: React.ReactNode;
  level?: 'polite' | 'assertive';
  atomic?: boolean;
  className?: string;
}

export const LiveRegion: React.FC<LiveRegionProps> = ({
  children,
  level = 'polite',
  atomic = true,
  className = '',
}) => (
  <div
    aria-live={level}
    aria-atomic={atomic}
    className={className}
  >
    {children}
  </div>
);