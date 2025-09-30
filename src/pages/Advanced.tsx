import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Users, Crown, Zap } from 'lucide-react';
import { AIInsights } from '@/components/advanced/AIInsights';
import { HabitCoach } from '@/components/advanced/HabitCoach';
import { ConversationalChat } from '@/components/chat/ConversationalChat';
import { ContentGenerator } from '@/components/content/ContentGenerator';
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
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="ai-insights" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5">
            <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">AI Insights</span>
            <span className="sm:hidden">AI</span>
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5">
            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Teams</span>
          </TabsTrigger>
          <TabsTrigger value="premium" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5">
            <Crown className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Premium</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5">
            <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Integrations</span>
            <span className="sm:hidden">Apps</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-insights" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <HabitCoach />
              <ContentGenerator />
            </div>
            <div className="space-y-6">
              <ConversationalChat />
              <AIInsights userId={user?.id} />
            </div>
          </div>
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