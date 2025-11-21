import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { calculateStreaks } from '@/utils/shared/streakCalculations';
import { getUserTimeWindowSync } from '@/utils/userTimeWindow';

interface AnalyticsData {
  overview: {
    totalHabits: number;
    activeStreaks: number;
    completionRate: number;
    totalWorkouts: number;
    appUsageHours: number;
  };
  trends: {
    weeklyCompletion: any[];
    monthlyProgress: any[];
    habitPerformance: any[];
  };
  insights: {
    bestDay: string;
    currentStreak: number;
    favoriteCategory: string;
    totalSocialPosts: number;
  };
}

export const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    }
    
    const handleHabitUpdate = () => {
      if (user) {
        loadAnalyticsData();
      }
    };
    
    window.addEventListener('habitUpdated', handleHabitUpdate);
    window.addEventListener('habitStatusChanged', handleHabitUpdate);
    
    return () => {
      window.removeEventListener('habitUpdated', handleHabitUpdate);
      window.removeEventListener('habitStatusChanged', handleHabitUpdate);
    };
  }, [user, selectedPeriod]);

  const loadAnalyticsData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const now = new Date();
      
      let periodStart: Date;
      let periodEnd: Date;
      
      if (selectedPeriod === 'week') {
        const { startDate } = getUserTimeWindowSync("week");
        periodStart = startDate;
        periodEnd = now;
      } else if (selectedPeriod === 'month') {
        periodStart = subDays(now, 30);
        periodEnd = subDays(now, 1);
      } else {
        periodStart = subDays(now, 365);
        periodEnd = now;
      }

      const [
        habitsResponse,
        activitiesResponse,
        workoutsResponse,
        postsResponse,
        sessionsResponse
      ] = await Promise.all([
        supabase.from('habits').select('id, name, created_at, status, user_id').eq('user_id', user.id).eq('status', 'active'),
        supabase.from('habit_activities').select('*')
          .eq('user_id', user.id)
          .gte('activity_date', format(periodStart, 'yyyy-MM-dd'))
          .lte('activity_date', format(periodEnd, 'yyyy-MM-dd')),
        supabase.from('workout_sessions').select('*')
          .eq('user_id', user.id)
          .gte('workout_date', format(periodStart, 'yyyy-MM-dd')),
        supabase.from('social_posts').select('*')
          .eq('user_id', user.id)
          .gte('created_at', periodStart.toISOString()),
        supabase.from('app_sessions').select('*')
          .eq('user_id', user.id)
          .gte('session_date', format(periodStart, 'yyyy-MM-dd'))
      ]);

      const habits = habitsResponse.data || [];
      const activities = activitiesResponse.data || [];
      const workouts = workoutsResponse.data || [];
      const posts = postsResponse.data || [];
      const sessions = sessionsResponse.data || [];

      const analytics = processAnalyticsData(habits, activities, workouts, posts, sessions, periodStart, periodEnd);
      setAnalyticsData(analytics);
      
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (habits: any[], activities: any[], workouts: any[], posts: any[], sessions: any[], periodStart: Date, periodEnd: Date): AnalyticsData => {
    const habitCreationDates = new Map<string, Date>();
    habits.forEach(habit => {
      habitCreationDates.set(habit.id, new Date(habit.created_at));
    });
    
    const totalHabits = habits.filter(h => h.status === 'active').length;
    
    const validActivities = activities.filter(activity => {
      const habitCreated = habitCreationDates.get(activity.habit_id);
      if (!habitCreated) return true;
      const activityDate = new Date(activity.activity_date);
      return activityDate >= habitCreated;
    });
    
    let completedCount = 0;
    let totalPossible = 0;
    
    habits.filter(h => h.status === 'active').forEach(habit => {
      const habitCreated = habitCreationDates.get(habit.id);
      const effectiveStart = habitCreated && habitCreated > periodStart ? habitCreated : periodStart;
      
      const activities = validActivities.filter(a => {
        const activityDate = new Date(a.activity_date);
        return a.habit_id === habit.id && 
               activityDate >= effectiveStart && 
               activityDate <= periodEnd &&
               a.status === 'completed';
      });
      
      const completed = activities.length;
      const msPerDay = 1000 * 60 * 60 * 24;
      const expectedDays = Math.floor((periodEnd.getTime() - effectiveStart.getTime()) / msPerDay) + 1;
      
      totalPossible += expectedDays;
      completedCount += completed;
    });
    
    const completionRate = totalPossible > 0 ? (completedCount / totalPossible) * 100 : 0;
    const activeStreaks = habits.filter(h => h.status === 'active').length;
    
    const totalAppUsage = sessions.reduce((sum, session) => sum + (session.total_time_minutes || 0), 0);
    const appUsageHours = Math.round(totalAppUsage / 60 * 10) / 10;

    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const expectedHabitsForDay = habits.filter(habit => {
        const habitCreated = habitCreationDates.get(habit.id);
        return habit.status === 'active' && (!habitCreated || date >= habitCreated);
      }).length;
      
      const dayActivities = validActivities.filter(a => 
        format(new Date(a.activity_date), 'yyyy-MM-dd') === dateStr
      );
      const completed = dayActivities.filter(a => a.status === 'completed').length;
      
      const completionPercentage = expectedHabitsForDay > 0 
        ? Math.round((completed / expectedHabitsForDay) * 100) 
        : 0;
      
      weeklyData.push({
        date: format(date, 'MMM dd'),
        completion: completionPercentage,
        completed,
        total: expectedHabitsForDay
      });
    }

    const habitStats = new Map<string, { completed: Set<string>; habitId: string; created: Date }>();
    
    validActivities.forEach(activity => {
      const habitName = activity.habit_name || 'Other';
      if (!habitStats.has(habitName)) {
        habitStats.set(habitName, {
          completed: new Set<string>(),
          habitId: activity.habit_id,
          created: habitCreationDates.get(activity.habit_id) || periodStart
        });
      }
      
      if (activity.status === 'completed') {
        habitStats.get(habitName)!.completed.add(activity.activity_date);
      }
    });
    
    const habitPerformance = Array.from(habitStats.entries())
      .map(([name, stats]) => {
        const habitCreated = stats.created;
        const effectiveStart = habitCreated > periodStart ? habitCreated : periodStart;
        
        const msPerDay = 1000 * 60 * 60 * 24;
        const expectedDays = Math.floor((periodEnd.getTime() - effectiveStart.getTime()) / msPerDay) + 1;
        
        const completed = stats.completed.size;
        const completion = expectedDays > 0 ? Math.round((completed / expectedDays) * 100) : 0;
        
        return {
          name,
          completion,
          completed,
          total: expectedDays
        };
      })
      .sort((a, b) => b.completion - a.completion)
      .slice(0, 5);

    const dayOfWeekStats: { [key: string]: number } = {};
    validActivities.forEach(activity => {
      if (activity.status === 'completed') {
        const dayOfWeek = format(new Date(activity.activity_date), 'EEEE');
        dayOfWeekStats[dayOfWeek] = (dayOfWeekStats[dayOfWeek] || 0) + 1;
      }
    });
    
    const bestDay = Object.entries(dayOfWeekStats)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Monday';

    const favoriteCategory = habitPerformance[0]?.name || 'Wellness';

    let currentStreak = 0;
    const activitiesByHabitForStreak = new Map<string, any[]>();
    validActivities.forEach(activity => {
      const habitId = activity.habit_id;
      if (!activitiesByHabitForStreak.has(habitId)) {
        activitiesByHabitForStreak.set(habitId, []);
      }
      activitiesByHabitForStreak.get(habitId)!.push(activity);
    });
    
    activitiesByHabitForStreak.forEach((habitActivities) => {
      const streakData = calculateStreaks(habitActivities);
      if (streakData.currentStreak > currentStreak) {
        currentStreak = streakData.currentStreak;
      }
    });

    return {
      overview: {
        totalHabits,
        activeStreaks,
        completionRate,
        totalWorkouts: workouts.length,
        appUsageHours
      },
      trends: {
        weeklyCompletion: weeklyData,
        monthlyProgress: weeklyData,
        habitPerformance
      },
      insights: {
        bestDay,
        currentStreak,
        favoriteCategory,
        totalSocialPosts: posts.length
      }
    };
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-3 sm:p-4">
        <div className="space-y-3">
          <div className="h-6 bg-muted/50 rounded animate-pulse w-48" />
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-muted/50 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="max-w-7xl mx-auto p-3 sm:p-4 text-center">
        <p className="text-muted-foreground text-sm">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 space-y-3">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">Track your progress and insights</p>
        </div>
        
        <div className="flex gap-1.5">
          {(['week', 'month', 'year'] as const).map((period) => (
            <Button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              className="capitalize text-xs h-8 px-3"
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* Compact Overview Grid - No Icons */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
        <Card className="border-border/50">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground mb-1">Active Habits</p>
            <p className="text-xl font-bold">{analyticsData.overview.totalHabits}</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground mb-1">Completion</p>
            <p className="text-xl font-bold">{analyticsData.overview.completionRate.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground mb-1">Streaks</p>
            <p className="text-xl font-bold">{analyticsData.overview.activeStreaks}</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground mb-1">Workouts</p>
            <p className="text-xl font-bold">{analyticsData.overview.totalWorkouts}</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground mb-1">App Time</p>
            <p className="text-xl font-bold">{analyticsData.overview.appUsageHours}h</p>
          </CardContent>
        </Card>
      </div>

      {/* Compact Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="border-border/50">
          <CardHeader className="pb-2 px-4 pt-3">
            <CardTitle className="text-base">Weekly Completion</CardTitle>
            <CardDescription className="text-xs">Last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="pb-3 px-4">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={analyticsData.trends.weeklyCompletion}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '10px' }}
                  tickMargin={8}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '10px' }}
                  domain={[0, 100]}
                  tickMargin={8}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="completion" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2 px-4 pt-3">
            <CardTitle className="text-base">Habit Performance</CardTitle>
            <CardDescription className="text-xs">Top 5 habits</CardDescription>
          </CardHeader>
          <CardContent className="pb-3 px-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analyticsData.trends.habitPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '9px' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tickMargin={4}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '10px' }}
                  domain={[0, 100]}
                  tickMargin={8}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                  formatter={(value: any) => [`${value}%`, 'Completion']}
                />
                <Bar 
                  dataKey="completion" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Compact Insights Grid - No Icons */}
      <Card className="border-border/50">
        <CardHeader className="pb-2 px-4 pt-3">
          <CardTitle className="text-base">Insights</CardTitle>
          <CardDescription className="text-xs">Your key highlights</CardDescription>
        </CardHeader>
        <CardContent className="pb-3 px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <div className="p-2.5 rounded-md bg-muted/30">
              <p className="text-xs text-muted-foreground">Best Day</p>
              <p className="text-sm font-semibold mt-0.5">{analyticsData.insights.bestDay}</p>
            </div>
            
            <div className="p-2.5 rounded-md bg-muted/30">
              <p className="text-xs text-muted-foreground">Current Streak</p>
              <p className="text-sm font-semibold mt-0.5">{analyticsData.insights.currentStreak} days</p>
            </div>
            
            <div className="p-2.5 rounded-md bg-muted/30">
              <p className="text-xs text-muted-foreground">Top Habit</p>
              <p className="text-sm font-semibold mt-0.5 line-clamp-1">{analyticsData.insights.favoriteCategory}</p>
            </div>
            
            <div className="p-2.5 rounded-md bg-muted/30">
              <p className="text-xs text-muted-foreground">Social Posts</p>
              <p className="text-sm font-semibold mt-0.5">{analyticsData.insights.totalSocialPosts}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
