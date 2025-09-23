import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

interface EnhancedCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  interactive?: boolean;
  gradient?: boolean;
}

export const EnhancedCard: React.FC<EnhancedCardProps> = ({
  title,
  subtitle,
  children,
  className,
  loading = false,
  interactive = false,
  gradient = false
}) => {
  return (
    <Card className={cn(
      "animate-fade-in",
      interactive && "interactive cursor-pointer hover:shadow-lg",
      gradient && "bg-gradient-to-br from-card/80 to-accent/20",
      className
    )}>
      {(title || subtitle) && (
        <CardHeader className="pb-3">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              {subtitle && <Skeleton className="h-3 w-48" />}
            </div>
          ) : (
            <>
              {title && (
                <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
              )}
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </>
          )}
        </CardHeader>
      )}
      <CardContent className={cn(
        "space-y-4",
        !(title || subtitle) && "pt-6"
      )}>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-8 w-24" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  className?: string;
  loading?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  trend,
  icon,
  className,
  loading = false
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-success";
      case "down":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className={cn("animate-fade-in", className)}>
      <CardContent className="p-4">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-3 w-20" />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {icon && (
                <div className="text-muted-foreground">
                  {icon}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className={cn("text-2xl font-bold", getTrendColor())}>
                {value}
              </p>
              {description && (
                <p className="text-xs text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};