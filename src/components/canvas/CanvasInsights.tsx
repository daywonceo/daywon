import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Calendar, Flame, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface CanvasInsightsProps {
  insights: {
    mostActiveDay?: string;
    favoriteHabit?: string;
    currentStreak?: number;
    averagePerDay?: number;
    bestWeek?: string;
  };
}

export default function CanvasInsights({ insights }: CanvasInsightsProps) {
  const insightItems = [
    {
      icon: Calendar,
      label: "Most Active",
      value: insights.mostActiveDay || "N/A",
      color: "text-primary",
    },
    {
      icon: Palette,
      label: "Favorite Habit",
      value: insights.favoriteHabit || "N/A",
      color: "text-secondary",
    },
    {
      icon: Flame,
      label: "Canvas Streak",
      value: insights.currentStreak ? `${insights.currentStreak} days` : "0 days",
      color: "text-accent",
    },
    {
      icon: TrendingUp,
      label: "Avg Per Day",
      value: insights.averagePerDay ? insights.averagePerDay.toFixed(1) : "0",
      color: "text-primary",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {insightItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card 
            key={item.label}
            className={cn(
              "glass-card animate-fade-in",
              "hover:scale-105 transition-transform duration-200"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <Icon className={cn("w-4 h-4 mt-0.5", item.color)} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-semibold truncate mt-0.5">{item.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
