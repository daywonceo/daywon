import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface BoredTabProps {
  searchQuery: string;
}

interface BoredActivity {
  activity: string;
  type: string;
  participants: number;
  price: number;
  link: string;
  key: string;
  accessibility: number;
}

const activityTypes = [
  { value: "", label: "Any Type" },
  { value: "education", label: "Education" },
  { value: "recreational", label: "Recreational" },
  { value: "social", label: "Social" },
  { value: "diy", label: "DIY" },
  { value: "charity", label: "Charity" },
  { value: "cooking", label: "Cooking" },
  { value: "relaxation", label: "Relaxation" },
  { value: "music", label: "Music" },
  { value: "busywork", label: "Busywork" }
];

const BoredTab = ({ searchQuery }: BoredTabProps) => {
  const [activity, setActivity] = useState<BoredActivity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("");

  const fetchActivity = async () => {
    setIsLoading(true);
    try {
      const url = selectedType 
        ? `https://www.boredapi.com/api/activity?type=${selectedType}`
        : 'https://www.boredapi.com/api/activity';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.activity) {
        setActivity(data);
      } else {
        toast({
          title: "No activities found",
          description: "Try a different category or try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
      toast({
        title: "Failed to fetch activity",
        description: "Please check your internet connection and try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  const handleTryThis = () => {
    if (activity) {
      // Log activity to localStorage for now (could be enhanced to use actual habit tracking)
      const recentActivities = JSON.parse(localStorage.getItem('recent-bored-activities') || '[]');
      const newActivity = {
        ...activity,
        completedAt: new Date().toISOString()
      };
      
      recentActivities.unshift(newActivity);
      // Keep only last 10 activities
      localStorage.setItem('recent-bored-activities', JSON.stringify(recentActivities.slice(0, 10)));
      
      toast({
        title: "Activity logged!",
        description: "Added to your recent activities"
      });
    }
  };

  const handleSuggestAnother = () => {
    fetchActivity();
  };

  const formatType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Get personalized activity suggestions to beat boredom
        </p>
        
        <div className="mb-4">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-48 mx-auto">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {activityTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Activity Card */}
      <Card className="bg-white dark:bg-gray-800 shadow-lg border-2 mb-6">
        <CardContent className="p-8 text-center">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3 mx-auto"></div>
            </div>
          ) : activity ? (
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {activity.activity}
              </h2>
              <div className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-sm font-medium">
                {formatType(activity.type)}
              </div>
              
              {activity.participants > 1 && (
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Best with {activity.participants} people
                </p>
              )}
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400">
              No activity loaded
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button 
          onClick={handleTryThis}
          disabled={!activity || isLoading}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          Try This
        </Button>
        
        <Button 
          onClick={handleSuggestAnother}
          disabled={isLoading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Suggest Another
        </Button>
      </div>

      {/* No Results Message for Search */}
      {searchQuery && (
        <Card className="bg-white dark:bg-gray-800 shadow-sm mt-6">
          <CardContent className="p-6">
            <p className="text-center text-gray-600 dark:text-gray-300">
              Search is not available with live suggestions. Use the type filter above to narrow down activities.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BoredTab;
