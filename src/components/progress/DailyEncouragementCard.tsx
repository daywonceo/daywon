import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Quote {
  text: string;
  author: string;
}

interface SavedQuote extends Quote {
  savedAt: string;
  id: string;
}

// Backup quotes to use if API fails
const fallbackQuotes: Quote[] = [
  {
    text: "The best way to predict your future is to create it.",
    author: "Abraham Lincoln"
  },
  {
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius"
  },
  {
    text: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    text: "Your time is limited, so don't waste it living someone else's life.",
    author: "Steve Jobs"
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    text: "If you want to live a happy life, tie it to a goal, not to people or things.",
    author: "Albert Einstein"
  },
  {
    text: "You miss 100% of the shots you don't take.",
    author: "Wayne Gretzky"
  },
  {
    text: "You are never too old to set another goal or to dream a new dream.",
    author: "C.S. Lewis"
  },
  {
    text: "Every day is a new opportunity to grow.",
    author: "Anonymous"
  }
];

const DailyEncouragementCard: React.FC = () => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Function to get the current "day" based on a fixed cutoff time (UTC)
  const getCurrentDay = () => {
    // Get current date in UTC 
    const now = new Date();
    
    // Use UTC date as our reference point to avoid timezone issues
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const day = now.getUTCDate();
    
    // If it's before 8 AM UTC (roughly 3 AM EST), use the previous day
    if (now.getUTCHours() < 8) {
      // Create new date with previous day
      const yesterday = new Date(Date.UTC(year, month, day - 1));
      return yesterday.toISOString().split('T')[0]; // YYYY-MM-DD format
    }
    
    // Use today's date
    return new Date(Date.UTC(year, month, day)).toISOString().split('T')[0];
  };

  // Get a quote based on the current day or randomly if forced
  const getQuoteForDay = (day: string, quotesSource: Quote[], forceRandom = false, currentQuote?: Quote): Quote => {
    if (forceRandom) {
      // Select a truly random quote when forced, ensuring it's different from current
      let attempts = 0;
      let randomIndex;
      let selectedQuote;
      
      do {
        randomIndex = Math.floor(Math.random() * quotesSource.length);
        selectedQuote = quotesSource[randomIndex];
        attempts++;
        // Prevent infinite loop by limiting attempts
      } while (currentQuote && 
               selectedQuote.text === currentQuote.text && 
               attempts < 10);
               
      return selectedQuote;
    }
    
    // Use a hash of the day string to select a quote
    const dayHash = day.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    return quotesSource[dayHash % quotesSource.length];
  };

  const fetchDailyQuote = async (forceRefresh = false): Promise<Quote> => {
    try {
      // Check if we have a cached quote for today
      const currentDay = getCurrentDay();
      const cachedData = localStorage.getItem('dailyQuote');
      
      if (!forceRefresh && cachedData) {
        const parsed = JSON.parse(cachedData);
        if (parsed.date === currentDay && parsed.quote) {
          return parsed.quote;
        }
      }
      
      // Get a random quote if forcing refresh, otherwise get the day's quote
      const selectedQuote = getQuoteForDay(currentDay, fallbackQuotes, forceRefresh, forceRefresh ? quote || undefined : undefined);
      
      // Only cache if it's the daily quote (not a forced refresh)
      if (!forceRefresh) {
        localStorage.setItem('dailyQuote', JSON.stringify({
          date: currentDay,
          quote: selectedQuote
        }));
      }
      
      return selectedQuote;
    } catch (error) {
      console.error('Error fetching quote:', error);
      
      // Return a simple default quote if everything fails
      return {
        text: "Every day is a new opportunity to grow.",
        author: "Anonymous"
      };
    }
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

  // Check for day change whenever the component is focused
  useEffect(() => {
    const checkForNewDay = async () => {
      const newCurrentDay = getCurrentDay();
      const cachedData = localStorage.getItem('dailyQuote');
      
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        if (parsed.date !== newCurrentDay) {
          const newQuote = await fetchDailyQuote();
          setQuote(newQuote);
          
          const savedQuotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
          const isQuoteSaved = savedQuotes.some((saved: SavedQuote) => 
            saved.text === newQuote.text && saved.author === newQuote.author
          );
          setIsSaved(isQuoteSaved);
        }
      }
    };

    // Add visibility change listener to check for day change when tab becomes visible
    document.addEventListener('visibilitychange', checkForNewDay);
    
    // Also check once when this effect runs
    checkForNewDay();
    
    return () => {
      document.removeEventListener('visibilitychange', checkForNewDay);
    };
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
  
  const handleRefreshQuote = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    
    if (isRefreshing) return; // Prevent multiple clicks
    
    setIsRefreshing(true);
    
    try {
      // Force a new quote selection by passing true
      const newQuote = await fetchDailyQuote(true);
      setQuote(newQuote);
      
      // Check if this quote is already saved
      const savedQuotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
      const isQuoteSaved = savedQuotes.some((saved: SavedQuote) => 
        saved.text === newQuote.text && saved.author === newQuote.author
      );
      setIsSaved(isQuoteSaved);
      
      toast({
        title: "Quote refreshed",
        description: "You've got a new quote to inspire you!",
      });
    } catch (error) {
      toast({
        title: "Failed to refresh",
        description: "Using a backup quote instead",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg gradient-primary shadow-sm">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Daily Inspiration
              </h3>
              <p className="text-xs text-muted-foreground">
                Loading wisdom...
              </p>
            </div>
          </div>
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="glass-card group cursor-pointer interactive-glow"
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg gradient-primary transition-transform group-hover:scale-110 duration-300 shadow-sm">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Daily Inspiration
              </h3>
              <p className="text-xs text-muted-foreground">
                Words to motivate
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveQuote}
              className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors"
              aria-label={isSaved ? "Remove from saved quotes" : "Save quote"}
            >
              <Heart 
                className={`h-4 w-4 transition-all duration-300 ${
                  isSaved 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-gray-400 hover:text-red-500'
                }`}
              />
            </button>
            <button
              onClick={handleRefreshQuote}
              className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors"
              aria-label="Refresh quote"
              disabled={isRefreshing}
            >
              <RefreshCw 
                className={`h-4 w-4 text-gray-400 hover:text-teal-500 transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        </div>
        
        {quote && (
          <div className="space-y-4">
            <blockquote className="text-sm leading-relaxed text-foreground italic border-l-3 border-primary pl-4">
              {quote.text}
            </blockquote>
            
            <cite className="text-xs text-muted-foreground not-italic font-medium">
              — {quote.author}
            </cite>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyEncouragementCard;