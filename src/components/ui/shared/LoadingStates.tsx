import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";

// Simple spinner loader
export const Spinner = ({ size = "md", className = "" }: { size?: "sm" | "md" | "lg", className?: string }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  return (
    <Loader2 className={`animate-spin text-primary ${sizeClasses[size]} ${className}`} />
  );
};

// Centered loading spinner
export const LoadingSpinner = ({ message, size = "md" }: { message?: string; size?: "sm" | "md" | "lg" }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <Spinner size={size} />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
};

// Full page loading state
export const PageLoader = ({ message = "Loading..." }: { message?: string }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <Spinner size="lg" />
        <p className="text-lg text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

// Card skeleton loader
export const CardSkeleton = ({ count = 1 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ))}
    </>
  );
};

// List skeleton loader
export const ListSkeleton = ({ count = 3, itemHeight = "h-16" }: { count?: number; itemHeight?: string }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={`${itemHeight} w-full`} />
      ))}
    </div>
  );
};

// Inline loading state with content replacement
export const LoadingState = ({ 
  isLoading, 
  loader, 
  children 
}: { 
  isLoading: boolean; 
  loader?: ReactNode; 
  children: ReactNode 
}) => {
  if (isLoading) {
    return <>{loader || <LoadingSpinner />}</>;
  }
  return <>{children}</>;
};

// Button loading state
export const ButtonLoader = ({ loading, children }: { loading: boolean; children: ReactNode }) => {
  if (loading) {
    return (
      <>
        <Spinner size="sm" className="mr-2" />
        {children}
      </>
    );
  }
  return <>{children}</>;
};
