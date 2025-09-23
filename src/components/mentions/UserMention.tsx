import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserMentionProps {
  username: string;
  displayName?: string;
  avatarUrl?: string;
  variant?: 'inline' | 'card' | 'compact';
  className?: string;
  onClick?: () => void;
}

export const UserMention = ({
  username,
  displayName,
  avatarUrl,
  variant = 'inline',
  className,
  onClick
}: UserMentionProps) => {
  const baseClasses = "transition-colors";
  const clickableClasses = onClick ? "cursor-pointer hover:bg-accent rounded-sm" : "";

  if (variant === 'inline') {
    return (
      <span 
        className={cn(
          baseClasses,
          clickableClasses,
          "inline-flex items-center gap-1 px-1 py-0.5 text-primary hover:text-primary-dark",
          className
        )}
        onClick={onClick}
      >
        {displayName ? (
          <>
            <span className="font-semibold">{displayName}</span>
            <span className="text-muted-foreground">@{username}</span>
          </>
        ) : (
          <span className="text-muted-foreground">@{username}</span>
        )}
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <div 
        className={cn(
          baseClasses,
          clickableClasses,
          "inline-flex items-center gap-2 p-2",
          className
        )}
        onClick={onClick}
      >
        <Avatar className="h-6 w-6">
          <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={displayName || username} />
          <AvatarFallback className="text-xs">
            {(displayName || username).charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-1 min-w-0">
          {displayName ? (
            <>
              <span className="font-semibold text-sm text-foreground truncate">
                {displayName}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                @{username}
              </span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground truncate">
              @{username}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Card variant
  return (
    <div 
      className={cn(
        baseClasses,
        clickableClasses,
        "flex items-center gap-3 p-3 border rounded-lg bg-card",
        className
      )}
      onClick={onClick}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={displayName || username} />
        <AvatarFallback>
          {(displayName || username).charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        {displayName ? (
          <>
            <div className="font-semibold text-foreground truncate">
              {displayName}
            </div>
            <div className="text-sm text-muted-foreground truncate">
              @{username}
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground truncate">
            @{username}
          </div>
        )}
      </div>
    </div>
  );
};