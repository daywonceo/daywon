
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, CheckCircle, Heart, BookOpen, ChefHat, Dumbbell, Calendar, Trophy, Target, Scroll, Church, Play, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { getHabitActivities } from "@/utils/habitActivity";
import { calculateStreakForDate } from "@/utils/habitStreaks";
import { useGuidanceActivity } from "@/hooks/useGuidanceActivity";
import { useAppSessions } from "@/hooks/useAppSessions";
import { capitalizeHabitName } from "@/lib/utils";

interface DailySummaryModalProps {
  date: Date | null;
  isOpen: boolean;
  onClose: () => void;
}

const DailySummaryModal = ({ date, isOpen, onClose }: DailySummaryModalProps) => {
  if (!date) return null;

  // Get real habit data for the selected date
  const habitActivities = getHabitActivities();
  const dateStr = date.toISOString().split('T')[0];
  
  const completedHabits = habitActivities
    .filter(activity => activity.date === dateStr && activity.status === 'completed')
    .map(activity => ({
      name: activity.habitName,
      habitId: activity.habitId,
      streak: calculateStreakForDate(activity.habitId, date)
    }));

  const failedHabits = habitActivities
    .filter(activity => activity.date === dateStr && activity.status === 'failed')
    .map(activity => ({
      name: activity.habitName,
      habitId: activity.habitId,
      streak: calculateStreakForDate(activity.habitId, date)
    }));

  // Get real time spent and guidance activities
  const { getSessionForDate } = useAppSessions();
  const { activities: guidanceActivities, loading: guidanceLoading } = useGuidanceActivity(dateStr);
  const [actualTimeSpent, setActualTimeSpent] = useState<number>(0);
  const [sectionBreakdown, setSectionBreakdown] = useState<Record<string, number>>({});
  
  useEffect(() => {
    const getSessionData = async () => {
      if (!date) return;
      
      const dateStr = date.toISOString().split('T')[0];
      const stored = localStorage.getItem('appTimeSession');
      
      // Check if it's today's data
      const today = new Date().toISOString().split('T')[0];
      if (dateStr === today && stored) {
        try {
          const data = JSON.parse(stored);
          if (data.date === today) {
            setActualTimeSpent(Math.round(data.totalTime || 0));
            setSectionBreakdown(data.sections || {});
            return;
          }
        } catch (error) {
          console.error('Error parsing stored session data:', error);
        }
      }
      
      // For past dates, try to fetch from Supabase
      try {
        const sessionData = await getSessionForDate(dateStr);
        if (sessionData) {
          setActualTimeSpent(sessionData.total_time_minutes);
          setSectionBreakdown(sessionData.section_breakdown as Record<string, number> || {});
        } else {
          // Fall back to estimation
          const estimatedTime = completedHabits.length * 15;
          setActualTimeSpent(estimatedTime);
          setSectionBreakdown({});
        }
      } catch (error) {
        console.error('Error fetching session data:', error);
        // Fall back to estimation
        const estimatedTime = completedHabits.length * 15;
        setActualTimeSpent(estimatedTime);
        setSectionBreakdown({});
      }
    };
    
    getSessionData();
  }, [date, completedHabits.length, getSessionForDate]);

  const formatDate = (date: Date) => {
    return format(date, "EEEE, MMMM d, yyyy");
  };

  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), "h:mm a");
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "verse":
        return <BookOpen className="h-4 w-4 text-purple-500" />;
      case "recipe":
        return <ChefHat className="h-4 w-4 text-orange-500" />;
      case "workout":
        return <Dumbbell className="h-4 w-4 text-blue-500" />;
      case "reflection":
        return <MessageCircle className="h-4 w-4 text-teal-500" />;
      case "devotion":
        return <Church className="h-4 w-4 text-purple-600" />;
      case "sermon":
        return <Play className="h-4 w-4 text-indigo-500" />;
      default:
        return <Heart className="h-4 w-4 text-gray-500" />;
    }
  };

  // Group activities by type
  const groupedActivities = guidanceActivities.reduce((acc, activity) => {
    if (!acc[activity.type]) {
      acc[activity.type] = [];
    }
    acc[activity.type].push(activity);
    return acc;
  }, {} as Record<string, typeof guidanceActivities>);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "verse":
        return "Bible Verses";
      case "recipe":
        return "Recipes";
      case "workout":
        return "Workouts";
      case "reflection":
        return "Reflections";
      case "devotion":
        return "Devotions";
      case "sermon":
        return "Sermons";
      default:
        return type;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Summary
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {formatDate(date)}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Habits Completed */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Habits Completed
            </h3>
            {completedHabits.length > 0 ? (
              <div className="space-y-2">
                {completedHabits.map((habit, index) => (
                  <div key={`${habit.habitId}-${index}`} className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                    <span className="text-sm font-medium">{capitalizeHabitName(habit.name)}</span>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      <span>{habit.streak} day{habit.streak !== 1 ? 's' : ''}</span>
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No habits completed this day</p>
            )}
          </div>

          {/* Failed Habits */}
          {failedHabits.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-500" />
                  Habits to Improve
                </h3>
                <div className="space-y-2">
                  {failedHabits.map((habit, index) => (
                    <div key={index} className="flex items-center justify-between bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                      <span className="text-sm font-medium">{capitalizeHabitName(habit.name)}</span>
                      <Badge variant="outline" className="text-xs">
                        Try again tomorrow
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Time Spent */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Time Spent
            </h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{actualTimeSpent} minutes</span>
                {actualTimeSpent > 0 && (
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {Math.round(actualTimeSpent / 60 * 10) / 10}h
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {Object.keys(sectionBreakdown).length > 0 ? 'Actual time tracked' : 'Estimated based on activity'}
              </p>
              
              {/* Section breakdown */}
              {Object.keys(sectionBreakdown).length > 0 && (
                <div className="mt-2 space-y-1">
                  {Object.entries(sectionBreakdown)
                    .filter(([_, time]) => time > 0)
                    .sort(([_, a], [__, b]) => b - a)
                    .slice(0, 3) // Show top 3 sections
                    .map(([section, time]) => (
                      <div key={section} className="flex justify-between text-xs text-muted-foreground">
                        <span>{section}:</span>
                        <span>{Math.round(time)}m</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Guidance Activities */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Heart className="h-5 w-5 text-purple-500" />
              Guidance Activities
            </h3>
            {guidanceLoading ? (
              <p className="text-sm text-muted-foreground">Loading activities...</p>
            ) : guidanceActivities.length > 0 ? (
              <div className="space-y-4">
                {Object.entries(groupedActivities).map(([type, activities]) => (
                  <div key={type} className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      {getActivityIcon(type)}
                      {getTypeLabel(type)}
                    </h4>
                    <div className="space-y-2">
                      {activities.map((activity) => (
                        <div key={activity.id} className="bg-accent/30 p-3 rounded-lg border border-border">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">{activity.title}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(activity.timestamp)}
                                </span>
                              </div>
                              {activity.reference && (
                                <div className="text-xs text-muted-foreground mb-1">
                                  {activity.reference}
                                </div>
                              )}
                              {activity.details && (
                                <div className="text-xs text-muted-foreground">
                                  {activity.details}
                                </div>
                              )}
                              {activity.duration && (
                                <div className="text-xs text-muted-foreground">
                                  Duration: {activity.duration} minutes
                                </div>
                              )}
                            </div>
                            {activity.category && (
                              <Badge variant="outline" className="text-xs">
                                {activity.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No guidance activities this day</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DailySummaryModal;
