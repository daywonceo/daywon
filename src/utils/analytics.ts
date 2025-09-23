// Analytics service for tracking user interactions
interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private events: AnalyticsEvent[] = [];

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  track(event: string, properties?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      timestamp: new Date(),
    };

    this.events.push(analyticsEvent);
    
    // Log for development (in production, this would send to analytics service)
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics:', analyticsEvent);
    }

    // In production, you would send this to your analytics service
    // await this.sendToAnalyticsService(analyticsEvent);
  }

  // Onboarding-specific tracking methods
  trackCadenceSelected(cadence: string, habitCategory?: string) {
    this.track('onboarding.cadence_selected', {
      cadence,
      habit_category: habitCategory,
    });
  }

  trackFrequencyStyleSelected(style: string, habitCategory?: string) {
    this.track('onboarding.frequency_style_selected', {
      frequency_style: style,
      habit_category: habitCategory,
    });
  }

  trackTargetConfigured(period: string, targetCount: number, hasRestDays: boolean, hasTimeWindow: boolean) {
    this.track('onboarding.target_configured', {
      period,
      target_count: targetCount,
      has_rest_days: hasRestDays,
      has_time_window: hasTimeWindow,
    });
  }

  trackReminderSet(channel: string, hasTime: boolean) {
    this.track('onboarding.reminder_set', {
      reminder_channel: channel,
      has_reminder_time: hasTime,
    });
  }

  trackHabitsCreated(count: number, categories: string[], frequencyTypes: string[]) {
    this.track('onboarding.habits_created', {
      habit_count: count,
      categories: categories,
      frequency_types: frequencyTypes,
    });
  }

  trackOnboardingComplete(habitCount: number, totalTimeSeconds: number) {
    this.track('onboarding.complete', {
      habit_count: habitCount,
      total_time_seconds: totalTimeSeconds,
    });
  }

  private async sendToAnalyticsService(event: AnalyticsEvent) {
    // Implementation for sending to analytics service
    // This would be your actual analytics endpoint
    try {
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event),
      // });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }
}

export const analytics = AnalyticsService.getInstance();

// Convenience function for direct event tracking
export const trackEvent = (event: string, properties?: Record<string, any>) => {
  analytics.track(event, properties);
};