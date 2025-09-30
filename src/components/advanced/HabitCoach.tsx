import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Sparkles, TrendingUp, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CoachingStats {
  completedToday: number;
  totalHabits: number;
  completionRate: number;
  streaks: Array<{ habit: string; streak: number }>;
}

export const HabitCoach: React.FC = () => {
  const [coaching, setCoaching] = useState<string>('');
  const [stats, setStats] = useState<CoachingStats | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchDailyCoaching = async () => {
    try {
      setLoading(true);
      console.log('Fetching daily coaching...');

      const { data, error } = await supabase.functions.invoke('daily-habit-coaching');

      if (error) {
        console.error('Error fetching coaching:', error);
        if (error.message?.includes('Rate limit')) {
          toast({
            title: "Rate Limit Reached",
            description: "Too many requests. Please try again in a moment.",
            variant: "destructive",
          });
          return;
        }
        if (error.message?.includes('credits')) {
          toast({
            title: "AI Credits Depleted",
            description: "Please add funds to your workspace to continue using AI features.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      if (data?.coaching) {
        setCoaching(data.coaching);
        setStats(data.stats);
        console.log('Coaching fetched successfully');
      }
    } catch (error) {
      console.error('Failed to fetch coaching:', error);
      toast({
        title: "Error",
        description: "Failed to load your daily coaching. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyCoaching();
  }, []);

  if (loading && !coaching) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Your AI Habit Coach
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              <span className="text-sm text-muted-foreground">Preparing your personalized coaching...</span>
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-4 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Your AI Habit Coach
          </CardTitle>
          <Badge variant="secondary" className="gap-1">
            <MessageCircle className="h-3 w-3" />
            Daily Guidance
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary">{stats.completionRate}%</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">Today's Progress</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold">{stats.completedToday}/{stats.totalHabits}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary">
                {Math.max(...stats.streaks.map(s => s.streak), 0)}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">Best Streak</div>
            </div>
          </div>
        )}

        {/* Coaching Message */}
        <div className="prose prose-sm max-w-none">
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {coaching || 'Getting your personalized coaching ready...'}
            </div>
          </div>
        </div>

        {/* Current Streaks */}
        {stats && stats.streaks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              Active Streaks
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {stats.streaks.map((streak, idx) => (
                <div key={idx} className="p-2 sm:p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm font-medium truncate">{streak.habit}</div>
                  <div className="text-xs text-muted-foreground">
                    <Target className="h-3 w-3 inline mr-1" />
                    {streak.streak} day{streak.streak !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="flex justify-center pt-2">
          <Button 
            variant="outline" 
            onClick={fetchDailyCoaching}
            disabled={loading}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {loading ? 'Updating...' : 'Refresh Coaching'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};