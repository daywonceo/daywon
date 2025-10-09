import { Clock } from "lucide-react";

interface TimeSpentSectionProps {
  timeSpent: number;
  sectionBreakdown: Record<string, number>;
}

export const TimeSpentSection = ({ timeSpent, sectionBreakdown }: TimeSpentSectionProps) => {
  return (
    <div>
      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        Time Spent
      </h3>
      <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{timeSpent} minutes</span>
          {timeSpent > 0 && (
            <span className="text-xs text-primary font-medium">
              {Math.round(timeSpent / 60 * 10) / 10}h
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {Object.keys(sectionBreakdown).length > 0 ? 'Actual time tracked' : 'Estimated based on activity'}
        </p>
        
        {/* Section breakdown */}
        {Object.keys(sectionBreakdown).length > 0 && (
          <div className="mt-2 space-y-1">
            {Object.entries(sectionBreakdown)
              .filter(([_, time]) => time > 0)
              .sort(([_, a], [__, b]) => b - a)
              .slice(0, 3)
              .map(([section, time]) => (
                <div key={section} className="flex justify-between text-xs text-muted-foreground">
                  <span>{section}:</span>
                  <span>{Math.round(time)}m</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
