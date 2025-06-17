
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JournalingPromptProps {
  quote: { q: string; a: string } | null;
  onClose: () => void;
}

const JournalingPrompt = ({ quote, onClose }: JournalingPromptProps) => {
  const [reflection, setReflection] = useState("");
  const { toast } = useToast();

  const handleSave = () => {
    if (reflection.trim()) {
      // Here you could integrate with your backend to save the reflection
      localStorage.setItem(`reflection_${Date.now()}`, JSON.stringify({
        quote: quote?.q,
        author: quote?.a,
        reflection: reflection.trim(),
        date: new Date().toISOString()
      }));
      
      toast({
        title: "Reflection saved",
        description: "Your thoughts have been saved locally.",
      });
      
      setReflection("");
      onClose();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="text-green-700 hover:text-green-800 hover:bg-green-50"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <h2 className="text-xl font-semibold text-green-800 dark:text-green-400">
          Journal Your Reflection
        </h2>
      </div>

      {quote && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <blockquote className="text-sm font-light text-gray-700 dark:text-gray-300 leading-relaxed italic text-center">
              "{quote.q}"
            </blockquote>
            {quote.a && quote.a !== 'zenquotes.io' && (
              <cite className="text-xs text-gray-500 dark:text-gray-400 block text-center mt-2">
                — {quote.a}
              </cite>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="text-lg text-green-800 dark:text-green-400">
            What does this mean to you?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <p>Take a moment to reflect on this quote. Consider:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>How does this resonate with your current situation?</li>
              <li>What emotions or memories does it bring up?</li>
              <li>How might you apply this wisdom to your daily life?</li>
            </ul>
          </div>
          
          <Textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Write your thoughts and reflections here..."
            className="min-h-[200px] border-green-200 dark:border-green-800 focus:border-green-400 resize-none"
            maxLength={1000}
          />
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {reflection.length}/1000 characters
            </span>
            <Button
              onClick={handleSave}
              disabled={!reflection.trim()}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Reflection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JournalingPrompt;
