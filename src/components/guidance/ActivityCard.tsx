
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, MapPin, Check, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Activity {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  type: string;
  location: string;
  mood: string;
  energyLevel: string;
  timeRange: string;
  emoji: string;
}

interface ActivityCardProps {
  activity: Activity;
  isCompleted: boolean;
  onComplete: (activityId: string) => void;
  onFavorite: (activityId: string) => void;
  isFavorite: boolean;
  isHighlighted?: boolean;
}

const ActivityCard = ({
  activity,
  isCompleted,
  onComplete,
  onFavorite,
  isFavorite,
  isHighlighted = false
}: ActivityCardProps) => {
  const { toast } = useToast();

  const handleComplete = () => {
    onComplete(activity.id);
    toast({
      title: "Activity Completed!",
      description: `Great job completing "${activity.title}"!`,
    });
  };

  const handleFavorite = () => {
    onFavorite(activity.id);
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite ? "Activity removed from your favorites" : "Activity added to your favorites",
    });
  };

  return (
    <Card className={`bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 ${
      isHighlighted ? 'ring-2 ring-green-500 animate-scale-in' : ''
    } ${isCompleted ? 'opacity-75' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-green-800 dark:text-green-400 flex items-center text-lg">
              {activity.title}
              {isCompleted && <Check className="w-5 h-5 ml-2 text-green-600" />}
            </CardTitle>
            <CardDescription className="mt-2">
              {activity.description}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFavorite}
            className={`ml-2 ${isFavorite ? 'text-warning' : 'text-muted-foreground'}`}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
          <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {activity.duration}
          </span>
          <span className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {activity.type}
          </span>
          <span className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {activity.location}
          </span>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">{activity.category}</Badge>
          {isFavorite && <Badge variant="outline">Favorite</Badge>}
        </div>
        <Button 
          onClick={handleComplete}
          disabled={isCompleted}
          className={`w-full ${
            isCompleted 
              ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' 
              : 'bg-success hover:opacity-90'
          }`}
        >
          {isCompleted ? "Completed!" : "Mark as Done"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ActivityCard;
