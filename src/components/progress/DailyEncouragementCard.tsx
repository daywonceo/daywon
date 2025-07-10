import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Quote {
  text: string;
  author: string;
}

interface SavedQuote extends Quote {
  savedAt: string;
  id: string;
}

const DailyEncouragementCard: React.FC = () => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const navigate = useNavigate();

  // Function to get the current "day" based on 3 AM EST cutoff
  const getCurrentDay = () => {
    const now = new Date();
    
    // Convert to EST (UTC-5) or EDT (UTC-4) - using a simple approach
    // This accounts for daylight saving time roughly
    const estOffset = -5; // EST is UTC-5
    const estTime = new Date(now.getTime() + (estOffset * 60 * 60 * 1000));
    
    // If it's before 3 AM EST, use the previous day
    if (estTime.getUTCHours() < 3) {
      estTime.setUTCDate(estTime.getUTCDate() - 1);
    }
    
    return estTime.toDateString();
  };

  const fetchDailyQuote = async (): Promise<Quote> => {
    try {
      // Check if we have a cached quote for today (based on 3 AM EST cutoff)
      const currentDay = getCurrentDay();
      const cachedData = localStorage.getItem('dailyQuote');
      
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        if (parsed.date === currentDay && parsed.quote) {
          console.log('Using cached quote for:', currentDay);
          return parsed.quote;
        }
      }

      console.log('Fetching new quote for:', currentDay);
      
      // Fetch new quote from API
      const response = await fetch('https://type.fit/api/quotes');
      const quotes = await response.json();
      
      if (quotes && quotes.length > 0) {
        // Filter quotes to prioritize those with known authors
        const quotesWithAuthors = quotes.filter(q => 
          q.author && q.author !== "null" && !q.author.includes("Unknown")
        );
        
        // Use quotes with authors if available, otherwise use all quotes
        const quotesSource = quotesWithAuthors.length > 0 ? quotesWithAuthors : quotes;
        
        // Use current day as seed for consistent daily quote
        const daysSinceEpoch = Math.floor(new Date(currentDay).getTime() / (1000 * 60 * 60 * 24));
        const selectedQuote = quotesSource[daysSinceEpoch % quotesSource.length];
        
        const formattedQuote = {
          text: selectedQuote.text || selectedQuote.quote || "Every day is a new opportunity to grow.",
          author: selectedQuote.author ? selectedQuote.author.replace(', type.fit', '') : "Unknown"
        };

        // Cache the quote for today
        localStorage.setItem('dailyQuote', JSON.stringify({
          date: currentDay,
          quote: formattedQuote
        }));

        return formattedQuote;
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
    }

    // Fallback quote
    return {
      text: "Every day is a new opportunity to grow.",
      author: "Unknown"
    };
  };

  useEffect(() => {
    const loadQuote = async () => {
      setIsLoading(true);
      const dailyQuote = await fetchDailyQuote();
      setQuote(dailyQuote);
      setIsLoading(false);
      
      // Check if this quote is already saved
      const savedQuotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
      const isQuoteSaved = savedQuotes.some((saved: SavedQuote) => 
        saved.text === dailyQuote.text && saved.author === dailyQuote.author
      );
      setIsSaved(isQuoteSaved);
    };

    loadQuote();
  }, []);

  // Set up interval to check for day change at 3 AM EST
  useEffect(() => {
    const checkForNewDay = async () => {
      const currentDay = getCurrentDay();
      const cachedData = localStorage.getItem('dailyQuote');
      
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        if (parsed.date !== currentDay) {
          console.log('New day detected, fetching new quote');
          // It's a new day, fetch new quote
          const newQuote = await fetchDailyQuote();
          setQuote(newQuote);
          
          // Check if this quote is already saved
          const savedQuotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
          const isQuoteSaved = savedQuotes.some((saved: SavedQuote) => 
            saved.text === newQuote.text && saved.author === newQuote.author
          );
          setIsSaved(isQuoteSaved);
        }
      }
    };

    // Check every minute for day change
    const interval = setInterval(checkForNewDay, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSaveQuote = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    
    if (!quote) return;

    const savedQuotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
    
    if (isSaved) {
      // Remove from saved quotes
      const updatedQuotes = savedQuotes.filter((saved: SavedQuote) => 
        !(saved.text === quote.text && saved.author === quote.author)
      );
      localStorage.setItem('savedQuotes', JSON.stringify(updatedQuotes));
      setIsSaved(false);
    } else {
      // Add to saved quotes
      const newSavedQuote: SavedQuote = {
        ...quote,
        savedAt: new Date().toISOString(),
        id: Date.now().toString()
      };
      savedQuotes.unshift(newSavedQuote);
      localStorage.setItem('savedQuotes', JSON.stringify(savedQuotes));
      setIsSaved(true);
    }
  };

  const handleCardClick = () => {
    navigate('/saved-quotes');
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800/50 border-t-4 border-t-teal-500 shadow-md">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="h-5 w-5 text-teal-500" />
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Daily Encouragement
            </h3>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="bg-white dark:bg-gray-800/50 border-t-4 border-t-teal-500 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleCardClick}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={handleSaveQuote}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={isSaved ? "Remove from saved quotes" : "Save quote"}
          >
            <Heart 
              className={`h-5 w-5 transition-colors ${
                isSaved 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-teal-500 hover:text-red-500'
              }`}
            />
          </button>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Daily Encouragement
          </h3>
        </div>
        
        {quote && (
          <div className="space-y-3">
            <blockquote className="text-sm sm:text-base italic text-gray-700 dark:text-gray-200 leading-relaxed">
              "{quote.text}"
            </blockquote>
            
            <cite className="text-xs text-gray-500 dark:text-gray-400 not-italic">
              – {quote.author}
            </cite>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyEncouragementCard;
