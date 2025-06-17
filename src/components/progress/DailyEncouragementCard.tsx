
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

  const dailyQuote = useMemo(async () => {
    try {
      // Check if we have a cached quote for today
      const today = new Date().toDateString();
      const cachedData = localStorage.getItem('dailyQuote');
      
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        if (parsed.date === today && parsed.quote) {
          return parsed.quote;
        }
      }

      // Fetch new quote from API
      const response = await fetch('https://type.fit/api/quotes');
      const quotes = await response.json();
      
      if (quotes && quotes.length > 0) {
        // Use date as seed for consistent daily quote
        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        const selectedQuote = quotes[dayOfYear % quotes.length];
        
        const formattedQuote = {
          text: selectedQuote.text || selectedQuote.quote || "Every day is a new opportunity to grow.",
          author: selectedQuote.author ? selectedQuote.author.replace(', type.fit', '') : "Unknown"
        };

        // Cache the quote for today
        localStorage.setItem('dailyQuote', JSON.stringify({
          date: today,
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
  }, []);

  useEffect(() => {
    dailyQuote.then(q => {
      setQuote(q);
      setIsLoading(false);
      
      // Check if this quote is already saved
      const savedQuotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
      const isQuoteSaved = savedQuotes.some((saved: SavedQuote) => 
        saved.text === q.text && saved.author === q.author
      );
      setIsSaved(isQuoteSaved);
    });
  }, [dailyQuote]);

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
      <Card className="bg-white dark:bg-gray-800/50 border-t-4 border-t-purple-500 shadow-md">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="h-5 w-5 text-purple-500" />
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
      className="bg-white dark:bg-gray-800/50 border-t-4 border-t-purple-500 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleCardClick}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-purple-500" />
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Daily Encouragement
            </h3>
          </div>
          
          <button
            onClick={handleSaveQuote}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={isSaved ? "Remove from saved quotes" : "Save quote"}
          >
            <Heart 
              className={`h-6 w-6 transition-colors ${
                isSaved 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-gray-400 hover:text-red-500'
              }`}
            />
          </button>
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
