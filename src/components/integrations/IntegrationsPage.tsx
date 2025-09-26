import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIntegrations } from '@/hooks/useIntegrations';
import { SpotifyIntegration } from './SpotifyIntegration';
import { GoogleFitIntegration } from './GoogleFitIntegration';
import { CalendarIntegration } from './CalendarIntegration';
import { ZapierIntegration } from './ZapierIntegration';
import { AppleHealthIntegration } from './AppleHealthIntegration';
import { MyFitnessPalIntegration } from './MyFitnessPalIntegration';
import { FitbitIntegration } from './FitbitIntegration';
import { TodoistIntegration } from './TodoistIntegration';
import { RescueTimeIntegration } from './RescueTimeIntegration';
import { HeadspaceIntegration } from './HeadspaceIntegration';
import { DiscordIntegration } from './DiscordIntegration';
import { PhilipsHueIntegration } from './PhilipsHueIntegration';
import { GoogleHomeIntegration } from './GoogleHomeIntegration';
import { SyncLogsSection } from './SyncLogsSection';
import { 
  Music, 
  Activity, 
  Calendar, 
  Zap,
  Settings,
  Smartphone,
  Cloud,
  Watch,
  Utensils,
  CheckSquare,
  Clock,
  Brain,
  MessageSquare,
  Lightbulb,
  Home
} from 'lucide-react';

const integrationConfigs = [
  {
    type: 'apple_health',
    name: 'Apple Health',
    description: 'Sync comprehensive health data from your iPhone including steps, workouts, heart rate, and sleep',
    icon: Smartphone,
    category: 'health',
    features: ['Step tracking', 'Workout detection', 'Heart rate monitoring', 'Sleep analysis', 'Auto habit completion']
  },
  {
    type: 'myfitnesspal',
    name: 'MyFitnessPal',
    description: 'Track nutrition habits with automatic food logging and calorie goal sync',
    icon: Utensils,
    category: 'nutrition',
    features: ['Food logging', 'Calorie tracking', 'Nutrition goals', 'Water intake', 'Auto habit completion']
  },
  {
    type: 'fitbit',
    name: 'Fitbit',
    description: 'Connect your Fitbit device for comprehensive fitness and health tracking',
    icon: Watch,
    category: 'fitness',
    features: ['Steps & distance', 'Heart rate', 'Sleep tracking', 'Exercise detection', 'Goal automation']
  },
  {
    type: 'todoist',
    name: 'Todoist',
    description: 'Sync your tasks and projects to automatically complete productivity habits',
    icon: CheckSquare,
    category: 'productivity',
    features: ['Task completion tracking', 'Project sync', 'Habit task creation', 'Goal automation']
  },
  {
    type: 'rescuetime',
    name: 'RescueTime',
    description: 'Monitor digital wellness with automatic screen time and productivity tracking',
    icon: Clock,
    category: 'productivity',
    features: ['Screen time tracking', 'App usage monitoring', 'Productivity scoring', 'Focus goals']
  },
  {
    type: 'headspace',
    name: 'Headspace',
    description: 'Track meditation, mindfulness, and sleep wellness activities automatically',
    icon: Brain,
    category: 'wellness',
    features: ['Meditation tracking', 'Sleep monitoring', 'Mindfulness exercises', 'Wellness goals']
  },
  {
    type: 'discord',
    name: 'Discord',
    description: 'Share your habit achievements and milestones with your Discord community',
    icon: MessageSquare,
    category: 'social',
    features: ['Achievement sharing', 'Community challenges', 'Milestone celebrations', 'Progress updates']
  },
  {
    type: 'philips_hue',
    name: 'Philips Hue',
    description: 'Create immersive lighting experiences that respond to your habit achievements',
    icon: Lightbulb,
    category: 'smart_home',
    features: ['Celebration lighting', 'Workout ambience', 'Sleep schedule automation', 'Motivational themes']
  },
  {
    type: 'google_home',
    name: 'Google Home',
    description: 'Automate your smart home environment based on habit schedules and achievements',
    icon: Home,
    category: 'smart_home',
    features: ['Voice announcements', 'Routine automation', 'Climate control', 'Achievement celebrations']
  },
  {
    type: 'spotify',
    name: 'Spotify',
    description: 'Connect to Spotify for workout playlist recommendations and music-based habit tracking',
    icon: Music,
    category: 'entertainment',
    features: ['Workout playlists', 'Music habit tracking', 'Auto-generated playlists']
  },
  {
    type: 'google_fit',
    name: 'Google Fit',
    description: 'Sync fitness data including steps, workouts, and health metrics',
    icon: Activity,
    category: 'fitness',
    features: ['Step tracking', 'Workout sync', 'Health metrics', 'Auto habit completion']
  },
  {
    type: 'calendar',
    name: 'Google Calendar',
    description: 'Sync habits with your calendar and get habit reminders',
    icon: Calendar,
    category: 'productivity',
    features: ['Calendar sync', 'Habit scheduling', 'Smart reminders']
  },
  {
    type: 'zapier',
    name: 'Zapier',
    description: 'Connect to 5000+ apps through Zapier webhooks and automations',
    icon: Zap,
    category: 'automation',
    features: ['Custom webhooks', 'Habit triggers', 'External app sync']
  }
];

