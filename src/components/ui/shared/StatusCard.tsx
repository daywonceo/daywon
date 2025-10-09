import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SPACING } from "@/utils/designSystem";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface StatusCardProps {
  title: string;
  icon: LucideIcon;
  variant: 'success' | 'warning' | 'error' | 'info';
  children: ReactNode;
  actions?: ReactNode;
}

const variantStyles = {
  success: {
    bg: 'bg-success/10',
    border: 'border-success/20',
    icon: 'text-success',
  },
  warning: {
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    icon: 'text-warning',
  },
  error: {
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
    icon: 'text-destructive',
  },
  info: {
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    icon: 'text-primary',
  },
} as const;

export const StatusCard = ({ 
  title, 
  icon: Icon, 
  variant, 
  children, 
  actions 
}: StatusCardProps) => {
  const styles = variantStyles[variant];
  
  return (
    <Card className={`${styles.bg} ${styles.border}`}>
      <CardHeader className={SPACING.cardPadding.desktop}>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${styles.icon}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className={SPACING.cardPadding.desktop}>
        {children}
        {actions && (
          <div className="flex items-center gap-2 mt-4">
            {actions}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
