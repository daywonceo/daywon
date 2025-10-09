import { Heart, BookOpen, ChefHat, Dumbbell, MessageCircle, Church, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface GuidanceActivity {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  reference?: string;
  details?: string;
  duration?: number;
  category?: string;
}

interface GuidanceActivitiesSectionProps {
  activities: GuidanceActivity[];
  loading: boolean;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "verse":
      return <BookOpen className="h-4 w-4 text-accent" />;
    case "recipe":
      return <ChefHat className="h-4 w-4 text-warning" />;
    case "workout":
      return <Dumbbell className="h-4 w-4 text-primary" />;
    case "reflection":
      return <MessageCircle className="h-4 w-4 text-secondary" />;
    case "devotion":
      return <Church className="h-4 w-4 text-accent" />;
    case "sermon":
      return <Play className="h-4 w-4 text-primary" />;
    default:
      return <Heart className="h-4 w-4 text-muted-foreground" />;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "verse":
      return "Bible Verses";
    case "recipe":
      return "Recipes";
    case "workout":
      return "Workouts";
    case "reflection":
      return "Reflections";
    case "devotion":
      return "Devotions";
    case "sermon":
      return "Sermons";
    default:
      return type;
  }
};

const formatTime = (timestamp: string) => {
  return format(new Date(timestamp), "h:mm a");
};

export const GuidanceActivitiesSection = ({ activities, loading }: GuidanceActivitiesSectionProps) => {
  const groupedActivities = activities.reduce((acc, activity) => {
    if (!acc[activity.type]) {
      acc[activity.type] = [];
    }
    acc[activity.type].push(activity);
    return acc;
  }, {} as Record<string, GuidanceActivity[]>);

  return (
    <div>
      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
        <Heart className="h-5 w-5 text-accent" />
        Guidance Activities
      </h3>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading activities...</p>
      ) : activities.length > 0 ? (
        <div className="space-y-4">
          {Object.entries(groupedActivities).map(([type, typeActivities]) => (
            <div key={type} className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                {getActivityIcon(type)}
                {getTypeLabel(type)}
              </h4>
              <div className="space-y-2">
                {typeActivities.map((activity) => (
                  <div key={activity.id} className="bg-accent/30 p-3 rounded-lg border border-border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{activity.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(activity.timestamp)}
                          </span>
                        </div>
                        {activity.reference && (
                          <div className="text-xs text-muted-foreground mb-1">
                            {activity.reference}
                          </div>
                        )}
                        {activity.details && (
                          <div className="text-xs text-muted-foreground">
                            {activity.details}
                          </div>
                        )}
                        {activity.duration && (
                          <div className="text-xs text-muted-foreground">
                            Duration: {activity.duration} minutes
                          </div>
                        )}
                      </div>
                      {activity.category && (
                        <Badge variant="outline" className="text-xs">
                          {activity.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No guidance activities this day</p>
      )}
    </div>
  );
};
