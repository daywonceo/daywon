import React, { useState, useEffect } from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { ChevronUp } from "lucide-react";

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <Button
      variant="premium"
      size="icon"
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-24 right-4 z-50 transition-all duration-300 shadow-lg",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16 pointer-events-none"
      )}
      aria-label="Scroll to top"
      glow
    >
      <ChevronUp className="h-5 w-5" />
    </Button>
  );
};

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "error";
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showLabel = true,
  size = "md",
  variant = "default",
  className
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4"
  };
  
  const variantClasses = {
    default: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    error: "bg-destructive"
  };

  return (
    <div className={cn("w-full space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="text-foreground font-medium">{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className={cn("w-full bg-muted rounded-full overflow-hidden", sizeClasses[size])}>
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full",
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
};

interface PulsingDotProps {
  color?: "primary" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const PulsingDot: React.FC<PulsingDotProps> = ({
  color = "primary",
  size = "md",
  className
}) => {
  const colorClasses = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    error: "bg-destructive"
  };
  
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4"
  };

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "rounded-full animate-ping absolute",
          colorClasses[color],
          sizeClasses[size]
        )}
      />
      <div
        className={cn(
          "rounded-full relative",
          colorClasses[color],
          sizeClasses[size]
        )}
      />
    </div>
  );
};

interface FloatingNotificationProps {
  message: string;
  type?: "success" | "warning" | "error" | "info";
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const FloatingNotification: React.FC<FloatingNotificationProps> = ({
  message,
  type = "info",
  isVisible,
  onClose,
  duration = 5000
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const typeClasses = {
    success: "bg-success/90 text-success-foreground border-success/20",
    warning: "bg-warning/90 text-warning-foreground border-warning/20",
    error: "bg-destructive/90 text-destructive-foreground border-destructive/20",
    info: "bg-primary/90 text-primary-foreground border-primary/20"
  };

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 p-4 rounded-lg border backdrop-blur-sm shadow-lg transition-all duration-300",
        typeClasses[type],
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">{message}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="text-current hover:bg-white/20"
        >
          ×
        </Button>
      </div>
    </div>
  );
};