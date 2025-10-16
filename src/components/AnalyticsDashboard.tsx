import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Clock, 
  Award,
  Activity,
  Users,
  BarChart3,
  Zap,
  Heart,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

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
    longestStreak: number;
    favoriteCategory: string;
    totalSocialPosts: number;
  };
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

export const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    }
  }, [user, selectedPeriod]);

  const loadAnalyticsData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const now = new Date();
      const periodStart = selectedPeriod === 'week' 
        ? startOfWeek(now)
        : selectedPeriod === 'month'
        ? startOfMonth(now)
        : subDays(now, 365);
      
      const periodEnd = selectedPeriod === 'week'
        ? endOfWeek(now)
        : selectedPeriod === 'month'
        ? endOfMonth(now)
        : now;

      // Fetch all data in parallel
      const [
        habitsResponse,
        activitiesResponse,
        workoutsResponse,
        postsResponse,
        sessionsResponse
      ] = await Promise.all([
        supabase.from('habits').select('id, name, created_at, status, user_id').eq('user_id', user.id),
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

      // Process data for analytics
      const analytics = processAnalyticsData(habits, activities, workouts, posts, sessions, periodStart, periodEnd);
      setAnalyticsData(analytics);
      
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (habits: any[], activities: any[], workouts: any[], posts: any[], sessions: any[], periodStart: Date, periodEnd: Date): AnalyticsData => {
    // Create a map of habit creation dates
    const habitCreationDates = new Map<string, Date>();
    habits.forEach(habit => {
      habitCreationDates.set(habit.id, new Date(habit.created_at));
    });
    
    // Calculate overview metrics - only include habits from their creation date
    const totalHabits = habits.filter(h => h.status === 'active').length;
    
    // Filter activities to only include those after habit creation
    const validActivities = activities.filter(activity => {
      const habitCreated = habitCreationDates.get(activity.habit_id);
      if (!habitCreated) return true; // Include if we can't find creation date
      const activityDate = new Date(activity.activity_date);
      return activityDate >= habitCreated;
    });
    
    // Calculate days each habit should have been tracked
    const calculateExpectedDays = (habitId: string): number => {
      const habitCreated = habitCreationDates.get(habitId);
      if (!habitCreated) return Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      const effectiveStart = habitCreated > periodStart ? habitCreated : periodStart;
      const daysSinceCreation = Math.ceil((periodEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return Math.max(1, daysSinceCreation);
    };
    
    // Calculate total expected activities for all habits
    const totalExpectedActivities = habits
      .filter(h => h.status === 'active')
      .reduce((sum, habit) => sum + calculateExpectedDays(habit.id), 0);
    
    const completedActivities = validActivities.filter(a => a.status === 'completed').length;
    const completionRate = totalExpectedActivities > 0 ? (completedActivities / totalExpectedActivities) * 100 : 0;
    
    // Calculate streaks (simplified)
    const activeStreaks = habits.filter(h => h.status === 'active').length; // Simplified for demo
    
    const totalAppUsage = sessions.reduce((sum, session) => sum + (session.total_time_minutes || 0), 0);
    const appUsageHours = Math.round(totalAppUsage / 60 * 10) / 10;

    // Weekly completion trends - calculate expected vs actual completion per day
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Count how many habits should be tracked on this day
      const expectedHabitsForDay = habits.filter(habit => {
        const habitCreated = habitCreationDates.get(habit.id);
        return habit.status === 'active' && (!habitCreated || date >= habitCreated);
      }).length;
      
      const dayActivities = validActivities.filter(a => 
        format(new Date(a.activity_date), 'yyyy-MM-dd') === dateStr
      );
      const completed = dayActivities.filter(a => a.status === 'completed').length;
      
      weeklyData.push({
        date: format(date, 'MMM dd'),
        completion: expectedHabitsForDay > 0 ? Math.round((completed / expectedHabitsForDay) * 100) : 0,
        completed,
        total: expectedHabitsForDay
      });
    }

    // Habit category performance - properly calculate completion vs expected days
    const categoryStats: { [key: string]: { completed: number; expected: number; habitId: string } } = {};
    
    // Group activities by habit
    const activitiesByHabit = new Map<string, any[]>();
    validActivities.forEach(activity => {
      const habitName = activity.habit_name || 'Other';
      if (!activitiesByHabit.has(habitName)) {
        activitiesByHabit.set(habitName, []);
      }
      activitiesByHabit.get(habitName)!.push(activity);
    });
    
    // Calculate stats for each habit
    activitiesByHabit.forEach((habitActivities, habitName) => {
      const habitId = habitActivities[0]?.habit_id;
      const expectedDays = calculateExpectedDays(habitId);
      const completedCount = habitActivities.filter(a => a.status === 'completed').length;
      
      categoryStats[habitName] = {
        completed: completedCount,
        expected: expectedDays,
        habitId
      };
    });

    const habitPerformance = Object.entries(categoryStats)
      .map(([name, stats]) => ({
        name,
        completion: stats.expected > 0 ? Math.round((stats.completed / stats.expected) * 100) : 0,
        completed: stats.completed,
        total: stats.expected
      }))
      .sort((a, b) => b.completion - a.completion)
      .slice(0, 5);
    
    console.log('Analytics habit performance:', habitPerformance);

    // Find insights - use validActivities
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
        monthlyProgress: weeklyData, // Simplified for demo
        habitPerformance
      },
      insights: {
        bestDay,
        longestStreak: 15, // Simplified for demo
        favoriteCategory,
        totalSocialPosts: posts.length
      }
    };
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Insights into your habits, progress, and wellness journey
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 rounded-md text-sm capitalize ${
                selectedPeriod === period
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Habits</p>
                <p className="text-2xl font-bold">{analyticsData.overview.totalHabits}</p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{analyticsData.overview.completionRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Streaks</p>
                <p className="text-2xl font-bold">{analyticsData.overview.activeStreaks}</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Workouts</p>
                <p className="text-2xl font-bold">{analyticsData.overview.totalWorkouts}</p>
              </div>
              <Heart className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">App Usage</p>
                <p className="text-2xl font-bold">{analyticsData.overview.appUsageHours}h</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Completion Trend</CardTitle>
            <CardDescription>
              Your habit completion rate over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={analyticsData.trends.weeklyCompletion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Line 
                  type="monotone" 
                  dataKey="completion" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Habit Performance</CardTitle>
            <CardDescription>
              Completion rates by habit category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analyticsData.trends.habitPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  formatter={(value, name, props) => {
                    const data = props.payload;
                    return [
                      `${data.completed}/${data.total} (${value}%)`,
                      'Completion'
                    ];
                  }}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.name || label}
                />
                <Bar dataKey="completion" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Personal Insights
          </CardTitle>
          <CardDescription>
            Key patterns and achievements from your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="font-semibold">Best Day</div>
              <div className="text-sm text-muted-foreground">{analyticsData.insights.bestDay}</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
              <div className="font-semibold">Longest Streak</div>
              <div className="text-sm text-muted-foreground">{analyticsData.insights.longestStreak} days</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Target className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="font-semibold">Top Category</div>
              <div className="text-sm text-muted-foreground">{analyticsData.insights.favoriteCategory}</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <div className="font-semibold">Social Posts</div>
              <div className="text-sm text-muted-foreground">{analyticsData.insights.totalSocialPosts}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};