import React, { useState } from 'react';
import { Clock, MessageSquare, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import ActivityTimeline from './ActivityTimeline';
import MainFeed from './MainFeed';
import HabitLeaderboard from './HabitLeaderboard';

type Section = 'timeline' | 'feed' | 'ranks';

const sections = [
  { id: 'timeline' as Section, label: 'Timeline', icon: Clock },
  { id: 'feed' as Section, label: 'Feed', icon: MessageSquare },
  { id: 'ranks' as Section, label: 'Ranks', icon: Trophy },
];

const ActivityTab = () => {
  const [activeSection, setActiveSection] = useState<Section>('timeline');

  return (
    <div className="space-y-4">
      {/* Section Pills */}
      <div className="flex gap-2 p-1 bg-muted/50 rounded-lg w-fit">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Section Content */}
      <div className="animate-fade-in">
        {activeSection === 'timeline' && <ActivityTimeline />}
        {activeSection === 'feed' && <MainFeed />}
        {activeSection === 'ranks' && <HabitLeaderboard />}
      </div>
    </div>
  );
};

export default ActivityTab;
