
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Heart } from 'lucide-react';

const DailyEncouragementCard: React.FC = () => {
  const dailyQuote = useMemo(() => {
    const quotes = [
      {
        text: "Small steps make big change.",
        author: "Habit Canvas"
      },
      {
        text: "Progress, not perfection.",
        author: "Habit Canvas"
      },
      {
        text: "Every habit is a vote for the person you want to become.",
        author: "Habit Canvas"
      },
      {
        text: "Consistency is the mother of mastery.",
        author: "Habit Canvas"
      },
      {
        text: "You don't have to be great to get started, but you have to get started to be great.",
        author: "Habit Canvas"
      },
      {
        text: "The best time to plant a tree was 20 years ago. The second best time is now.",
        author: "Chinese Proverb"
      },
      {
        text: "Be faithful in small things because it is in them that your strength lies.",
        author: "Mother Teresa"
      },
      {
        text: "Success is the sum of small efforts repeated day in and day out.",
        author: "Robert Collier"
      },
      {
        text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
        author: "Aristotle"
      },
      {
        text: "For I know the plans I have for you, plans to prosper you and not to harm you.",
        author: "Jeremiah 29:11"
      },
      {
        text: "I can do all things through Christ who strengthens me.",
        author: "Philippians 4:13"
      },
      {
        text: "Therefore encourage one another and build each other up.",
        author: "1 Thessalonians 5:11"
      }
    ];
    
    // Use the current date to select a quote (same quote per day)
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const quoteIndex = dayOfYear % quotes.length;
    
    return quotes[quoteIndex];
  }, []);

  return (
    <Card className="bg-white dark:bg-gray-800/50 border-t-4 border-t-purple-500 shadow-md">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="h-5 w-5 text-purple-500" />
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Daily Encouragement
          </h3>
        </div>
        
        <div className="space-y-3">
          <blockquote className="text-sm sm:text-base italic text-gray-700 dark:text-gray-200 leading-relaxed">
            "{dailyQuote.text}"
          </blockquote>
          
          <cite className="text-xs text-gray-500 dark:text-gray-400 not-italic">
            – {dailyQuote.author}
          </cite>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyEncouragementCard;
