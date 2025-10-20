import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Calendar as CalendarIcon, Award } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface CanvasStatsProps {
  stats: {
    totalTilesPainted: number;
    avgTilesPerDay: number;
    bestWeek?: string;
    consistencyScore: number;
    tilesToNextMilestone: number;
  };
}

export default function CanvasStats({ stats }: CanvasStatsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const statItems = [
    {
      icon: BarChart3,
      label: "Total Painted",
      value: stats.totalTilesPainted,
      color: "text-primary",
    },
    {
      icon: TrendingUp,
      label: "Daily Average",
      value: stats.avgTilesPerDay.toFixed(1),
      color: "text-secondary",
    },
    {
      icon: CalendarIcon,
      label: "Best Week",
      value: stats.bestWeek || "N/A",
      color: "text-accent",
    },
    {
      icon: Award,
      label: "Consistency",
      value: `${stats.consistencyScore}%`,
      color: "text-primary",
    },
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
              <CardTitle className="text-sm font-medium">Canvas Statistics</CardTitle>
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-3">
              {statItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                      <span className="text-xs">{item.label}</span>
                    </div>
                    <p className="text-lg font-semibold">{item.value}</p>
                  </div>
                );
              })}
            </div>
            
            {stats.tilesToNextMilestone > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-primary">{stats.tilesToNextMilestone}</span> tiles until next milestone
                </p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
