import { useState, useRef } from 'react';

export const useChallengeCardSwipe = () => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [showActions, setShowActions] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;
    
    // Only allow left swipe for actions
    if (diff < 0) {
      setSwipeOffset(Math.max(diff, -120));
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    
    // If swiped more than 60px, show actions
    if (swipeOffset < -60) {
      setShowActions(true);
      setSwipeOffset(-120);
    } else {
      setSwipeOffset(0);
      setShowActions(false);
    }
  };

  const resetSwipe = () => {
    setShowActions(false);
    setSwipeOffset(0);
  };

  return {
    swipeOffset,
    showActions,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    resetSwipe,
  };
};
