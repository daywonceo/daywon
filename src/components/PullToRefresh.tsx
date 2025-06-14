
import { useEffect, useState, useRef } from "react";
import { RefreshCcw } from "lucide-react";

type PullToRefreshProps = {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
};

const PullToRefresh = ({ onRefresh, children }: PullToRefreshProps) => {
  const [isPulling, setIsPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const pullStartY = useRef(0);
  const pullMoveY = useRef(0);
  const distanceThreshold = 70;
  const resistance = 3;
  const refreshRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const touchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        pullStartY.current = e.touches[0].clientY;
        setIsPulling(true);
      }
    };

    const touchMove = (e: TouchEvent) => {
      if (!isPulling) return;
      pullMoveY.current = e.touches[0].clientY;
      const distance = pullMoveY.current - pullStartY.current;
      
      if (distance > 0) {
        if (refreshRef.current) {
          refreshRef.current.style.transform = `translateY(${distance / resistance}px)`;
        }
      }
    };

    const touchEnd = () => {
      if (!isPulling) return;
      
      const distance = pullMoveY.current - pullStartY.current;
      
      if (distance > distanceThreshold && !refreshing) {
        handleRefresh();
      }
      
      if (refreshRef.current) {
        refreshRef.current.style.transform = 'translateY(0)';
      }
      
      setIsPulling(false);
    };

    document.addEventListener('touchstart', touchStart);
    document.addEventListener('touchmove', touchMove);
    document.addEventListener('touchend', touchEnd);

    return () => {
      document.removeEventListener('touchstart', touchStart);
      document.removeEventListener('touchmove', touchMove);
      document.removeEventListener('touchend', touchEnd);
    };
  }, [isPulling, refreshing]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="relative min-h-full w-full">
      <div 
        ref={refreshRef} 
        className="absolute top-0 left-0 w-full flex justify-center transition-transform duration-300 z-50 pointer-events-none"
      >
        <div className={`flex items-center justify-center h-16 text-green-700 transition-opacity ${isPulling || refreshing ? 'opacity-100' : 'opacity-0'} ${refreshing ? 'animate-spin' : ''}`}>
          <RefreshCcw size={24} />
        </div>
      </div>
      {children}
    </div>
  );
};

export default PullToRefresh;
