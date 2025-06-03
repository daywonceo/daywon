
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Heart, Infinity } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const GoPremium = () => {
  const plans = [
    {
      name: "Free Plan",
      icon: "💚",
      price: "Free",
      period: "forever",
      color: "green",
      isDefault: true,
      features: [
        "Track up to 5 habits",
        "Join up to 2 social groups",
        "Access daily Bible verses, habit tips, and basic charts",
        "Free forever"
      ]
    },
    {
      name: "Premium",
      icon: "💙",
      price: "$3.99",
      period: "month",
      yearlyPrice: "$29.99/year",
      color: "blue",
      isPopular: true,
      features: [
        "Unlimited habits",
        "Join/create unlimited groups",
        "Connect fitness + wellness APIs (Strava, WHOOP, Apple Screen Time)",
        "Access guided packs: workouts, meditations, recipes, Bible passages",
        "Full habit analytics + streak protection",
        "7-day free trial (no card needed)"
      ]
    },
    {
      name: "Lifetime",
      icon: "💛",
      price: "$74.99",
      period: "one-time",
      color: "yellow",
      isLifetime: true,
      features: [
        "All premium features forever",
        "Add \"Founding Supporter\" badge to profile"
      ]
    }
  ];

  const getCardClasses = (plan: typeof plans[0]) => {
    const baseClasses = "relative transition-all duration-300 hover:shadow-lg";
    
    if (plan.isDefault) {
      return `${baseClasses} border-green-200 dark:border-green-800`;
    }
    if (plan.isPopular) {
      return `${baseClasses} border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800`;
    }
    if (plan.isLifetime) {
      return `${baseClasses} border-yellow-200 dark:border-yellow-800`;
    }
    return baseClasses;
  };

  const getButtonClasses = (plan: typeof plans[0]) => {
    if (plan.isDefault) {
      return "bg-green-600 hover:bg-green-700 text-white";
    }
    if (plan.isPopular) {
      return "bg-blue-600 hover:bg-blue-700 text-white";
    }
    if (plan.isLifetime) {
      return "bg-yellow-600 hover:bg-yellow-700 text-white";
    }
    return "bg-gray-600 hover:bg-gray-700 text-white";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8 pb-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Go Premium
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Unlock your full potential with enhanced features and unlimited access to everything DayOne has to offer.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={getCardClasses(plan)}>
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="text-4xl mb-2">{plan.icon}</div>
                <CardTitle className="text-2xl mb-2 flex items-center justify-center gap-2">
                  {plan.name}
                  {plan.isDefault && <Badge variant="outline">Default</Badge>}
                </CardTitle>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {plan.price}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    /{plan.period}
                  </div>
                  {plan.yearlyPrice && (
                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      or {plan.yearlyPrice}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full ${getButtonClasses(plan)}`}
                  size="lg"
                >
                  {plan.isDefault ? "Current Plan" : 
                   plan.isLifetime ? "Get Lifetime Access" : 
                   "Start Free Trial"}
                </Button>

                {plan.isLifetime && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                      <Crown className="w-4 h-4" />
                      <span>Founding Supporter Badge</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            All plans include access to our supportive community and regular updates
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-300">
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-red-500" />
              Cancel anytime
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Infinity className="w-4 h-4 text-blue-500" />
              No hidden fees
            </span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GoPremium;
