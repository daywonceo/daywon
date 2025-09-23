import React from "react";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary";
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className
}) => {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="p-8 text-center">
        <div className="animate-fade-in space-y-4">
          {icon && (
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-muted/50">
                {icon}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {description}
              </p>
            )}
          </div>
          
          {action && (
            <Button 
              onClick={action.onClick}
              variant={action.variant || "default"}
              className="mt-4"
            >
              {action.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};