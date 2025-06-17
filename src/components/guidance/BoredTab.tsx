import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import ActivityTypeSelector from "./ActivityTypeSelector";
import ActivityDisplay from "./ActivityDisplay";
import ActivityActions from "./ActivityActions";

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

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Get personalized activity suggestions to beat boredom
        </p>
        
        <ActivityTypeSelector 
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />
      </div>

      <ActivityDisplay 
        activity={activity}
        isLoading={isLoading}
      />

      <ActivityActions
        activity={activity}
        isLoading={isLoading}
        onTryThis={handleTryThis}
        onSuggestAnother={handleSuggestAnother}
      />

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
