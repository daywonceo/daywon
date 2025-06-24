
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, BookOpen } from "lucide-react";

const DevotionsContentTab = () => {
  const devotions = [
    {
      id: 1,
      title: "Walking in Grace",
      author: "Daily Devotional",
      excerpt: "Grace isn't just God's gift of salvation; it's His daily empowerment for living...",
      verse: "Ephesians 2:8-9",
      category: "Grace"
    },
    {
      id: 2,
      title: "Finding Peace in the Storm",
      author: "Max Lucado",
      excerpt: "When life's storms rage around us, we can find our anchor in Christ's unchanging love...",
      verse: "Psalm 46:10",
      category: "Peace"
    },
    {
      id: 3,
      title: "The Power of Prayer",
      author: "Charles Spurgeon",
      excerpt: "Prayer is not overcoming God's reluctance, but laying hold of His willingness...",
      verse: "1 Thessalonians 5:17",
      category: "Prayer"
    }
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center mb-8">
        <BookOpen className="w-12 h-12 mx-auto mb-4 text-green-600" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Daily Devotions
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Thoughtful reflections to deepen your faith journey
        </p>
      </div>

      {devotions.map((devotion) => (
        <Card key={devotion.id} className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="font-semibold text-green-800 dark:text-green-400 mb-1">
                  {devotion.title}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  by {devotion.author}
                </p>
                <span className="inline-block px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                  {devotion.category}
                </span>
              </div>
              <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer transition-colors" />
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {devotion.excerpt}
            </p>
            
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">
              Key Verse: {devotion.verse}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DevotionsContentTab;
