
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Clock, Users, MapPin } from "lucide-react";

interface BoredTabProps {
  searchQuery: string;
}

const boredActivities = [
  {
    title: "Take a 10-minute walk",
    description: "Get some fresh air and light exercise",
    duration: "10 mins",
    category: "Movement",
    type: "Solo",
    location: "Outdoor"
  },
  {
    title: "Call a friend or family member",
    description: "Reconnect with someone you care about",
    duration: "15-30 mins",
    category: "Social",
    type: "Social",
    location: "Indoor"
  },
  {
    title: "Try a 5-minute meditation",
    description: "Center yourself with breathing exercises",
    duration: "5 mins",
    category: "Mindfulness",
    type: "Solo",
    location: "Indoor"
  },
  {
    title: "Organize one small area",
    description: "Declutter your desk, drawer, or bookshelf",
    duration: "15 mins",
    category: "Productive",
    type: "Solo",
    location: "Indoor"
  },
  {
    title: "Learn something new online",
    description: "Watch an educational video or read an article",
    duration: "20 mins",
    category: "Learning",
    type: "Solo",
    location: "Indoor"
  },
  {
    title: "Do jumping jacks or push-ups",
    description: "Get your blood flowing with quick exercise",
    duration: "5 mins",
    category: "Movement",
    type: "Solo",
    location: "Indoor"
  },
  {
    title: "Write in a journal",
    description: "Reflect on your day or set intentions",
    duration: "10 mins",
    category: "Mindfulness",
    type: "Solo",
    location: "Indoor"
  },
  {
    title: "Play with a pet",
    description: "Spend quality time with your furry friend",
    duration: "15 mins",
    category: "Fun",
    type: "Solo",
    location: "Indoor"
  }
];

const BoredTab = ({ searchQuery }: BoredTabProps) => {
  const filteredActivities = boredActivities.filter(activity =>
    searchQuery === "" || 
    activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          Quick activities to beat boredom and add purpose to your day
        </p>
      </div>

      {/* Debug Info */}
      {searchQuery && (
        <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
          <p>Searching for: "{searchQuery}"</p>
          <p>Found {filteredActivities.length} activities</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {filteredActivities.map((activity, index) => (
          <Card key={index} className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-green-800 dark:text-green-400 flex items-center text-lg">
                    <Zap className="w-5 h-5 mr-2" />
                    {activity.title}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {activity.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {activity.duration}
                </span>
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {activity.type}
                </span>
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {activity.location}
                </span>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary">{activity.category}</Badge>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Let's Do This!
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results Message */}
      {searchQuery && filteredActivities.length === 0 && (
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardContent className="p-6">
            <p className="text-center text-gray-600 dark:text-gray-300">
              No activities found for "{searchQuery}". Try a different search term.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BoredTab;
