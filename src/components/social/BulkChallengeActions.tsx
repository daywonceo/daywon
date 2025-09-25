import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Archive, 
  Trash2, 
  Share2, 
  Users, 
  Settings,
  CheckSquare,
  X,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Challenge {
  id: string;
  title: string;
  status: string;
  participant_count?: number;
}

interface BulkChallengeActionsProps {
  challenges: Challenge[];
  selectedChallenges: string[];
  onSelectionChange: (challengeIds: string[]) => void;
  onBulkAction: (action: string, challengeIds: string[]) => void;
  className?: string;
}

const BulkChallengeActions = ({
  challenges,
  selectedChallenges,
  onSelectionChange,
  onBulkAction,
  className
}: BulkChallengeActionsProps) => {
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const allSelected = challenges.length > 0 && selectedChallenges.length === challenges.length;
  const someSelected = selectedChallenges.length > 0 && selectedChallenges.length < challenges.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(challenges.map(c => c.id));
    }
  };

  const handleChallengeToggle = (challengeId: string) => {
    if (selectedChallenges.includes(challengeId)) {
      onSelectionChange(selectedChallenges.filter(id => id !== challengeId));
    } else {
      onSelectionChange([...selectedChallenges, challengeId]);
    }
  };

  const bulkActions = [
    {
      icon: Archive,
      label: 'Archive Selected',
      action: 'archive',
      variant: 'outline' as const,
      disabled: selectedChallenges.length === 0,
    },
    {
      icon: Share2,
      label: 'Share Selected',
      action: 'share',
      variant: 'outline' as const,
      disabled: selectedChallenges.length === 0,
    },
    {
      icon: Users,
      label: 'Invite to Selected',
      action: 'invite',
      variant: 'outline' as const,
      disabled: selectedChallenges.length === 0,
    },
    {
      icon: Trash2,
      label: 'Delete Selected',
      action: 'delete',
      variant: 'destructive' as const,
      disabled: selectedChallenges.length === 0,
    },
  ];

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    onSelectionChange([]);
  };

  if (!isSelectionMode && selectedChallenges.length === 0) {
    return (
      <div className={cn("flex justify-end", className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSelectionMode(true)}
          className="text-xs"
        >
          <CheckSquare size={14} className="mr-1" />
          Bulk Actions
        </Button>
      </div>
    );
  }

  return (
    <Card className={cn("bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center space-x-2">
            <CheckSquare size={16} />
            <span>Bulk Actions</span>
            {selectedChallenges.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {selectedChallenges.length} selected
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={exitSelectionMode}
            className="h-8 w-8 p-0"
          >
            <X size={14} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Select All Control */}
        <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Checkbox
            checked={allSelected}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm font-medium">
            {allSelected ? 'Deselect All' : someSelected ? 'Select All' : 'Select All Challenges'}
          </span>
        </div>

        {/* Challenge Selection List */}
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className={cn(
                "flex items-center space-x-3 p-2 rounded-lg border transition-colors",
                selectedChallenges.includes(challenge.id)
                  ? "border-purple-300 bg-purple-50 dark:bg-purple-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              )}
            >
              <Checkbox
                checked={selectedChallenges.includes(challenge.id)}
                onCheckedChange={() => handleChallengeToggle(challenge.id)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {challenge.title}
                </p>
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <Badge variant="outline" className="text-xs capitalize">
                    {challenge.status}
                  </Badge>
                  <span>{challenge.participant_count || 0} participants</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bulk Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {bulkActions.slice(0, 3).map((action) => (
            <Button
              key={action.action}
              variant={action.variant}
              size="sm"
              disabled={action.disabled}
              onClick={() => onBulkAction(action.action, selectedChallenges)}
              className="text-xs"
            >
              <action.icon size={12} className="mr-1" />
              {action.label}
            </Button>
          ))}
          
          {/* More actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={selectedChallenges.length === 0}
                className="text-xs"
              >
                <MoreHorizontal size={12} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {bulkActions.slice(3).map((action) => (
                <DropdownMenuItem
                  key={action.action}
                  onClick={() => onBulkAction(action.action, selectedChallenges)}
                  disabled={action.disabled}
                  className={action.variant === 'destructive' ? 'text-red-600 dark:text-red-400' : ''}
                >
                  <action.icon size={14} className="mr-2" />
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkChallengeActions;