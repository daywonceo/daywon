import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Trophy, Target, Calendar, TrendingUp } from 'lucide-react';
import { useHabitSocialIntegration } from '@/hooks/useHabitSocialIntegration';
import { useToast } from '@/hooks/use-toast';

interface ShareMilestoneCardProps {
  className?: string;
}

const ShareMilestoneCard = ({ className }: ShareMilestoneCardProps) => {
  const [sharing, setSharing] = useState<string | null>(null);
  const { shareHabitMilestone, getCurrentStreaks, isMilestone } = useHabitSocialIntegration();
  const { toast } = useToast();

  // Get current user streaks
  const currentStreaks = getCurrentStreaks();
  
  // Filter for shareable achievements (streaks > 0)
  const shareableHabits = currentStreaks.filter(habit => habit.streak > 0);
  
  // Separate milestones from regular streaks
  const milestones = shareableHabits.filter(habit => habit.isMilestone);
  const regularStreaks = shareableHabits.filter(habit => !habit.isMilestone);

  const handleShare = async (habitName: string) => {
    try {
      setSharing(habitName);
      const result = await shareHabitMilestone(habitName);
      
      if (result.success) {
        toast({
          title: result.isMilestone ? "Milestone Shared! 🏆" : "Progress Shared! 💪",
          description: `Your ${result.streak}-day streak on ${habitName} has been shared with your community!`,
        });
      } else {
        toast({
          title: "Sharing Failed",
          description: result.error || "Unable to share your achievement right now.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while sharing your achievement.",
        variant: "destructive",
      });
    } finally {
      setSharing(null);
    }
  };

  const getHabitIcon = (habitType: string) => {
    const icons = {
      fitness: '💪',
      reading: '📚',
      meditation: '🧘‍♀️',
      spiritual: '🙏',
      health: '💧',
      nutrition: '🥗',
      personal: '⭐',
    };
    return icons[habitType as keyof typeof icons] || '⭐';
  };

  const getStreakBadgeColor = (streak: number) => {
    if (streak >= 365) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    if (streak >= 100) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    if (streak >= 30) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    if (streak >= 7) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  if (shareableHabits.length === 0) {
    return (
      <Card className={`glass-card ${className}`}>
        <CardContent className="p-4 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-muted rounded-full mb-3">
            <Target className="text-muted-foreground" size={18} />
          </div>
          <h3 className="font-medium text-foreground mb-1 text-sm">No Active Streaks</h3>
          <p className="text-xs text-muted-foreground">
            Complete some habits to start building streaks you can share!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`glass-card ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-base">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Share2 className="text-primary" size={16} />
          </div>
          <span>Share Your Progress</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Milestones Section */}
        {milestones.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-medium text-sm text-foreground">Milestones Ready to Share</h3>
            </div>
            <div className="space-y-2">
              {milestones.map((habit) => (
                <div
                  key={habit.habitName}
                  className="flex items-center justify-between p-2.5 bg-primary/5 rounded-lg border border-primary/20"
                >
                  <div className="flex items-center space-x-2">
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        {habit.habitName}
                      </p>
                      <div className="flex items-center space-x-1.5">
                        <Badge className="bg-primary text-primary-foreground border-0 text-xs font-medium">
                          {habit.streak} days
                        </Badge>
                        <span className="text-xs text-primary font-medium">
                          Milestone!
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="h-8"
                    onClick={() => handleShare(habit.habitName)}
                    disabled={sharing === habit.habitName}
                  >
                    {sharing === habit.habitName ? (
                      <div className="w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Share2 size={12} className="mr-1" />
                        Share
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Streaks Section */}
        {regularStreaks.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-medium text-sm text-foreground">Current Streaks</h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {regularStreaks.map((habit) => (
                <div
                  key={habit.habitName}
                  className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg border border-border"
                >
                  <div className="flex items-center space-x-2">
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        {habit.habitName}
                      </p>
                      <Badge className="bg-primary/20 text-primary border-0 text-xs">
                        {habit.streak} days
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => handleShare(habit.habitName)}
                    disabled={sharing === habit.habitName}
                  >
                    {sharing === habit.habitName ? (
                      <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Share2 size={12} className="mr-1" />
                        Share
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShareMilestoneCard;