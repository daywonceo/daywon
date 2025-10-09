import { AlertCircle, XCircle, WifiOff, ServerCrash, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

export type ErrorType = 'network' | 'server' | 'timeout' | 'notfound' | 'unauthorized' | 'generic';

interface ErrorDisplayProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  children?: ReactNode;
}

const errorConfig: Record<ErrorType, { 
  icon: typeof AlertCircle; 
  title: string; 
  message: string;
  iconColor: string;
}> = {
  network: {
    icon: WifiOff,
    title: "Connection Error",
    message: "Please check your internet connection and try again.",
    iconColor: "text-destructive",
  },
  server: {
    icon: ServerCrash,
    title: "Server Error",
    message: "Our servers are experiencing issues. Please try again later.",
    iconColor: "text-destructive",
  },
  timeout: {
    icon: Clock,
    title: "Request Timeout",
    message: "The request took too long. Please try again.",
    iconColor: "text-warning",
  },
  notfound: {
    icon: XCircle,
    title: "Not Found",
    message: "The requested resource could not be found.",
    iconColor: "text-muted-foreground",
  },
  unauthorized: {
    icon: AlertCircle,
    title: "Unauthorized",
    message: "You don't have permission to access this resource.",
    iconColor: "text-destructive",
  },
  generic: {
    icon: AlertCircle,
    title: "Something Went Wrong",
    message: "An unexpected error occurred. Please try again.",
    iconColor: "text-destructive",
  },
};

// Inline error message
export const ErrorMessage = ({ 
  type = 'generic', 
  title, 
  message, 
  onRetry,
  retryLabel = "Try Again",
  children 
}: ErrorDisplayProps) => {
  const config = errorConfig[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center text-center space-y-4 p-6">
      <Icon className={`h-12 w-12 ${config.iconColor}`} />
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">{title || config.title}</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          {message || config.message}
        </p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          {retryLabel}
        </Button>
      )}
      {children}
    </div>
  );
};

// Card-based error display
export const ErrorCard = (props: ErrorDisplayProps) => {
  return (
    <Card className="border-destructive/50">
      <CardContent className="pt-6">
        <ErrorMessage {...props} />
      </CardContent>
    </Card>
  );
};

// Compact inline error
export const InlineError = ({ message }: { message: string }) => {
  return (
    <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
      <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
      <p className="text-sm text-destructive">{message}</p>
    </div>
  );
};

// Empty state (not an error, but similar pattern)
export const EmptyState = ({ 
  icon: Icon, 
  title, 
  message,
  action 
}: { 
  icon: typeof AlertCircle;
  title: string;
  message: string;
  action?: ReactNode;
}) => {
  return (
    <div className="flex flex-col items-center text-center space-y-4 p-8">
      <Icon className="h-16 w-16 text-muted-foreground/50" />
      <div className="space-y-2">
        <h3 className="font-semibold text-lg text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md">{message}</p>
      </div>
      {action}
    </div>
  );
};
