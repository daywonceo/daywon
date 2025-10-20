import { useEffect, useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Palette, Sparkles } from "lucide-react";
import { format, subDays, parseISO, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import CanvasTimeRangeSelector from "./canvas/CanvasTimeRangeSelector";
import CanvasTileDetail from "./canvas/CanvasTileDetail";
import CanvasLegend from "./canvas/CanvasLegend";
import CanvasMilestones from "./canvas/CanvasMilestones";
import CanvasInsights from "./canvas/CanvasInsights";
import CanvasExport from "./canvas/CanvasExport";
import CanvasStats from "./canvas/CanvasStats";

// Map habit categories to semantic colors
const CATEGORY_COLORS = {
  'Physical': 'bg-primary',
  'Mental': 'bg-secondary',
  'Professional': 'bg-accent',
  'Financial': 'bg-primary/80',
  'Relational': 'bg-secondary/80',
  'Personal': 'bg-accent/80',
  'Spiritual': 'bg-primary/60',
  'Health': 'bg-secondary/60',
  'default': 'bg-primary'
};

const HABIT_NAME_COLORS: Record<string, string> = {
  'workout': 'bg-primary',
  'exercise': 'bg-primary/90',
  'run': 'bg-primary/80',
  'devotion': 'bg-secondary',
  'prayer': 'bg-secondary/90',
  'meditation': 'bg-secondary/80',
  'read': 'bg-accent',
  'journal': 'bg-accent/90',
  'write': 'bg-accent/80',
  'water': 'bg-primary/70',
  'sleep': 'bg-secondary/70',
  'meal prep': 'bg-accent/70',
  'cook': 'bg-accent/60',
  'budget': 'bg-primary/50',
  'save': 'bg-secondary/50',
  'friend': 'bg-accent/50',
  'family': 'bg-primary/40',
  'social': 'bg-secondary/40',
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
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animatedTiles, setAnimatedTiles] = useState<number[]>([]);
  const [activities, setActivities] = useState<HabitActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90' | 'all'>('30');
  const [selectedTile, setSelectedTile] = useState<any>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Fetch activities based on time range
  useEffect(() => {
    if (!user) return;

    const fetchActivities = async () => {
      const endDate = format(new Date(), 'yyyy-MM-dd');
      let startDate: string;
      
      switch (timeRange) {
        case '7':
          startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');
          break;
        case '30':
          startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
          break;
        case '90':
          startDate = format(subDays(new Date(), 90), 'yyyy-MM-dd');
          break;
        case 'all':
          startDate = format(subDays(new Date(), 365), 'yyyy-MM-dd'); // Last year for "all"
          break;
      }
      
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
  }, [user, timeRange]);
  
  // Calculate grid dimensions based on time range
  const gridConfig = useMemo(() => {
    switch (timeRange) {
      case '7':
        return { cols: 7, rows: 1, total: 7 };
      case '30':
        return { cols: 10, rows: 6, total: 60 };
      case '90':
        return { cols: 10, rows: 9, total: 90 };
      case 'all':
        return { cols: 10, rows: 12, total: 120 };
    }
  }, [timeRange]);

  // Create tiles data - each completed habit adds a colored tile
  const tiles = useMemo(() => {
    const filteredActivities = activeFilters.length > 0
      ? activities.filter(a => activeFilters.includes(a.habit_name))
      : activities;
      
    return filteredActivities.slice(0, gridConfig.total).map((activity, index) => {
      const habitNameLower = activity.habit_name?.toLowerCase() || '';
      let color = CATEGORY_COLORS.default;
      
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
  }, [activities, gridConfig.total, activeFilters]);

  // Calculate insights
  const insights = useMemo(() => {
    if (activities.length === 0) return {};
    
    // Most active day of week
    const dayCount: Record<string, number> = {};
    activities.forEach(a => {
      const day = format(parseISO(a.activity_date), 'EEEE');
      dayCount[day] = (dayCount[day] || 0) + 1;
    });
    const mostActiveDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0];
    
    // Favorite habit (most common)
    const habitCount: Record<string, number> = {};
    activities.forEach(a => {
      habitCount[a.habit_name] = (habitCount[a.habit_name] || 0) + 1;
    });
    const favoriteHabit = Object.entries(habitCount).sort((a, b) => b[1] - a[1])[0]?.[0];
    
    // Current streak (consecutive days with at least one activity)
    const uniqueDates = [...new Set(activities.map(a => a.activity_date))].sort().reverse();
    let streak = 0;
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    
    if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
      for (let i = 0; i < uniqueDates.length; i++) {
        const expectedDate = format(subDays(new Date(), i), 'yyyy-MM-dd');
        if (uniqueDates[i] === expectedDate) {
          streak++;
        } else {
          break;
        }
      }
    }
    
    // Average per day
    const daysInRange = timeRange === '7' ? 7 : timeRange === '30' ? 30 : timeRange === '90' ? 90 : 365;
    const avgPerDay = activities.length / daysInRange;
    
    return {
      mostActiveDay,
      favoriteHabit,
      currentStreak: streak,
      averagePerDay: avgPerDay,
    };
  }, [activities, timeRange]);

  // Calculate habit breakdown for legend
  const habitBreakdown = useMemo(() => {
    const breakdown: Record<string, { count: number; color: string }> = {};
    
    tiles.forEach(tile => {
      if (!breakdown[tile.habitName]) {
        breakdown[tile.habitName] = { count: 0, color: tile.color };
      }
      breakdown[tile.habitName].count++;
    });
    
    return Object.entries(breakdown)
      .map(([name, data]) => ({
        name,
        color: data.color,
        count: data.count,
        percentage: Math.round((data.count / tiles.length) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  }, [tiles]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalTilesPainted = tiles.length;
    const daysInRange = timeRange === '7' ? 7 : timeRange === '30' ? 30 : timeRange === '90' ? 90 : 365;
    const avgTilesPerDay = totalTilesPainted / daysInRange;
    
    // Consistency score (percentage of days with at least one activity)
    const uniqueDates = [...new Set(activities.map(a => a.activity_date))];
    const consistencyScore = Math.round((uniqueDates.length / daysInRange) * 100);
    
    // Next milestone
    const completionPercentage = Math.round((tiles.length / gridConfig.total) * 100);
    const nextMilestoneThreshold = [25, 50, 75, 100].find(t => completionPercentage < t) || 100;
    const tilesToNextMilestone = Math.ceil((nextMilestoneThreshold / 100 * gridConfig.total) - tiles.length);
    
    return {
      totalTilesPainted,
      avgTilesPerDay,
      consistencyScore,
      tilesToNextMilestone: tilesToNextMilestone > 0 ? tilesToNextMilestone : 0,
    };
  }, [tiles, activities, gridConfig.total, timeRange]);

  // Animate tiles on mount or when tiles change
  useEffect(() => {
    setAnimatedTiles([]);
    if (tiles.length > 0) {
      tiles.forEach((_, index) => {
        setTimeout(() => {
          setAnimatedTiles(prev => [...prev, index]);
        }, index * 20);
      });
    }
  }, [tiles.length, timeRange]);

  // Handle filter toggle
  const handleFilterToggle = (habitName: string) => {
    setActiveFilters(prev => 
      prev.includes(habitName)
        ? prev.filter(h => h !== habitName)
        : [...prev, habitName]
    );
  };

  const totalTiles = gridConfig.total;
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
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Your Canvas
            </CardTitle>
            {tiles.length > 0 && (
              <CanvasExport 
                canvasRef={canvasRef}
                completionPercentage={completionPercentage}
                filledTiles={tiles.length}
                totalTiles={totalTiles}
              />
            )}
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Each tile represents a completed habit
            </p>
            <CanvasTimeRangeSelector 
              selectedRange={timeRange}
              onRangeChange={setTimeRange}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Milestones */}
        {tiles.length > 0 && (
          <CanvasMilestones 
            completionPercentage={completionPercentage}
            totalTiles={totalTiles}
            filledTiles={tiles.length}
          />
        )}
        
        {/* Canvas Grid */}
        <div ref={canvasRef} className="relative">
          <div className="border-4 border-border rounded-lg p-3 bg-gradient-to-br from-card/50 to-card/30 shadow-inner relative overflow-hidden">
            {/* Subtle shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-[shimmer_3s_ease-in-out_infinite]" 
                 style={{ backgroundSize: '200% 100%' }} />
            
            {/* Grid of tiles */}
            <div 
              className="grid gap-1.5 md:gap-2 relative z-10"
              style={{ 
                gridTemplateColumns: `repeat(${gridConfig.cols}, minmax(0, 1fr))` 
              }}
            >
              {tiles.map((tile, index) => (
                <div
                  key={tile.id}
                  onClick={() => setSelectedTile(tile)}
                  className={cn(
                    "aspect-square rounded-sm transition-all duration-500 cursor-pointer",
                    tile.color,
                    "shadow-sm hover:scale-110 hover:shadow-lg hover:z-20 hover:ring-2 hover:ring-primary/50",
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
                  className="aspect-square rounded-sm bg-muted/20 border border-muted/30 transition-all hover:bg-muted/30"
                />
              ))}
            </div>
          </div>

          {/* Empty state */}
          {tiles.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/90 rounded-lg backdrop-blur-sm">
              <div className="text-center p-4 animate-fade-in">
                <div className="relative">
                  <Palette className="w-16 h-16 text-muted-foreground mx-auto mb-3 opacity-50 animate-pulse" />
                  <Sparkles className="w-6 h-6 text-primary absolute top-0 right-1/3 animate-bounce" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Start completing habits to paint your canvas!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Legend & Filters */}
        {habitBreakdown.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">Habit Breakdown</h4>
            <CanvasLegend 
              habitBreakdown={habitBreakdown}
              onFilterToggle={handleFilterToggle}
              activeFilters={activeFilters}
            />
          </div>
        )}

        {/* Insights */}
        {tiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">Your Insights</h4>
            <CanvasInsights insights={insights} />
          </div>
        )}

        {/* Stats */}
        {tiles.length > 0 && (
          <CanvasStats stats={stats} />
        )}

        {/* Summary */}
        {tiles.length > 0 && (
          <div className="pt-3 border-t text-center">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{tiles.length}</span> habits completed • 
              <span className="font-semibold text-primary ml-1">{completionPercentage}%</span> of canvas filled
            </p>
          </div>
        )}
      </CardContent>

      {/* Tile Detail Modal */}
      <CanvasTileDetail 
        isOpen={!!selectedTile}
        onClose={() => setSelectedTile(null)}
        tile={selectedTile}
      />
    </Card>
  );
}
