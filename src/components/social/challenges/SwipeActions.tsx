import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Share2, Plus, LucideIcon } from 'lucide-react';

interface QuickAction {
  icon: LucideIcon;
  label: string;
  action: () => void;
  color: string;
}

interface SwipeActionsProps {
  challengeId: string;
  onFavorite?: (id: string) => void;
  onShare?: (id: string) => void;
  onQuickProgress?: (id: string) => void;
  showProgress?: boolean;
  onActionComplete: () => void;
}

const SwipeActions = ({
  challengeId,
  onFavorite,
  onShare,
  onQuickProgress,
  showProgress = false,
  onActionComplete,
}: SwipeActionsProps) => {
  const quickActions: QuickAction[] = [
    {
      icon: Heart,
      label: 'Favorite',
      action: () => onFavorite?.(challengeId),
      color: 'bg-status-error hover:bg-status-error/90',
    },
    {
      icon: Share2,
      label: 'Share',
      action: () => onShare?.(challengeId),
      color: 'bg-accent hover:bg-accent/90',
    },
    ...(showProgress ? [{
      icon: Plus,
      label: 'Progress',
      action: () => onQuickProgress?.(challengeId),
      color: 'bg-status-success hover:bg-status-success/90',
    }] : []),
  ];

  return (
    <div className="absolute right-0 top-0 h-full flex items-center bg-muted z-10">
      {quickActions.map((action, index) => (
        <Button
          key={index}
          size="sm"
          className={`${action.color} text-white h-full rounded-none px-3 transition-all duration-200`}
          onClick={(e) => {
            e.stopPropagation();
            action.action();
            onActionComplete();
          }}
        >
          <action.icon size={16} />
          <span className="sr-only">{action.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default SwipeActions;
