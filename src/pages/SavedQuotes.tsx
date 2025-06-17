
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SavedQuote {
  text: string;
  author: string;
  savedAt: string;
  id: string;
}

const SavedQuotes = () => {
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const quotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
    setSavedQuotes(quotes);
  }, []);

  const handleRemoveQuote = (id: string) => {
    const updatedQuotes = savedQuotes.filter(quote => quote.id !== id);
    setSavedQuotes(updatedQuotes);
    localStorage.setItem('savedQuotes', JSON.stringify(updatedQuotes));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-white to-blue-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
              Saved Quotes
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {savedQuotes.length} {savedQuotes.length === 1 ? 'quote' : 'quotes'} saved
            </p>
          </div>
        </div>

        {/* Quotes List */}
        {savedQuotes.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardContent className="p-8 text-center">
              <Heart className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
                No saved quotes yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Tap the heart icon on any quote to save it here
              </p>
              <Button
                onClick={() => navigate('/')}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                Browse Quotes
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {savedQuotes.map((quote) => (
              <Card key={quote.id} className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <blockquote className="text-sm sm:text-base italic text-gray-700 dark:text-gray-200 leading-relaxed">
                        "{quote.text}"
                      </blockquote>
                      
                      <div className="flex items-center justify-between">
                        <cite className="text-xs text-gray-500 dark:text-gray-400 not-italic">
                          – {quote.author}
                        </cite>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          Saved {formatDate(quote.savedAt)}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveQuote(quote.id)}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-red-500"
                      aria-label="Remove quote"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedQuotes;
