import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Users, 
  MessageSquare, 
  Trophy, 
  Sparkles, 
  UserPlus, 
  Target,
  Heart,
  Zap
} from "lucide-react";

type EmptyStateType = 
  | "no-friends" 
  | "no-posts" 
  | "no-activity" 
  | "no-requests" 
  | "no-discover" 
  | "no-groups"
  | "no-challenges";

interface SocialEmptyStateProps {
  type: EmptyStateType;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

const emptyStateConfig: Record<EmptyStateType, {
  icon: React.ElementType;
  iconBg: string;
  title: string;
  description: string;
  encouragement: string;
}> = {
  "no-friends": {
    icon: Users,
    iconBg: "bg-primary/10 text-primary",
    title: "Your circle awaits",
    description: "Connect with others on the same journey to share wins and stay motivated together.",
    encouragement: "Great habits are built with great company!"
  },
  "no-posts": {
    icon: MessageSquare,
    iconBg: "bg-accent/10 text-accent",
    title: "The feed is quiet",
    description: "Be the first to share! Post about your progress and inspire your community.",
    encouragement: "Your story could motivate someone today."
  },
  "no-activity": {
    icon: Zap,
    iconBg: "bg-secondary/10 text-secondary-foreground",
    title: "No activity yet",
    description: "Complete habits to see your progress here. Every check-in is a step forward!",
    encouragement: "Start small, dream big."
  },
  "no-requests": {
    icon: Heart,
    iconBg: "bg-success/10 text-success",
    title: "All caught up!",
    description: "No pending friend requests at the moment. Your inbox is clear!",
    encouragement: "Good things come to those who wait."
  },
  "no-discover": {
    icon: Sparkles,
    iconBg: "bg-primary/10 text-primary",
    title: "Exploring the community",
    description: "We are finding people with similar habits and goals for you to connect with.",
    encouragement: "New connections loading..."
  },
  "no-groups": {
    icon: Trophy,
    iconBg: "bg-accent/10 text-accent",
    title: "No challenges yet",
    description: "Join a challenge or create your own to compete with friends and stay accountable.",
    encouragement: "Together we go further!"
  },
  "no-challenges": {
    icon: Target,
    iconBg: "bg-secondary/10 text-secondary-foreground",
    title: "Ready for a challenge?",
    description: "Challenges help you push your limits and celebrate wins with others.",
    encouragement: "Your next achievement awaits!"
  }
};

const SocialEmptyState = ({ 
  type, 
  onAction, 
  actionLabel,
  className 
}: SocialEmptyStateProps) => {
  const config = emptyStateConfig[type];
  const IconComponent = config.icon;

  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in",
      className
    )}>
      {/* Animated Icon Container */}
      <div className="relative mb-6">
        <div className={cn(
          "w-20 h-20 rounded-2xl flex items-center justify-center",
          config.iconBg
        )}>
          <IconComponent size={32} className="animate-pulse" />
        </div>
        {/* Decorative dots */}
        <div className="absolute -top-2 -right-2 w-3 h-3 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-accent/40 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
      </div>

      {/* Text Content */}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {config.title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-3">
        {config.description}
      </p>
      <p className="text-xs text-muted-foreground/70 italic mb-6">
        {config.encouragement}
      </p>

      {/* Action Button */}
      {onAction && actionLabel && (
        <Button 
          onClick={onAction}
          className="rounded-full px-6"
          size="sm"
        >
          {type === "no-friends" && <UserPlus size={16} className="mr-2" />}
          {type === "no-posts" && <MessageSquare size={16} className="mr-2" />}
          {type === "no-groups" && <Trophy size={16} className="mr-2" />}
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default SocialEmptyState;
