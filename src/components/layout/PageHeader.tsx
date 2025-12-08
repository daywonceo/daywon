import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showAccent?: boolean;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  showAccent = true,
  className 
}) => {
  return (
    <div className={cn("text-center mb-8", className)}>
      <h1 className="text-2xl sm:text-3xl font-bold text-gradient-primary mb-2">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {subtitle}
        </p>
      )}
      {showAccent && (
        <div className="flex justify-center mt-3">
          <div className="w-12 h-1 bg-gradient-to-r from-primary to-primary-dark rounded-full" />
        </div>
      )}
    </div>
  );
};

export default PageHeader;
