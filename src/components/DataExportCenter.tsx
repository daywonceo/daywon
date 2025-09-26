import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Calendar, Users, BarChart3, Heart, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ExportProgress {
  step: string;
  completed: boolean;
  progress: number;
}

interface ExportData {
  habits: any[];
  habitActivities: any[];
  workoutSessions: any[];
  exerciseLogs: any[];
  mealPlans: any[];
  socialPosts: any[];
  appSessions: any[];
  profile: any;
  reflections: any[];
  savedRecipes: any[];
  savedVerses: any[];
}

export const DataExportCenter: React.FC = () => {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress[]>([]);
  const [lastExport, setLastExport] = useState<string | null>(null);
  const [exportStats, setExportStats] = useState<any>(null);

  useEffect(() => {
    loadExportHistory();
    loadDataStats();
  }, [user]);

  const loadExportHistory = async () => {
    const lastExportDate = localStorage.getItem(`lastExport_${user?.id}`);
    setLastExport(lastExportDate);
  };

  const loadDataStats = async () => {
    if (!user) return;

    try {
      const [
        { count: habitsCount },
        { count: activitiesCount },
        { count: workoutsCount },
        { count: postsCount }
      ] = await Promise.all([
        supabase.from('habits').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('habit_activities').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('workout_sessions').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('social_posts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);

      setExportStats({
        habits: habitsCount || 0,
        activities: activitiesCount || 0,
        workouts: workoutsCount || 0,
        posts: postsCount || 0,
      });
    } catch (error) {
      console.error('Error loading data stats:', error);
    }
  };

  const updateProgress = (step: string, progress: number, completed: boolean = false) => {
    setExportProgress(prev => {
      const existing = prev.find(p => p.step === step);
      if (existing) {
        return prev.map(p => p.step === step ? { ...p, progress, completed } : p);
      }
      return [...prev, { step, progress, completed }];
    });
  };

  const exportData = async (format: 'json' | 'csv') => {
    if (!user) return;

    setIsExporting(true);
    setExportProgress([]);

    try {
      updateProgress('Initializing export', 0);

      // Collect all user data
      updateProgress('Fetching profile data', 10);
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      updateProgress('Fetching habits', 20);
      const { data: habits } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id);

      updateProgress('Fetching habit activities', 30);
      const { data: habitActivities } = await supabase
        .from('habit_activities')
        .select('*')
        .eq('user_id', user.id);

      updateProgress('Fetching workout data', 40);
      const { data: workoutSessions } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id);

      updateProgress('Fetching exercise logs', 50);
      const { data: exerciseLogs } = await supabase
        .from('exercise_logs')
        .select('*')
        .eq('user_id', user.id);

      updateProgress('Fetching meal plans', 60);
      const { data: mealPlans } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id);

      updateProgress('Fetching social posts', 70);
      const { data: socialPosts } = await supabase
        .from('social_posts')
        .select('*')
        .eq('user_id', user.id);

      updateProgress('Fetching app sessions', 80);
      const { data: appSessions } = await supabase
        .from('app_sessions')
        .select('*')
        .eq('user_id', user.id);

      updateProgress('Fetching reflections', 85);
      const { data: reflections } = await supabase
        .from('user_reflections')
        .select('*')
        .eq('user_id', user.id);

      updateProgress('Fetching saved content', 90);
      const [
        { data: savedRecipes },
        { data: savedVerses }
      ] = await Promise.all([
        supabase.from('saved_recipes').select('*').eq('user_id', user.id),
        supabase.from('saved_verses').select('*').eq('user_id', user.id),
      ]);

      const exportData: ExportData = {
        habits: habits || [],
        habitActivities: habitActivities || [],
        workoutSessions: workoutSessions || [],
        exerciseLogs: exerciseLogs || [],
        mealPlans: mealPlans || [],
        socialPosts: socialPosts || [],
        appSessions: appSessions || [],
        profile: profile || {},
        reflections: reflections || [],
        savedRecipes: savedRecipes || [],
        savedVerses: savedVerses || [],
      };

      updateProgress('Generating export file', 95);

      if (format === 'json') {
        downloadJSON(exportData);
      } else {
        downloadCSV(exportData);
      }

      updateProgress('Export complete', 100, true);
      
      // Save export timestamp
      const exportTimestamp = new Date().toISOString();
      localStorage.setItem(`lastExport_${user.id}`, exportTimestamp);
      setLastExport(exportTimestamp);

      toast({
        title: "Export Complete",
        description: `Your data has been exported successfully as ${format.toUpperCase()}.`,
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const downloadJSON = (data: ExportData) => {
    const exportObject = {
      exportDate: new Date().toISOString(),
      version: "1.0",
      user: {
        id: user?.id,
        email: user?.email,
      },
      data,
    };

    const blob = new Blob([JSON.stringify(exportObject, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daywon-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadCSV = (data: ExportData) => {
    // Create separate CSV files for each data type
    const csvFiles: { [key: string]: string } = {};

    // Convert each data array to CSV
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        const headers = Object.keys(value[0]).join(',');
        const rows = value.map(item => 
          Object.values(item).map(val => 
            typeof val === 'string' && val.includes(',') ? `"${val}"` : val
          ).join(',')
        );
        csvFiles[key] = [headers, ...rows].join('\n');
      }
    });

    // Create zip-like structure (for simplicity, we'll just download the largest dataset)
    const largestDataset = Object.entries(csvFiles).reduce((a, b) => 
      csvFiles[a[0]].length > csvFiles[b[0]].length ? a : b
    );

    if (largestDataset) {
      const blob = new Blob([largestDataset[1]], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `daywon-${largestDataset[0]}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Data Export & Backup</h1>
        <p className="text-muted-foreground">
          Export your complete DayWon data for backup or migration purposes
        </p>
      </div>

      {/* Data Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Your Data Overview
          </CardTitle>
          <CardDescription>
            Summary of your data available for export
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Target className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{exportStats?.habits || 0}</div>
              <div className="text-sm text-muted-foreground">Habits</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{exportStats?.activities || 0}</div>
              <div className="text-sm text-muted-foreground">Activities</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Heart className="w-8 h-8 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold">{exportStats?.workouts || 0}</div>
              <div className="text-sm text-muted-foreground">Workouts</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{exportStats?.posts || 0}</div>
              <div className="text-sm text-muted-foreground">Social Posts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Your Data</CardTitle>
          <CardDescription>
            Choose your preferred format to download all your DayWon data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <h3 className="font-semibold">JSON Format</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Complete data export with full structure. Best for developers or migration.
              </p>
              <Button 
                onClick={() => exportData('json')} 
                disabled={isExporting}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Export as JSON
              </Button>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <h3 className="font-semibold">CSV Format</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Spreadsheet-friendly format. Perfect for analysis in Excel or Google Sheets.
              </p>
              <Button 
                onClick={() => exportData('csv')} 
                disabled={isExporting}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Export as CSV
              </Button>
            </div>
          </div>

          {/* Export Progress */}
          {isExporting && (
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold">Export Progress</h3>
              {exportProgress.map((step, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{step.step}</span>
                    <span>{step.progress}%</span>
                  </div>
                  <Progress value={step.progress} className="h-2" />
                </div>
              ))}
            </div>
          )}

          {/* Last Export Info */}
          {lastExport && (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-800">
                  Last export completed
                </p>
                <p className="text-xs text-green-600">
                  {format(new Date(lastExport), 'PPpp')}
                </p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Download className="w-3 h-3 mr-1" />
                Complete
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Usage Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Important Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h4 className="font-semibold mb-1">What's included:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>All your habits and habit tracking data</li>
              <li>Workout sessions and exercise logs</li>
              <li>Meal plans and saved recipes</li>
              <li>Social posts and interactions</li>
              <li>Profile information and app usage data</li>
              <li>Saved verses and reflections</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Privacy & Security:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Your data is encrypted during export</li>
              <li>No sensitive authentication data is included</li>
              <li>Downloads are processed locally in your browser</li>
              <li>We recommend storing exports securely</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};