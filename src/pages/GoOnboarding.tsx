
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Target, Bell, Heart, RotateCcw, Palette, UserPlus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const GoOnboarding = () => {
  const handleStartOnboarding = () => {
    // Clear onboarding completion status to trigger onboarding flow
    localStorage.removeItem('onboardingCompleted');
    localStorage.removeItem('onboardingData');
    
    // Reload the page to trigger onboarding
    window.location.reload();
  };

  const onboardingSteps = [
    {
      icon: <UserPlus className="w-6 h-6 text-blue-500" />,
      title: "Sign Up",
      description: "Create your account with Google or Email/Password"
    },
    {
      icon: <Sparkles className="w-6 h-6 text-yellow-500" />,
      title: "Welcome",
      description: "Get introduced to your habit tracking journey"
    },
    {
      icon: <Heart className="w-6 h-6 text-red-500" />,
      title: "Our Mission & Canvas Growth",
      description: "Learn about Day Won and how your canvas will grow"
    },
    {
      icon: <Target className="w-6 h-6 text-blue-500" />,
      title: "Pick Focus Areas",
      description: "Choose 3 areas of life you want to improve"
    },
    {
      icon: <Bell className="w-6 h-6 text-purple-500" />,
      title: "Notifications",
      description: "Set up habit reminders and default times"
    },
    {
      icon: <Heart className="w-6 h-6 text-pink-500" />,
      title: "Set Intent",
      description: "Define your primary goal and motivation"
    },
    {
      icon: <Sparkles className="w-6 h-6 text-gold-500" />,
      title: "Summary & Launch",
      description: "Review your choices and start your journey"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8 pb-24">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <RotateCcw className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Go Onboarding
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Want to restart your journey or update your preferences? Go through the onboarding process again to customize your experience.
          </p>
        </div>

        <div className="grid gap-8 max-w-3xl mx-auto">
          <Card className="border-2 border-blue-200 dark:border-blue-800">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-blue-800 dark:text-blue-200">
                Onboarding Journey
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                Here's what you'll go through in the onboarding process:
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                {onboardingSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm">
                        {step.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                        Step {index + 1}: {step.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {step.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {index + 1}/7
                    </Badge>
                  </div>
                ))}
              </div>
              
              <div className="text-center pt-6">
                <Button 
                  onClick={handleStartOnboarding}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  size="lg"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Start Onboarding
                </Button>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Note: This will reset your current onboarding data and take you through the setup process again.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GoOnboarding;
