import React from "react";
import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: "success" | "warning" | "error" | "info" | "neutral";
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = "md",
  pulse = false,
  className
}) => {
  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "bg-success";
      case "warning":
        return "bg-warning";
      case "error":
        return "bg-destructive";
      case "info":
        return "bg-primary";
      default:
        return "bg-muted-foreground";
    }
  };

  const getSize = () => {
    switch (size) {
      case "sm":
        return "h-2 w-2";
      case "lg":
        return "h-4 w-4";
      default:
        return "h-3 w-3";
    }
  };

  return (
    <div className={cn(
      "rounded-full",
      getStatusColor(),
      getSize(),
      pulse && "animate-pulse",
      className
    )} />
  );
};

interface StatusBadgeProps {
  status: "active" | "inactive" | "pending" | "completed" | "failed";
  text?: string;
  size?: "sm" | "md";
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  text,
  size = "md",
  className
}) => {
  const getStatusStyles = () => {
    switch (status) {
      case "active":
        return "bg-success/10 text-success border-success/20";
      case "completed":
        return "bg-primary/10 text-primary border-primary/20";
      case "pending":
        return "bg-warning/10 text-warning border-warning/20";
      case "failed":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  const getSizeStyles = () => {
    return size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm";
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-2 rounded-full border font-medium",
      getStatusStyles(),
      getSizeStyles(),
      className
    )}>
      <StatusIndicator 
        status={status === "active" || status === "completed" ? "success" : 
               status === "pending" ? "warning" : 
               status === "failed" ? "error" : "neutral"}
        size="sm"
      />
      {text || status}
    </span>
  );
};