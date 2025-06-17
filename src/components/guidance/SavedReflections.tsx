
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, FileText, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SavedReflection {
  id: string;
  quote: string;
  author: string;
  reflection: string;
  date: string;
}

interface SavedReflectionsProps {
  onClose: () => void;
}

const SavedReflections = ({ onClose }: SavedReflectionsProps) => {
  const [reflections, setReflections] = useState<SavedReflection[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedReflections = JSON.parse(localStorage.getItem('savedReflections') || '[]');
    setReflections(savedReflections);
  }, []);

  const handleDeleteReflection = (id: string) => {
    const updatedReflections = reflections.filter(r => r.id !== id);
    setReflections(updatedReflections);
    localStorage.setItem('savedReflections', JSON.stringify(updatedReflections));
    
    toast({
      title: "Reflection deleted",
      description: "Your reflection has been removed.",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4 px-2">
      <div className="flex items-center gap-3 mb-4">
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="text-green-700 hover:text-green-800 hover:bg-green-50 text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <h2 className="text-lg font-semibold text-green-800 dark:text-green-400">
          Saved Reflections
        </h2>
      </div>

      {reflections.length === 0 ? (
        <Card className="border-green-200 dark:border-green-800 mx-2">
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
              No reflections yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Start reflecting on quotes to build your personal wisdom collection
            </p>
            <Button
              onClick={onClose}
              className="bg-green-600 hover:bg-green-700 text-white text-sm"
            >
              Start Reflecting
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-4 px-4">
            {reflections.length} {reflections.length === 1 ? 'reflection' : 'reflections'} saved
          </p>
          
          <ScrollArea className="h-[calc(100vh-200px)] px-2">
            <div className="space-y-3">
              {reflections.map((reflection) => (
                <Card key={reflection.id} className="border-green-200 dark:border-green-800 shadow-sm">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Quote Section */}
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                        <blockquote className="text-sm italic text-gray-700 dark:text-gray-300 leading-relaxed text-center">
                          "{reflection.quote}"
                        </blockquote>
                        {reflection.author && (
                          <cite className="text-xs text-gray-500 dark:text-gray-400 block text-center mt-2">
                            — {reflection.author}
                          </cite>
                        )}
                      </div>

                      {/* Reflection Text */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          Your Reflection:
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          {reflection.reflection}
                        </p>
                      </div>

                      {/* Date and Actions */}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {formatDate(reflection.date)}
                        </span>
                        <button
                          onClick={() => handleDeleteReflection(reflection.id)}
                          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-red-500"
                          aria-label="Delete reflection"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default SavedReflections;