export const IntegrationsPage: React.FC = () => {
  const { integrations, isLoading, isConnected } = useIntegrations();

  const getIntegrationComponent = (type: string) => {
    switch (type) {
      case 'apple_health':
        return <AppleHealthIntegration />;
      case 'myfitnesspal':
        return <MyFitnessPalIntegration />;
      case 'fitbit':
        return <FitbitIntegration />;
      case 'todoist':
        return <TodoistIntegration />;
      case 'rescuetime':
        return <RescueTimeIntegration />;
      case 'headspace':
        return <HeadspaceIntegration />;
      case 'discord':
        return <DiscordIntegration />;
      case 'philips_hue':
        return <PhilipsHueIntegration />;
      case 'google_home':
        return <GoogleHomeIntegration />;
      case 'spotify':
        return <SpotifyIntegration />;
      case 'google_fit':
        return <GoogleFitIntegration />;
      case 'calendar':
        return <CalendarIntegration />;
      case 'zapier':
        return <ZapierIntegration />;
      default:
        return null;
    }
  };

  const categoryIcons = {
    health: Smartphone,
    nutrition: Utensils,
    fitness: Activity,
    productivity: CheckSquare,
    wellness: Brain,
    social: MessageSquare,
    smart_home: Home,
    entertainment: Music,
    automation: Zap,
  };

  const categorizedIntegrations = integrationConfigs.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = [];
    }
    acc[integration.category].push(integration);
    return acc;
  }, {} as Record<string, typeof integrationConfigs>);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading integrations...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">External Integrations</h1>
        <p className="text-muted-foreground">
          Connect your favorite apps to enhance your habit tracking experience
        </p>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="connected">Connected ({integrations.filter(i => i.is_connected).length})</TabsTrigger>
          <TabsTrigger value="logs">Sync History</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-6">
          {Object.entries(categorizedIntegrations).map(([category, categoryIntegrations]) => {
            const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons];
            
            return (
              <div key={category} className="space-y-4">
                <div className="flex items-center gap-2">
                  <CategoryIcon className="w-5 h-5" />
                  <h2 className="text-xl font-semibold capitalize">{category}</h2>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categoryIntegrations.map((integration) => {
                    const IntegrationIcon = integration.icon;
                    const connected = isConnected(integration.type);
                    
                    return (
                      <Card key={integration.type} className="glass-card border-primary/20">
                        <CardHeader className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <IntegrationIcon className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{integration.name}</CardTitle>
                                <Badge variant={connected ? "default" : "secondary"} className="mt-1">
                                  {connected ? "Connected" : "Available"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <CardDescription className="text-sm">
                            {integration.description}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Features:</h4>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {integration.features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-1 h-1 rounded-full bg-primary" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="pt-2">
                            {getIntegrationComponent(integration.type)}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="connected" className="space-y-4">
          {integrations.filter(i => i.is_connected).length === 0 ? (
            <Card className="glass-card border-primary/20">
              <CardContent className="text-center py-8">
                <Cloud className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Connected Integrations</h3>
                <p className="text-muted-foreground mb-4">
                  Connect your first integration to sync data and enhance your habits
                </p>
                <Button onClick={() => {
                  const availableTab = document.querySelector('[value="available"]') as HTMLElement;
                  availableTab?.click();
                }}>
                  Browse Integrations
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {integrations
                .filter(i => i.is_connected)
                .map((integration) => {
                  const config = integrationConfigs.find(c => c.type === integration.integration_type);
                  if (!config) return null;
                  
                  const IntegrationIcon = config.icon;
                  
                  return (
                    <Card key={integration.id} className="glass-card border-primary/20">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <IntegrationIcon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{config.name}</CardTitle>
                            <Badge variant="default" className="mt-1">Connected</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                          Last sync: {integration.last_sync_at ? 
                            new Date(integration.last_sync_at).toLocaleDateString() : 
                            'Never'
                          }
                        </div>
                        
                        {getIntegrationComponent(integration.integration_type)}
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs">
          <SyncLogsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};