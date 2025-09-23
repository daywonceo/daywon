import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcw, TrendingUp, Target, Clock, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Summary {
  id: string;
  week_start: string;
  week_end: string;
  summary_text: string;
  metrics: any;
}

const WeeklySummaryCard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadLatest = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('weekly_summaries')
        .select('*')
        .order('week_start', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      setSummary(data || null);
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const regenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('generate-weekly-summary', { body: {} });
      if (error) throw error;
      await loadLatest();
    } catch (e: any) {
      setError(e.message || 'Failed to regenerate');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLatest(); }, []);

  return (
    <Card className="glass border-primary/20 shadow-elegant hover:shadow-glow transition-all duration-300">
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-accent/5 border-b border-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-sm">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-foreground">Weekly Performance Review</CardTitle>
              <p className="text-xs text-muted-foreground">AI-powered insights and recommendations</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={regenerate} 
            disabled={loading}
            className="border-primary/20 hover:bg-primary/5"
          >
            <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Analyzing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        {summary ? (
          <div className="space-y-6">
            {/* AI Insights */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">
                Performance Insights
              </h3>
              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
                <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                  {summary.summary_text}
                </p>
              </div>
            </div>
            
            {/* Metrics Grid */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">
                Weekly Metrics
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border border-primary/10 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/10 dark:to-emerald-900/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">Workouts</span>
                  </div>
                  <p className="text-xl font-bold text-green-800 dark:text-green-300">
                    {summary.metrics?.workouts_completed ?? 0}
                  </p>
                </div>
                
                <div className="p-4 rounded-lg border border-primary/10 bg-gradient-to-br from-blue-50/50 to-sky-50/50 dark:from-blue-900/10 dark:to-sky-900/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Avg Minutes</span>
                  </div>
                  <p className="text-xl font-bold text-blue-800 dark:text-blue-300">
                    {summary.metrics?.average_workout_minutes ?? 0}
                  </p>
                </div>
                
                <div className="p-4 rounded-lg border border-primary/10 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/10 dark:to-violet-900/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-medium text-purple-700 dark:text-purple-400">Personal Records</span>
                  </div>
                  <p className="text-xl font-bold text-purple-800 dark:text-purple-300">
                    {summary.metrics?.prs_count ?? 0}
                  </p>
                </div>
                
                <div className="p-4 rounded-lg border border-primary/10 bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-orange-900/10 dark:to-amber-900/10">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-medium text-orange-700 dark:text-orange-400">Active Days</span>
                  </div>
                  <p className="text-xl font-bold text-orange-800 dark:text-orange-300">
                    {summary.metrics?.active_days ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">No Performance Data Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {loading ? 'Generating your personalized insights...' : 'Start your weekly review by generating AI-powered insights based on your recent activity.'}
            </p>
            {!loading && (
              <Button onClick={regenerate} variant="outline" className="border-primary/20 hover:bg-primary/5">
                <TrendingUp className="w-4 h-4 mr-2" />
                Generate Insights
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklySummaryCard;
