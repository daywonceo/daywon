
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Music, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const SpotifySuccess = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Check if we have Spotify tokens from the OAuth flow
    if (session?.provider_token && session?.provider_refresh_token) {
      // Tokens are already stored by AuthContext
      setIsProcessing(false);
      toast({
        title: "Spotify Connected! 🎵",
        description: "You can now access personalized playlists for your habits",
      });
    } else {
      // If no tokens, redirect back to social page
      setTimeout(() => {
        navigate('/social');
      }, 3000);
    }
  }, [session, navigate]);

  const handleContinue = () => {
    navigate('/social');
  };

  if (isProcessing && (!session?.provider_token)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Processing Spotify connection...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <CheckCircle className="w-16 h-16 text-green-500" />
              <Music className="w-8 h-8 text-[#1DB954] absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Spotify Connected Successfully!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Your Spotify account is now connected! You can now:
          </p>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2 text-left">
            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              Get personalized playlists for your habits
            </div>
            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              Add victory songs to challenge playlists
            </div>
            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              Stream music directly from the app
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              Continue to Social
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="w-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpotifySuccess;
