import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Palette, Sparkles } from "lucide-react";
import { format, subDays, parseISO } from "date-fns";

// Map habit categories to colors
const CATEGORY_COLORS = {
  'Physical': 'bg-blue-500',
  'Mental': 'bg-purple-500',
  'Professional': 'bg-green-500',
  'Financial': 'bg-yellow-500',
  'Relational': 'bg-pink-500',
  'Personal': 'bg-indigo-500',
  'Spiritual': 'bg-cyan-500',
  'Health': 'bg-red-500',
  'default': 'bg-primary'
};

const HABIT_NAME_COLORS: Record<string, string> = {
  'workout': 'bg-blue-500',
  'exercise': 'bg-blue-400',
  'run': 'bg-blue-600',
  'devotion': 'bg-purple-500',
  'prayer': 'bg-purple-400',
  'meditation': 'bg-purple-300',
  'read': 'bg-green-500',
  'journal': 'bg-green-400',
  'write': 'bg-green-600',
  'water': 'bg-cyan-500',
  'sleep': 'bg-indigo-500',
  'meal prep': 'bg-orange-500',
  'cook': 'bg-orange-400',
  'budget': 'bg-yellow-500',
  'save': 'bg-yellow-600',
  'friend': 'bg-pink-500',
  'family': 'bg-pink-400',
  'social': 'bg-pink-600',
};

interface HabitCanvasProps {
  userHabits: string[];
}

interface HabitActivity {
  id: string;
  habit_name: string;
  activity_date: string;
  status: string;
}

export default function HabitCanvas({ userHabits }: HabitCanvasProps) {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [animatedTiles, setAnimatedTiles] = useState<number[]>([]);
  const [activities, setActivities] = useState<HabitActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Fetch last 30 days of completed habit activities
  useEffect(() => {
    if (!user) return;

    const fetchActivities = async () => {
      const endDate = format(new Date(), 'yyyy-MM-dd');
      const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('habit_activities')
        .select('id, habit_name, activity_date, status')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('activity_date', startDate)
        .lte('activity_date', endDate)
        .order('activity_date', { ascending: false });

      if (error) {
        console.error('Error fetching activities:', error);
      } else {
        setActivities(data || []);
      }
      
      setIsLoading(false);
    };

    fetchActivities();
  }, [user]);
  
  // Create tiles data - each completed habit adds a colored tile
  const tiles = activities.slice(0, 60).map((activity, index) => {
    // Determine color based on habit name
    const habitNameLower = activity.habit_name?.toLowerCase() || '';
    let color = CATEGORY_COLORS.default;
    
    // Try to match habit name to a color
    for (const [key, value] of Object.entries(HABIT_NAME_COLORS)) {
      if (habitNameLower.includes(key)) {
        color = value;
        break;
      }
    }
    
    return {
      id: activity.id,
      color,
      habitName: activity.habit_name,
      date: activity.activity_date,
      index
    };
  });

  // Animate tiles on mount
  useEffect(() => {
    if (tiles.length > 0) {
      tiles.forEach((_, index) => {
        setTimeout(() => {
          setAnimatedTiles(prev => [...prev, index]);
        }, index * 30); // Stagger animation
      });
    }
  }, [tiles.length]);

  // Fill remaining slots with empty tiles
  const totalTiles = 60;
  const emptyTilesCount = Math.max(0, totalTiles - tiles.length);

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Your Canvas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-[16/9] bg-muted/20 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const completionPercentage = Math.round((tiles.length / totalTiles) * 100);

  return (
    <Card className={cn(
      "glass-card transition-all duration-700",
      isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Your Canvas
          </CardTitle>
          {tiles.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-semibold text-primary">{completionPercentage}%</span> complete
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Each colored tile represents a completed habit - watch your masterpiece grow!
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="relative">
          {/* Canvas frame */}
          <div className="border-4 border-border rounded-lg p-3 bg-card/50 shadow-inner">
            {/* Grid of tiles */}
            <div className="grid grid-cols-10 gap-1.5 md:gap-2">
              {tiles.map((tile, index) => (
                <div
                  key={tile.id}
                  className={cn(
                    "aspect-square rounded transition-all duration-500",
                    tile.color,
                    "shadow-sm hover:scale-110 hover:shadow-lg cursor-pointer",
                    "transform",
                    animatedTiles.includes(index) 
                      ? "scale-100 opacity-100" 
                      : "scale-0 opacity-0"
                  )}
                  title={`${tile.habitName} - ${format(parseISO(tile.date), 'MMM d')}`}
                />
              ))}
              
              {/* Empty tiles */}
              {Array.from({ length: emptyTilesCount }, (_, i) => (
                <div
                  key={`empty-${i}`}
                  className="aspect-square rounded bg-muted/20 border border-muted/30"
                />
              ))}
            </div>
          </div>

          {/* Progress indicator */}
          {tiles.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/80 rounded-lg">
              <div className="text-center p-4">
                <Palette className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">
                  Complete habits to paint your canvas!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        {tiles.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Last 30 days • {tiles.length} habits completed
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
