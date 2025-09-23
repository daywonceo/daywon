import React from "react";
import { cn } from "@/lib/utils";

interface AccessibleIconProps {
  children: React.ReactNode;
  label: string;
  className?: string;
}

export const AccessibleIcon: React.FC<AccessibleIconProps> = ({ children, label, className }) => (
  <span className={cn("inline-flex", className)} aria-label={label} role="img">
    {children}
    <span className="sr-only">{label}</span>
  </span>
);

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

export const SkipLink: React.FC<SkipLinkProps> = ({ href, children }) => (
  <a
    href={href}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md focus-ring-enhanced"
  >
    {children}
  </a>
);

interface VisuallyHiddenProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({ children, asChild = false }) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...children.props,
      className: cn((children.props as any).className, "sr-only"),
    } as any);
  }
  
  return <span className="sr-only">{children}</span>;
};

interface FocusTrapProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export const FocusTrap: React.FC<FocusTrapProps> = ({ children, enabled = true }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const container = containerRef.current;
      if (!container) return;

      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstFocusable = focusableElements[0] as HTMLElement;
      const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);

  return (
    <div ref={containerRef} className="focus-trap">
      {children}
    </div>
  );
};

interface AnnouncementProps {
  message: string;
  priority?: "polite" | "assertive";
}

export const LiveAnnouncement: React.FC<AnnouncementProps> = ({ 
  message, 
  priority = "polite" 
}) => (
  <div
    aria-live={priority}
    aria-atomic="true"
    className="sr-only"
  >
    {message}
  </div>
);