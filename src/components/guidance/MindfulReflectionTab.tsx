
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import JournalingPrompt from "./JournalingPrompt";

interface Quote {
  q: string;
  a: string;
}

// Fallback quotes when API is unavailable
const fallbackQuotes = [
  { q: "The present moment is the only time over which we have dominion.", a: "Thich Nhat Hanh" },
  { q: "Mindfulness is a way of befriending ourselves and our experience.", a: "Jon Kabat-Zinn" },
  { q: "Wherever you are, be there totally.", a: "Eckhart Tolle" },
  { q: "The best way to take care of the future is to take care of the present moment.", a: "Thich Nhat Hanh" },
  { q: "Mindfulness isn't difficult, we just need to remember to do it.", a: "Sharon Salzberg" },
  { q: "Peace comes from within. Do not seek it without.", a: "Buddha" },
  { q: "The mind is everything. What you think you become.", a: "Buddha" },
  { q: "Be yourself and go with your feelings.", a: "Jon Kabat-Zinn" }
];

const MindfulReflectionTab = () => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const { toast } = useToast();

  const getRandomFallbackQuote = () => {
    const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
    return fallbackQuotes[randomIndex];
  };

  const fetchQuote = async () => {
    setLoading(true);
    try {
      // Try to fetch from ZenQuotes API
      const response = await fetch('https://zenquotes.io/api/random');
      const data = await response.json();
      if (data && data[0]) {
        setQuote(data[0]);
      } else {
        throw new Error('No quote data received');
      }
    } catch (error) {
      console.log('API unavailable, using fallback quote:', error);
      // Use fallback quote instead of showing error
      setQuote(getRandomFallbackQuote());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  if (showJournal) {
    return (
      <JournalingPrompt 
        quote={quote}
        onClose={() => setShowJournal(false)}
      />
    );
  }

  return (
    <div className="space-y-4 px-2">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-green-800 dark:text-green-400 mb-2">
          Mindful Reflection
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm px-4">
          Take a moment to pause, reflect, and find inner peace
        </p>
      </div>

      <Card className="border-green-200 dark:border-green-800 shadow-sm mx-2">
        <CardContent className="p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-5 h-5 animate-spin text-green-600" />
            </div>
          ) : quote ? (
            <div className="text-center space-y-4">
              <blockquote className="text-sm sm:text-base font-light text-gray-800 dark:text-gray-200 leading-relaxed italic px-2">
                "{quote.q}"
              </blockquote>
              {quote.a && quote.a !== 'zenquotes.io' && (
                <cite className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 block">
                  — {quote.a}
                </cite>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Unable to load reflection at this time
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 justify-center px-4">
        <Button
          onClick={() => setShowJournal(true)}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 text-sm"
          disabled={!quote}
        >
          <BookOpen className="w-4 h-4" />
          Reflect
        </Button>
        <Button
          onClick={fetchQuote}
          variant="outline"
          className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900 flex items-center gap-2 text-sm"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Get Another
        </Button>
      </div>
    </div>
  );
};

export default MindfulReflectionTab;
