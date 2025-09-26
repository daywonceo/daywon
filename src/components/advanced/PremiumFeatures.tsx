import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  Zap, 
  BarChart3, 
  Download, 
  Calendar,
  Users,
  Shield,
  Smartphone,
  Brain,
  Settings
} from 'lucide-react';

interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
  tier: 'basic' | 'pro' | 'enterprise';
  category: 'analytics' | 'export' | 'social' | 'ai' | 'integrations';
}

interface PremiumFeaturesProps {
  userTier?: 'free' | 'basic' | 'pro' | 'enterprise';
}

export const PremiumFeatures: React.FC<PremiumFeaturesProps> = ({ 
  userTier = 'free' 
}) => {
  const [features, setFeatures] = useState<PremiumFeature[]>([
    {
      id: 'advanced_analytics',
      name: 'Advanced Analytics',
      description: 'Detailed insights, custom reports, and trend analysis',
      icon: BarChart3,
      enabled: true,
      tier: 'basic',
      category: 'analytics'
    },
    {
      id: 'data_export',
      name: 'Enhanced Data Export',
      description: 'Export data in multiple formats with scheduling',
      icon: Download,
      enabled: false,
      tier: 'basic',
      category: 'export'
    },
    {
      id: 'ai_coaching',
      name: 'AI Coaching',
      description: 'Personalized AI-powered habit recommendations',
      icon: Brain,
      enabled: true,
      tier: 'pro',
      category: 'ai'
    },
    {
      id: 'team_management',
      name: 'Team Management',
      description: 'Create and manage teams with advanced permissions',
      icon: Users,
      enabled: false,
      tier: 'pro',
      category: 'social'
    },
    {
      id: 'priority_support',
      name: 'Priority Support',
      description: '24/7 priority customer support and onboarding',
      icon: Shield,
      enabled: true,
      tier: 'pro',
      category: 'integrations'
    },
    {
      id: 'white_label',
      name: 'White Label',
      description: 'Custom branding and white-label deployment',
      icon: Settings,
      enabled: false,
      tier: 'enterprise',
      category: 'integrations'
    },
    {
      id: 'api_access',
      name: 'API Access',
      description: 'Full API access for custom integrations',
      icon: Zap,
      enabled: false,
      tier: 'enterprise',
      category: 'integrations'
    },
    {
      id: 'mobile_sdk',
      name: 'Mobile SDK',
      description: 'SDK for native mobile app development',
      icon: Smartphone,
      enabled: false,
      tier: 'enterprise',
      category: 'integrations'
    }
  ]);

  const toggleFeature = (featureId: string) => {
    setFeatures(features.map(feature => 
      feature.id === featureId 
        ? { ...feature, enabled: !feature.enabled }
        : feature
    ));
  };

  const getTierProgress = () => {
    const tierOrder = ['free', 'basic', 'pro', 'enterprise'];
    const currentIndex = tierOrder.indexOf(userTier);
    return ((currentIndex + 1) / tierOrder.length) * 100;
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pro': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'enterprise': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const canUseFeature = (featureTier: string) => {
    const tierOrder = ['free', 'basic', 'pro', 'enterprise'];
    return tierOrder.indexOf(userTier) >= tierOrder.indexOf(featureTier);
  };

  const categorizedFeatures = features.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, PremiumFeature[]>);

  return (
    <div className="space-y-6">
      {/* Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Premium Features
            <Badge className="ml-auto capitalize">{userTier}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Plan Progress</span>
              <span className="text-sm text-muted-foreground capitalize">{userTier}</span>
            </div>
            <Progress value={getTierProgress()} className="h-2" />
            
            {userTier !== 'enterprise' && (
              <div className="flex justify-center">
                <Button className="w-full sm:w-auto">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feature Categories */}
      {Object.entries(categorizedFeatures).map(([category, categoryFeatures]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="capitalize">{category} Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryFeatures.map(feature => {
              const Icon = feature.icon;
              const available = canUseFeature(feature.tier);
              
              return (
                <div
                  key={feature.id}
                  className={`p-4 border rounded-lg ${
                    available ? 'bg-background' : 'bg-muted/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${
                      available ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      <Icon className={`h-4 w-4 ${
                        available ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-medium ${
                            available ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {feature.name}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className={`${getTierColor(feature.tier)} capitalize`}
                          >
                            {feature.tier}
                          </Badge>
                        </div>
                        
                        {available ? (
                          <Switch
                            checked={feature.enabled}
                            onCheckedChange={() => toggleFeature(feature.id)}
                          />
                        ) : (
                          <Button variant="outline" size="sm">
                            Upgrade
                          </Button>
                        )}
                      </div>
                      
                      <p className={`text-sm ${
                        available ? 'text-muted-foreground' : 'text-muted-foreground/70'
                      }`}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Usage & Limits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <span className="font-medium">AI Insights</span>
                <p className="text-sm text-muted-foreground">Monthly generation limit</p>
              </div>
              <div className="text-right">
                <div className="font-medium">47/100</div>
                <Progress value={47} className="w-16 h-2" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <span className="font-medium">Data Exports</span>
                <p className="text-sm text-muted-foreground">This month</p>
              </div>
              <div className="text-right">
                <div className="font-medium">3/10</div>
                <Progress value={30} className="w-16 h-2" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <span className="font-medium">Team Members</span>
                <p className="text-sm text-muted-foreground">Active teams</p>
              </div>
              <div className="text-right">
                <div className="font-medium">12/25</div>
                <Progress value={48} className="w-16 h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};