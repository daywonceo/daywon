import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CanvasLegendProps {
  habitBreakdown: Array<{
    name: string;
    color: string;
    count: number;
    percentage: number;
  }>;
  onFilterToggle?: (habitName: string) => void;
  activeFilters?: string[];
}

export default function CanvasLegend({ 
  habitBreakdown, 
  onFilterToggle,
  activeFilters = []
}: CanvasLegendProps) {
  const [expanded, setExpanded] = useState(false);
  
  const displayItems = expanded ? habitBreakdown : habitBreakdown.slice(0, 5);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {displayItems.map((item) => {
          const isFiltered = activeFilters.length > 0 && !activeFilters.includes(item.name);
          
          return (
            <button
              key={item.name}
              onClick={() => onFilterToggle?.(item.name)}
              className={cn(
                "flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-all",
                "hover:bg-muted/40 border border-border/50",
                isFiltered ? "opacity-40" : "opacity-100"
              )}
            >
              <div className={cn("w-3 h-3 rounded-sm", item.color)} />
              <span className="text-xs font-medium">{item.name}</span>
              <span className="text-xs text-muted-foreground">
                {item.count} ({item.percentage}%)
              </span>
            </button>
          );
        })}
      </div>
      
      {habitBreakdown.length > 5 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="text-xs h-7"
        >
          {expanded ? 'Show Less' : `Show ${habitBreakdown.length - 5} More`}
        </Button>
      )}
      
      {activeFilters.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => activeFilters.forEach(f => onFilterToggle?.(f))}
          className="text-xs h-7"
        >
          <X className="w-3 h-3 mr-1" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
