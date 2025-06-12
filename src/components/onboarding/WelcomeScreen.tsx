
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface WelcomeScreenProps {
  onNext: () => void;
  onSkip: () => void;
}

const WelcomeScreen = ({ onNext, onSkip }: WelcomeScreenProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isConnectingSpotify, setIsConnectingSpotify] = useState(false);
  const { signInWithSpotify } = useAuth();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleConnectSpotify = async () => {
    setIsConnectingSpotify(true);
    const { error } = await signInWithSpotify();
    if (error) {
      console.error("Spotify connection error:", error);
      toast.error("Failed to connect Spotify: " + error.message);
    } else {
      toast.success("Spotify connected successfully!");
    }
    setIsConnectingSpotify(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className={cn(
        "border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transition-all duration-700",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      )}>
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Sparkles className="w-16 h-16 text-yellow-500 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-ping" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Welcome to Habit Tracker
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-2 font-medium">
            Become who you're becoming
          </p>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
            Welcome to your journey of growth and transformation. Let's build habits that align with your values and help you flourish.
          </p>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Connect Your Apps
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Connect your music streaming service to enhance your habit tracking experience
            </p>
            
            <Button 
              onClick={handleConnectSpotify}
              disabled={isConnectingSpotify}
              variant="outline"
              className="w-full py-3 rounded-full border-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 bg-[#1DB954] hover:bg-[#1ed760] text-white border-[#1DB954] hover:border-[#1ed760]"
              size="lg"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              {isConnectingSpotify ? "Connecting..." : "Connect Spotify"}
            </Button>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              You can always connect this later in settings
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={onNext}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              Continue
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={onSkip}
              className="w-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Skip for now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeScreen;
