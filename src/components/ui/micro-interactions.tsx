import React from "react";
import { cn } from "@/lib/utils";

interface PulseProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const Pulse: React.FC<PulseProps> = ({ children, className, disabled = false }) => {
  return (
    <div className={cn(
      "relative",
      !disabled && "before:absolute before:inset-0 before:rounded-full before:bg-primary/20 before:animate-ping",
      className
    )}>
      {children}
    </div>
  );
};

interface FloatingActionProps {
  children: React.ReactNode;
  className?: string;
}

export const FloatingAction: React.FC<FloatingActionProps> = ({ children, className }) => {
  return (
    <div className={cn(
      "fixed bottom-20 right-4 z-50 animate-scale-in",
      "transition-all duration-300 hover:scale-110 active:scale-95",
      className
    )}>
      {children}
    </div>
  );
};

interface SlideInProps {
  children: React.ReactNode;
  direction?: "left" | "right" | "up" | "down";
  delay?: number;
  className?: string;
}

export const SlideIn: React.FC<SlideInProps> = ({ 
  children, 
  direction = "up", 
  delay = 0,
  className 
}) => {
  const getDirection = () => {
    switch (direction) {
      case "left":
        return "animate-[slide-in-left_0.3s_ease-out]";
      case "right":
        return "animate-[slide-in-right_0.3s_ease-out]";
      case "down":
        return "animate-[slide-in-down_0.3s_ease-out]";
      default:
        return "animate-[slide-in-up_0.3s_ease-out]";
    }
  };

  return (
    <div 
      className={cn(getDirection(), className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

interface StaggeredListProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({ 
  children, 
  staggerDelay = 100,
  className 
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {React.Children.map(children, (child, index) => (
        <SlideIn key={index} delay={index * staggerDelay}>
          {child}
        </SlideIn>
      ))}
    </div>
  );
};

interface CounterProps {
  value: number;
  duration?: number;
  className?: string;
}

export const Counter: React.FC<CounterProps> = ({ 
  value, 
  duration = 1000,
  className 
}) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let start = 0;
    const end = value;
    const incrementTime = duration / end;
    
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <span className={cn("font-bold tabular-nums", className)}>
      {count}
    </span>
  );
};