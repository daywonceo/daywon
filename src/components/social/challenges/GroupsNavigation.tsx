import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, Heart, Settings, Users, Plus } from 'lucide-react';

type TabType = 'challenges' | 'discover' | 'manage' | 'teams';

interface GroupsNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onCreateClick: () => void;
}

const GroupsNavigation = ({ activeTab, onTabChange, onCreateClick }: GroupsNavigationProps) => {
  const tabs: { id: TabType; icon: React.ReactNode; label: string }[] = [
    { id: 'challenges', icon: <Trophy size={14} className="mr-1" />, label: 'Challenges' },
    { id: 'discover', icon: <Heart size={14} className="mr-1" />, label: 'Discover' },
    { id: 'manage', icon: <Settings size={14} className="mr-1" />, label: 'Manage' },
    { id: 'teams', icon: <Users size={14} className="mr-1" />, label: 'Teams' },
  ];

  return (
    <div className="flex items-center justify-between gap-2 px-2">
      <div className="flex items-center space-x-1 bg-card rounded-lg p-1 flex-1 max-w-md">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onTabChange(tab.id)}
            className="capitalize flex-1 text-xs px-2 py-1 h-8"
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </Button>
        ))}
      </div>
      
      <Button 
        size="sm" 
        className="px-3 py-1 h-8"
        onClick={onCreateClick}
      >
        <Plus size={14} className="mr-1" />
        <span className="hidden sm:inline">Create</span>
      </Button>
    </div>
  );
};

export default GroupsNavigation;
