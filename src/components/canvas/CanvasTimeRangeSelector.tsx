import { cn } from "@/lib/utils";

interface CanvasTimeRangeSelectorProps {
  selectedRange: '7' | '30' | '90' | 'all';
  onRangeChange: (range: '7' | '30' | '90' | 'all') => void;
}

export default function CanvasTimeRangeSelector({ selectedRange, onRangeChange }: CanvasTimeRangeSelectorProps) {
  const ranges = [
    { value: '7' as const, label: '7 Days', cols: 7, rows: 1 },
    { value: '30' as const, label: '30 Days', cols: 10, rows: 6 },
    { value: '90' as const, label: '90 Days', cols: 10, rows: 9 },
    { value: 'all' as const, label: 'All Time', cols: 10, rows: 12 },
  ];

  return (
    <div className="flex gap-1 p-1 bg-muted/20 rounded-lg w-fit">
      {ranges.map((range) => (
        <button
          key={range.value}
          onClick={() => onRangeChange(range.value)}
          className={cn(
            "px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
            "hover:bg-muted/40",
            selectedRange === range.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground"
          )}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}
