
import { ReactNode, useRef, useState } from "react";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { hapticLight } from "@/utils/haptics";

type SwipeableCardProps = {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftActionText?: string;
  rightActionText?: string;
};

const SwipeableCard = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftActionText = "Delete",
  rightActionText = "Complete",
}: SwipeableCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const startPosition = useRef(0);
  const currentTranslateX = useRef(0);
  const [translateX, setTranslateX] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startPosition.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentPosition = e.touches[0].clientX;
    const diff = currentPosition - startPosition.current;
    const newTranslateX = diff + currentTranslateX.current;
    
    // Limit the swipe distance
    if (Math.abs(newTranslateX) < 150) {
      setTranslateX(newTranslateX);
    }
  };

  const handleTouchEnd = () => {
    // Threshold to determine if swipe should trigger action
    const threshold = 80;
    
    if (translateX > threshold && onSwipeRight) {
      onSwipeRight();
      hapticLight();
    } else if (translateX < -threshold && onSwipeLeft) {
      onSwipeLeft();
      hapticLight();
    }
    
    // Reset position with animation
    setTranslateX(0);
    currentTranslateX.current = 0;
  };

  // Calculate opacity for action indicators
  const leftOpacity = Math.min(Math.abs(Math.min(translateX, 0)) / 100, 1);
  const rightOpacity = Math.min(Math.max(translateX, 0) / 100, 1);

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Left action indicator */}
      <div 
        className="absolute inset-y-0 left-0 bg-red-500 flex items-center justify-center px-4 text-white transition-opacity"
        style={{ opacity: leftOpacity }}
      >
        <div className="flex items-center">
          <ChevronsLeft size={20} />
          <span className="ml-1">{leftActionText}</span>
        </div>
      </div>
      
      {/* Right action indicator */}
      <div 
        className="absolute inset-y-0 right-0 bg-green-500 flex items-center justify-center px-4 text-white transition-opacity"
        style={{ opacity: rightOpacity }}
      >
        <div className="flex items-center">
          <span className="mr-1">{rightActionText}</span>
          <ChevronsRight size={20} />
        </div>
      </div>
      
      {/* Swipeable content */}
      <div
        ref={cardRef}
        style={{ transform: `translateX(${translateX}px)` }}
        className="bg-white dark:bg-gray-800 transition-transform duration-150 touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeableCard;
