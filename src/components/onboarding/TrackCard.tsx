
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface HabitTrack {
  id: string;
  name: string;
  emoji: string;
  duration: number;
  durationUnit: 'days' | 'weeks';
  habits: string[];
  description?: string;
}

interface TrackCardProps {
  track: HabitTrack;
  isSelected: boolean;
  onSelect: (track: HabitTrack) => void;
}

const TrackCard: React.FC<TrackCardProps> = ({ track, isSelected, onSelect }) => {
  return (
    <Card 
      className={cn(
        "w-72 flex-shrink-0 cursor-pointer transition-all duration-200 hover:shadow-lg",
        isSelected 
          ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20" 
          : "hover:shadow-md"
      )}
      onClick={() => onSelect(track)}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{track.emoji}</span>
          <div>
            <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">
              {track.name}
            </h3>
            <Badge variant="outline" className="text-xs">
              {track.duration} {track.durationUnit}
            </Badge>
          </div>
        </div>
        
        {track.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {track.description}
          </p>
        )}
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Included habits:
          </p>
          <div className="space-y-1">
            {track.habits.slice(0, 3).map((habit, index) => (
              <p key={index} className="text-xs text-gray-600 dark:text-gray-400">
                • {habit}
              </p>
            ))}
            {track.habits.length > 3 && (
              <p className="text-xs text-gray-500 dark:text-gray-500">
                +{track.habits.length - 3} more...
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrackCard;
