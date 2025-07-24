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
      <Card className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 ${className}`}>
        <CardContent className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
            <Target className="text-gray-400" size={20} />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No Active Streaks</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Complete some habits to start building streaks you can share!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Share2 className="text-blue-600 dark:text-blue-400" size={20} />
          <span>Share Your Progress</span>
        </CardTitle>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Celebrate your achievements with the community
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Milestones Section */}
        {milestones.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Milestones Ready to Share</h3>
            </div>
            <div className="space-y-2">
              {milestones.map((habit) => (
                <div
                  key={habit.habitName}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                >
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">
                        {habit.habitName}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getStreakBadgeColor(habit.streak)} border-0 text-xs font-bold`}>
                          {habit.streak} days
                        </Badge>
                        <span className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">
                          Milestone!
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-sm"
                    onClick={() => handleShare(habit.habitName)}
                    disabled={sharing === habit.habitName}
                  >
                    {sharing === habit.habitName ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Share2 size={14} className="mr-1" />
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
            <div className="flex items-center space-x-2 mb-3">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Current Streaks</h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {regularStreaks.map((habit) => (
                <div
                  key={habit.habitName}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">
                        {habit.habitName}
                      </p>
                      <Badge className={`${getStreakBadgeColor(habit.streak)} border-0 text-xs`}>
                        {habit.streak} days
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20"
                    onClick={() => handleShare(habit.habitName)}
                    disabled={sharing === habit.habitName}
                  >
                    {sharing === habit.habitName ? (
                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Share2 size={14} className="mr-1" />
                        Share
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sharing tip */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Calendar className="text-blue-600 dark:text-blue-400 mt-0.5" size={14} />
            <div>
              <p className="text-xs font-medium text-blue-900 dark:text-blue-100">Pro Tip</p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Sharing your progress motivates others and helps build accountability in your community!
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShareMilestoneCard;