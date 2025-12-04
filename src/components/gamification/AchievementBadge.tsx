import React from 'react';
import { Achievement } from '@/data/achievements';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { format } from 'date-fns';

interface AchievementBadgeProps {
  achievement: Achievement;
  earned: boolean;
  earnedDate?: string;
  size?: 'sm' | 'md' | 'lg';
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  earned,
  earnedDate,
  size = 'md',
}) => {
  const Icon = achievement.icon;
  
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "relative rounded-full flex items-center justify-center transition-all duration-300",
            sizeClasses[size],
            earned
              ? "bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 shadow-lg hover:scale-110"
              : "bg-muted/50 border-2 border-muted grayscale opacity-50"
          )}
        >
          {earned ? (
            <Icon 
              size={iconSizes[size]} 
              className={cn("transition-colors", achievement.color)} 
            />
          ) : (
            <Lock size={iconSizes[size]} className="text-muted-foreground" />
          )}
          
          {/* Glow effect for earned badges */}
          {earned && (
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-md -z-10 animate-pulse" />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[200px]">
        <div className="text-center">
          <p className="font-semibold">{achievement.name}</p>
          <p className="text-xs text-muted-foreground">{achievement.description}</p>
          {earned && earnedDate && (
            <p className="text-xs text-primary mt-1">
              Earned {format(new Date(earnedDate), 'MMM d, yyyy')}
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default AchievementBadge;
