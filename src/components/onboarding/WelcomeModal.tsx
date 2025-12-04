import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle2, Compass, X, Zap, Calendar, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGuidedTourContext } from '@/contexts/GuidedTourContext';

const WELCOME_SHOWN_KEY = 'welcome_modal_shown';

const quickTips = [
  {
    icon: Zap,
    title: 'Start Small',
    description: 'Begin with 1-3 habits. You can always add more later!',
  },
  {
    icon: Calendar,
    title: 'Track Daily',
    description: 'Check in each day to build momentum and streaks.',
  },
  {
    icon: Users,
    title: 'Stay Connected',
    description: 'Join the community to share wins and stay motivated.',
  },
];

const WelcomeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { startTour, resetTour } = useGuidedTourContext();

  useEffect(() => {
    const onboardingComplete = localStorage.getItem('onboardingCompleted') === 'true';
    const welcomeShown = localStorage.getItem(WELCOME_SHOWN_KEY) === 'true';
    
    if (onboardingComplete && !welcomeShown) {
      // Small delay to let the UI settle after onboarding
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(WELCOME_SHOWN_KEY, 'true');
    setIsOpen(false);
  };

  const handleTakeTour = () => {
    localStorage.setItem(WELCOME_SHOWN_KEY, 'true');
    setIsOpen(false);
    // Small delay to let modal close before starting tour
    setTimeout(() => {
      resetTour();
      startTour();
    }, 300);
  };

  const handleGetStarted = () => {
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-none">
        <div className="bg-card rounded-2xl border shadow-2xl overflow-hidden">
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-6 pb-8">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-background/50 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
            
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-primary/20 animate-pulse">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Welcome to Day Won!</h2>
                <p className="text-sm text-muted-foreground">You're all set to start your journey</p>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="p-6 pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
              Quick Tips
            </h3>
            
            <div className="space-y-3 mb-6">
              {quickTips.map((tip, index) => {
                const Icon = tip.icon;
                return (
                  <div
                    key={tip.title}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-xl bg-muted/50 animate-fade-in",
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{tip.title}</p>
                      <p className="text-xs text-muted-foreground">{tip.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleGetStarted}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Get Started
              </Button>
              
              <Button
                variant="outline"
                onClick={handleTakeTour}
                className="w-full"
              >
                <Compass className="h-4 w-4 mr-2" />
                Take a Quick Tour
              </Button>
            </div>

            {/* Footer note */}
            <p className="text-xs text-center text-muted-foreground mt-4">
              You can always restart the tour from your Profile settings
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
