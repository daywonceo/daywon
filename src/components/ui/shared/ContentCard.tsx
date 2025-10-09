import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ExternalLink } from "lucide-react";
import { ReactNode } from "react";

interface ContentCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  category?: string;
  badge?: string;
  icon?: ReactNode;
  actions?: {
    onDelete?: () => void;
    onView?: () => void;
    customActions?: ReactNode;
  };
  footer?: ReactNode;
  children?: ReactNode;
}

export const ContentCard = ({
  title,
  subtitle,
  description,
  category,
  badge,
  icon,
  actions,
  footer,
  children
}: ContentCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              {icon}
              <h3 className="font-semibold text-base leading-tight">{title}</h3>
            </div>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {badge && (
              <Badge variant="secondary" className="text-xs">
                {badge}
              </Badge>
            )}
            {category && (
              <Badge variant="outline" className="text-xs">
                {category}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      {(description || children) && (
        <CardContent className="space-y-3">
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {description}
            </p>
          )}
          {children}
          
          {(actions?.onDelete || actions?.onView || actions?.customActions) && (
            <div className="flex items-center gap-2 pt-2">
              {actions.customActions}
              {actions.onView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={actions.onView}
                  className="flex-1"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Button>
              )}
              {actions.onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={actions.onDelete}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      )}
      
      {footer}
    </Card>
  );
};
