
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface BoredActivity {
  activity: string;
  type: string;
  participants: number;
  price: number;
  link: string;
  key: string;
  accessibility: number;
}

interface ActivityDisplayProps {
  activity: BoredActivity | null;
  isLoading: boolean;
}

const ActivityDisplay = ({ activity, isLoading }: ActivityDisplayProps) => {
  const formatType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
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
            <div className="inline-block px-3 py-1 bg-success/10 text-success rounded-full text-sm font-medium">
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
  );
};

export default ActivityDisplay;
