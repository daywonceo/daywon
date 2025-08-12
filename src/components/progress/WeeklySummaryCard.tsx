import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
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
    <Card className="bg-white dark:bg-gray-800/50 border-t-4 border-t-green-500 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Weekly Insights & Coaching</CardTitle>
        <Button variant="outline" size="sm" onClick={regenerate} disabled={loading}>
          <RefreshCcw className="w-4 h-4 mr-2" />
          {loading ? 'Working…' : 'Regenerate'}
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="text-red-600 dark:text-red-400 text-sm mb-2">{error}</p>
        )}
        {summary ? (
          <div>
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200 whitespace-pre-line">{summary.summary_text}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs text-gray-600 dark:text-gray-300">
              <div><span className="font-semibold">Workouts:</span> {summary.metrics?.workouts_completed ?? 0}</div>
              <div><span className="font-semibold">Avg Min:</span> {summary.metrics?.average_workout_minutes ?? 0}</div>
              <div><span className="font-semibold">PRs:</span> {summary.metrics?.prs_count ?? 0}</div>
              <div><span className="font-semibold">Active Days:</span> {summary.metrics?.active_days ?? 0}</div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {loading ? 'Loading...' : 'No summary yet. Tap Regenerate to create your weekly coaching.'}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklySummaryCard;
