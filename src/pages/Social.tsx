import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import PageHeader from "@/components/layout/PageHeader";
import { FeatureErrorBoundary } from "@/components/errors/FeatureErrorBoundary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NotificationCenter from "@/components/social/NotificationCenter";
import FriendList from "@/components/social/FriendList";
import Groups from "@/components/social/Groups";
import ActivityTab from "@/components/social/ActivityTab";
import { useHabitSocialIntegration } from "@/hooks/useHabitSocialIntegration";
const Social = () => {
  // Initialize habit social integration (auto-creates posts on completions)
  useHabitSocialIntegration();
  return (
    <PageLayout>
      <div className="relative">
        <PageHeader 
          title="Connect & Grow" 
          subtitle="Share your journey and celebrate wins with your community"
        />
        
        {/* Notification Center */}
        <div className="absolute top-0 right-0">
          <NotificationCenter />
        </div>
      </div>

        <FeatureErrorBoundary featureName="Social Feed">
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 glass border h-11 bg-warm/20">
              <TabsTrigger value="activity" className="text-sm font-medium">
                ACTIVITY
              </TabsTrigger>
              <TabsTrigger value="groups" className="text-sm font-medium">
                GROUPS
              </TabsTrigger>
              <TabsTrigger value="friends" className="text-sm font-medium">
                FRIENDS
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="activity" className="animate-fade-in">
              <ActivityTab />
            </TabsContent>
            
            <TabsContent value="groups" className="animate-fade-in">
              <Groups />
            </TabsContent>
            
            <TabsContent value="friends" className="animate-fade-in">
              <FriendList />
            </TabsContent>
          </Tabs>
        </FeatureErrorBoundary>
    </PageLayout>
  );
};

export default Social;
