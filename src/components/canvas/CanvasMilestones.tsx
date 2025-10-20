import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Sparkles, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { useEffect, useState } from "react";

interface CanvasMilestonesProps {
  completionPercentage: number;
  totalTiles: number;
  filledTiles: number;
  totalCanvasesCompleted?: number;
}

export default function CanvasMilestones({ 
  completionPercentage, 
  totalTiles,
  filledTiles,
  totalCanvasesCompleted = 0
}: CanvasMilestonesProps) {
  const [lastPercentage, setLastPercentage] = useState(completionPercentage);
  
  const milestones = [
    { threshold: 25, icon: Star, label: "First Quarter", color: "text-primary" },
    { threshold: 50, icon: Sparkles, label: "Halfway There", color: "text-secondary" },
    { threshold: 75, icon: Award, label: "Almost Complete", color: "text-accent" },
    { threshold: 100, icon: Trophy, label: "Canvas Master", color: "text-primary" },
  ];

  const achievedMilestones = milestones.filter(m => completionPercentage >= m.threshold);
  const nextMilestone = milestones.find(m => completionPercentage < m.threshold);

  // Trigger confetti on milestone achievement
  useEffect(() => {
    if (completionPercentage > lastPercentage) {
      const newMilestone = milestones.find(
        m => completionPercentage >= m.threshold && lastPercentage < m.threshold
      );
      
      if (newMilestone) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
    setLastPercentage(completionPercentage);
  }, [completionPercentage]);

  return (
    <div className="space-y-3">
      {/* Achieved Milestones */}
      {achievedMilestones.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {achievedMilestones.map((milestone) => {
            const Icon = milestone.icon;
            return (
              <Badge
                key={milestone.threshold}
                variant="secondary"
                className={cn("gap-1.5 animate-scale-in", milestone.color)}
              >
                <Icon className="w-3 h-3" />
                {milestone.label}
              </Badge>
            );
          })}
        </div>
      )}

      {/* Next Milestone Progress */}
      {nextMilestone && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              Next: {nextMilestone.label}
            </span>
            <span>{Math.ceil((nextMilestone.threshold / 100 * totalTiles) - filledTiles)} tiles to go</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Total Canvases Completed */}
      {totalCanvasesCompleted > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">
            Total Canvases: <span className="font-semibold text-foreground">{totalCanvasesCompleted}</span>
          </span>
        </div>
      )}
    </div>
  );
}
