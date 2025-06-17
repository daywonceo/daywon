
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

const MindfulReflectionTab = () => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const { toast } = useToast();

  const fetchQuote = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://zenquotes.io/api/random');
      const data = await response.json();
      if (data && data[0]) {
        setQuote(data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch quote:', error);
      toast({
        title: "Unable to fetch quote",
        description: "Please try again later.",
        variant: "destructive",
      });
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
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-green-800 dark:text-green-400 mb-2">
          Mindful Reflection
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Take a moment to pause, reflect, and find inner peace
        </p>
      </div>

      <Card className="border-green-200 dark:border-green-800 shadow-sm">
        <CardContent className="p-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-green-600" />
            </div>
          ) : quote ? (
            <div className="text-center space-y-6">
              <blockquote className="text-lg font-light text-gray-800 dark:text-gray-200 leading-relaxed italic">
                "{quote.q}"
              </blockquote>
              {quote.a && quote.a !== 'zenquotes.io' && (
                <cite className="text-sm text-gray-500 dark:text-gray-400 block">
                  — {quote.a}
                </cite>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Unable to load reflection at this time
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={() => setShowJournal(true)}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          disabled={!quote}
        >
          <BookOpen className="w-4 h-4" />
          Reflect
        </Button>
        <Button
          onClick={fetchQuote}
          variant="outline"
          className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900 flex items-center gap-2"
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
