import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, Target, Lightbulb, Zap, Calendar } from 'lucide-react';
import { useHabits } from '@/hooks/useHabits';
import { useHabitActivities } from '@/hooks/useHabitActivities';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, isAfter } from 'date-fns';

interface AIInsight {
  id: string;
  type: 'pattern' | 'suggestion' | 'prediction' | 'achievement';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

interface AIInsightsProps {
  userId?: string;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ userId }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const { habits } = useHabits();
  const { activities } = useHabitActivities();
  const { toast } = useToast();

  const generateInsights = async () => {
    setLoading(true);
    
    try {
      console.log('Fetching AI insights...');
      
      const { data, error } = await supabase.functions.invoke('analyze-habit-patterns');

      if (error) {
        console.error('Error fetching insights:', error);
        throw error;
      }

      if (data?.insights) {
        setInsights(data.insights);
        console.log('Insights loaded successfully:', data.insights.length);
      } else {
        // Fallback to basic insight if no data
        setInsights([{
          id: '1',
          type: 'pattern',
          title: 'Keep Building Your Habits',
          description: 'Continue tracking your habits to receive personalized AI insights based on your patterns and progress.',
          confidence: 80,
          actionable: false,
          priority: 'medium',
          category: 'timing'
        }]);
      }
    } catch (error) {
      console.error('Failed to generate insights:', error);
      toast({
        title: "Error",
        description: "Failed to load AI insights. Please try again.",
        variant: "destructive"
      });
      // Set fallback insight on error
      setInsights([{
        id: '1',
        type: 'pattern',
        title: 'Analysis Temporarily Unavailable',
        description: 'We\'re having trouble analyzing your habits right now. Please try again in a few moments.',
        confidence: 50,
        actionable: false,
        priority: 'low',
        category: 'timing'
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateInsights();
  }, [habits, activities]);

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'pattern': return <Brain className="h-4 w-4" />;
      case 'suggestion': return <Lightbulb className="h-4 w-4" />;
      case 'prediction': return <TrendingUp className="h-4 w-4" />;
      case 'achievement': return <Target className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: AIInsight['priority']) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const categories = ['all', 'timing', 'optimization', 'risk', 'achievement', 'social'];
  
  const filteredInsights = selectedCategory === 'all' 
    ? insights 
    : insights.filter(insight => insight.category === selectedCategory);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              <span className="text-sm text-muted-foreground">Analyzing your habit patterns...</span>
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Insights
            <Badge variant="secondary" className="ml-auto">
              {filteredInsights.length} insights
            </Badge>
          </CardTitle>
          
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize text-xs sm:text-sm px-2 sm:px-3"
              >
                {category}
              </Button>
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {filteredInsights.map(insight => (
            <div
              key={insight.id}
              className="p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg shrink-0">
                  {getInsightIcon(insight.type)}
                </div>
                
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h4 className="font-medium text-sm sm:text-base">{insight.title}</h4>
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <Badge variant={getPriorityColor(insight.priority)} className="text-xs">
                        {insight.priority}
                      </Badge>
                      <Badge variant="outline" className="capitalize text-xs">
                        {insight.type}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {insight.description}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="hidden sm:inline">Confidence:</span>
                      <Progress value={insight.confidence} className="w-12 sm:w-16 h-2" />
                      <span>{insight.confidence}%</span>
                    </div>
                    
                    {insight.actionable && (
                      <Button variant="outline" size="sm" className="text-xs sm:text-sm w-full sm:w-auto">
                        Take Action
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-center pt-4">
            <Button variant="outline" onClick={generateInsights}>
              <Zap className="h-4 w-4 mr-2" />
              Refresh Insights
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};