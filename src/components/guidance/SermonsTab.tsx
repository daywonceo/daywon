
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Play, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SermonsTab = () => {
  const { toast } = useToast();

  const sermons = [
    {
      id: 1,
      title: "The Gospel of Grace",
      author: "John Piper",
      duration: "45 min",
      source: "Desiring God",
      url: "https://www.desiringgod.org/messages/the-gospel-of-grace",
      audioUrl: "https://www.desiringgod.org/messages/the-gospel-of-grace",
      description: "Understanding the depth of God's grace and how it transforms our daily lives.",
      category: "Grace"
    },
    {
      id: 2,
      title: "Walking by Faith",
      author: "Paul Washer",
      duration: "38 min", 
      source: "HeartCry Missionary",
      url: "https://heartcrymissionary.com/sermons/walking-by-faith",
      audioUrl: "https://heartcrymissionary.com/sermons/walking-by-faith",
      description: "What it truly means to live a life of faith in an uncertain world.",
      category: "Faith"
    },
    {
      id: 3,
      title: "The Joy of the Lord",
      author: "John MacArthur",
      duration: "42 min",
      source: "Grace to You",
      url: "https://www.gty.org/library/sermons-library/the-joy-of-the-lord",
      audioUrl: "https://www.gty.org/library/sermons-library/the-joy-of-the-lord",
      description: "Finding supernatural joy that transcends our circumstances.",
      category: "Joy"
    }
  ];

  const handleListenNow = (sermon: any) => {
    // Open sermon audio/video in new tab or in-app player
    if (sermon.audioUrl) {
      window.open(sermon.audioUrl, '_blank', 'noopener,noreferrer');
      toast({
        title: "Opening sermon",
        description: `Now playing: ${sermon.title}`,
      });
    } else {
      toast({
        title: "Audio not available",
        description: "This sermon audio is not currently available.",
        variant: "destructive",
      });
    }
  };

  const handleViewSource = (sermon: any) => {
    // Open original sermon page
    if (sermon.url) {
      window.open(sermon.url, '_blank', 'noopener,noreferrer');
    } else {
      toast({
        title: "Source not available",
        description: "The original source for this sermon is not available.",
        variant: "destructive",
      });
    }
  };

  const handleSaveSermon = (sermon: any) => {
    // TODO: Implement save sermon functionality with Supabase
    toast({
      title: "Sermon saved",
      description: "This sermon has been added to your saved collection.",
    });
  };

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6">
      <div className="text-center mb-6 sm:mb-8">
        <Play className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-green-600" />
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Sermons & Messages
        </h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Powerful messages from trusted pastors and teachers
        </p>
      </div>

      {sermons.map((sermon) => (
        <Card key={sermon.id} className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4 gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-green-800 dark:text-green-400 mb-1 text-sm sm:text-base">
                  {sermon.title}
                </h4>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
                  by {sermon.author} • {sermon.source} • {sermon.duration}
                </p>
                <span className="inline-block px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                  {sermon.category}
                </span>
              </div>
              <Heart 
                className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer transition-colors flex-shrink-0" 
                onClick={() => handleSaveSermon(sermon)}
              />
            </div>
            
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {sermon.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                onClick={() => handleListenNow(sermon)}
              >
                <Play className="w-4 h-4 mr-2" />
                Listen Now
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={() => handleViewSource(sermon)}
              >
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
