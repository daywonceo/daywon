
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Play, ExternalLink } from "lucide-react";

const SermonsTab = () => {
  const sermons = [
    {
      id: 1,
      title: "The Gospel of Grace",
      author: "John Piper",
      duration: "45 min",
      source: "Desiring God",
      url: "https://www.desiringgod.org",
      description: "Understanding the depth of God's grace and how it transforms our daily lives.",
      category: "Grace"
    },
    {
      id: 2,
      title: "Walking by Faith",
      author: "Paul Washer",
      duration: "38 min", 
      source: "HeartCry Missionary",
      url: "https://heartcrymissionary.com",
      description: "What it truly means to live a life of faith in an uncertain world.",
      category: "Faith"
    },
    {
      id: 3,
      title: "The Joy of the Lord",
      author: "John MacArthur",
      duration: "42 min",
      source: "Grace to You",
      url: "https://www.gty.org",
      description: "Finding supernatural joy that transcends our circumstances.",
      category: "Joy"
    }
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center mb-8">
        <Play className="w-12 h-12 mx-auto mb-4 text-green-600" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Sermons & Messages
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Powerful messages from trusted pastors and teachers
        </p>
      </div>

      {sermons.map((sermon) => (
        <Card key={sermon.id} className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="font-semibold text-green-800 dark:text-green-400 mb-1">
                  {sermon.title}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  by {sermon.author} • {sermon.source} • {sermon.duration}
                </p>
                <span className="inline-block px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                  {sermon.category}
                </span>
              </div>
              <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer transition-colors" />
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {sermon.description}
            </p>
            
            <div className="flex gap-2">
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Play className="w-4 h-4 mr-2" />
                Listen Now
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Source
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SermonsTab;
