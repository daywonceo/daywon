import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles, Zap, BookmarkCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const GoPremium = () => {
  const navigate = useNavigate();
  
  const plans = [
    {
      name: "Free",
      price: "Free",
      period: "forever",
      isDefault: true,
      features: [
        "Track up to 5 habits",
        "Join up to 2 social groups",
        "Daily Bible verses & devotions",
        "Basic habit statistics",
        "Community challenges",
        "Standard friend requests"
      ]
    },
    {
      name: "Premium",
      price: "$3.99",
      period: "month",
      yearlyPrice: "$29.99/year",
      isPopular: true,
      features: [
        "Unlimited habits with advanced tracking",
        "Join/create unlimited groups & challenges",
        "AI-powered workout & meal planning",
        "Connect fitness APIs (Strava, WHOOP, Apple Health)",
        "Email friend invitations & contact sync",
        "Advanced privacy controls",
        "Full habit analytics & streak protection",
        "Saved verses, devotions, reflections & recipes",
        "Custom workout builder & progress tracking",
        "Nutrition recipes & meal plans",
        "Priority support",
        "7-day free trial (no card needed)"
      ]
    },
    {
      name: "Lifetime",
      price: "$74.99",
      period: "one-time",
      isLifetime: true,
      features: [
        "All premium features forever",
        "Founding Supporter badge on profile",
        "Early access to new features",
        "Support Day Won's mission"
      ]
    }
  ];

  const getCardClasses = (plan: typeof plans[0]) => {
    const baseClasses = "glass-card relative overflow-hidden transition-all duration-300";
    
    if (plan.isDefault) {
      return `${baseClasses} border-primary/30`;
    }
    if (plan.isPopular) {
      return `${baseClasses} border-primary shadow-glow scale-105`;
    }
    if (plan.isLifetime) {
      return `${baseClasses} border-accent/50`;
    }
    return baseClasses;
  };

  const getButtonVariant = (plan: typeof plans[0]) => {
    if (plan.isDefault) return "outline";
    if (plan.isPopular) return "default";
    if (plan.isLifetime) return "secondary";
    return "outline";
  };

  const getPlanIcon = (plan: typeof plans[0]) => {
    if (plan.isDefault) return <BookmarkCheck className="w-8 h-8 text-primary" />;
    if (plan.isPopular) return <Sparkles className="w-8 h-8 text-primary" />;
    if (plan.isLifetime) return <Crown className="w-8 h-8 text-accent" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light/20 via-background to-accent/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      <Header />
      
      <main className="flex-grow px-responsive pb-safe-mobile pt-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Unlock Full Potential</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient-primary mb-4">
            Choose Your Plan
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Build better habits with the tools and support you need to succeed
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {plans.map((plan, index) => (
            <Card key={index} className={getCardClasses(plan)}>
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="gradient-primary text-white px-4 py-1 shadow-md">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4 pt-8">
                <div className="flex justify-center mb-3">
                  {getPlanIcon(plan)}
                </div>
                <CardTitle className="text-2xl mb-2 flex items-center justify-center gap-2">
                  {plan.name}
                  {plan.isDefault && <Badge variant="outline" className="text-xs">Current</Badge>}
                </CardTitle>
                
                <div className="text-center mt-4">
                  <div className="text-4xl font-bold text-foreground mb-1">
                    {plan.price}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {plan.period}
                  </div>
                  {plan.yearlyPrice && (
                    <div className="text-sm text-primary font-medium mt-2">
                      or {plan.yearlyPrice}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6 pb-8">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-foreground text-sm leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button 
                  variant={getButtonVariant(plan)}
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    if (plan.isDefault) {
                      navigate('/');
                    }
                  }}
                >
                  {plan.isDefault ? "Current Plan" : 
                   plan.isLifetime ? "Get Lifetime Access" : 
                   "Start Free Trial"}
                </Button>

                {plan.isLifetime && (
                  <div className="text-center pt-2">
                    <div className="flex items-center justify-center gap-2 text-sm text-accent">
                      <Crown className="w-4 h-4" />
                      <span className="font-medium">Founding Supporter</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="glass-card p-6 sm:p-8 text-center mb-8">
          <h2 className="text-xl font-semibold mb-4">View Your Saved Content</h2>
          <p className="text-muted-foreground mb-6">
            Access all your saved verses, reflections, devotions, sermons, and recipes in one place
          </p>
          <Button 
            onClick={() => navigate('/saved-content')}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <BookmarkCheck className="w-5 h-5" />
            View Saved Content
          </Button>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            All plans include access to our supportive community and regular updates
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-success" />
              Cancel anytime
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-success" />
              No hidden fees
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-success" />
              Secure payments
            </span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GoPremium;
