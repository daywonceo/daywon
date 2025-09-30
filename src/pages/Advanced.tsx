import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Users, Crown, Zap } from 'lucide-react';
import { AIInsights } from '@/components/advanced/AIInsights';
import { HabitCoach } from '@/components/advanced/HabitCoach';
import { TeamCollaboration } from '@/components/advanced/TeamCollaboration';
import { PremiumFeatures } from '@/components/advanced/PremiumFeatures';
import { AdvancedIntegrations } from '@/components/advanced/AdvancedIntegrations';
import { useAuthOptimized } from '@/hooks/useAuthOptimized';

export default function Advanced() {
  const { user } = useAuthOptimized();
  const [activeTab, setActiveTab] = useState('ai-insights');

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Advanced Features</h1>
        <p className="text-muted-foreground">
          Unlock powerful insights, collaboration tools, and premium functionality.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ai-insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="premium" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Premium
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-insights" className="space-y-6">
          <HabitCoach />
          <AIInsights userId={user?.id} />
        </TabsContent>

        <TabsContent value="teams" className="space-y-6">
          <TeamCollaboration userId={user?.id} />
        </TabsContent>

        <TabsContent value="premium" className="space-y-6">
          <PremiumFeatures userTier="free" />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <AdvancedIntegrations userTier="free" />
        </TabsContent>
      </Tabs>
    </div>
  );
}