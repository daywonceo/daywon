
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Activity {
  activity: string;
  type: string;
  participants: number;
  price: number;
  link?: string;
  key: string;
  accessibility: number;
}

const BoredTab = () => {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching random activity...');
      
      const { data, error } = await supabase.functions.invoke('get-bored-activity');

      if (error) {
        console.error('Error fetching activity:', error);
        setError('Failed to fetch activity');
        return;
      }

      if (data) {
        setActivity(data);
        console.log('Successfully loaded activity:', data);
      } else {
        setError('No activity data received');
        console.log('No activity data received');
      }
    } catch (err) {
      console.error('Error calling bored activity function:', err);
      setError('Failed to fetch activity');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch initial activity on component mount
  React.useEffect(() => {
    fetchActivity();
  }, []);

  const getPriceDescription = (price: number) => {
    if (price === 0) return "Free";
    if (price <= 0.3) return "Low cost";
    if (price <= 0.6) return "Medium cost";
    return "High cost";
  };

  const getAccessibilityDescription = (accessibility: number) => {
    if (accessibility <= 0.3) return "Very accessible";
    if (accessibility <= 0.6) return "Moderately accessible";
    return "Requires some effort";
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Beat the Boredom</h3>
        <Button
          onClick={fetchActivity}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Get New Activity
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </CardContent>
        </Card>
      ) : activity ? (
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-400 capitalize">
              {activity.type} Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              {activity.activity}
            </p>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                👥 {activity.participants} participant{activity.participants !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1">
                💰 {getPriceDescription(activity.price)}
              </span>
              <span className="flex items-center gap-1">
                ♿ {getAccessibilityDescription(activity.accessibility)}
              </span>
            </div>

            {activity.link && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => window.open(activity.link, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Learn More
              </Button>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default BoredTab;
