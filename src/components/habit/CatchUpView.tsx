import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Calendar, CheckCircle2 } from 'lucide-react';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useHabits } from '@/hooks/useHabits';

interface CatchUpViewProps {
  open: boolean;
  onClose: () => void;
  userHabits: string[];
}

interface HabitActivity {
  id?: string;
  habit_id?: string;
  habit_name: string;
  activity_date: string;
  status: 'completed' | 'failed' | 'empty';
}

const CatchUpView = ({ open, onClose, userHabits }: CatchUpViewProps) => {
  const [activities, setActivities] = useState<Record<string, HabitActivity[]>>({});
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { habits } = useHabits();

  // Generate past 7 days
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(startOfDay(new Date()), i);
    return date;
  }).reverse();

  useEffect(() => {
    if (open && user) {
      loadActivities();
    }
  }, [open, user]);

  const loadActivities = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('habit_activities')
        .select('*')
        .eq('user_id', user.id)
        .gte('activity_date', format(past7Days[0], 'yyyy-MM-dd'))
        .lte('activity_date', format(past7Days[past7Days.length - 1], 'yyyy-MM-dd'));

      if (error) throw error;

      // Group activities by date
      const groupedActivities: Record<string, HabitActivity[]> = {};
      
      past7Days.forEach(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayActivities = data?.filter(activity => activity.activity_date === dateStr) || [];
        
        // Create entries for all user habits, even if not in database
        const completeActivities = userHabits.map(habitName => {
          // Find existing activity by habit name (case insensitive)
          const existingActivity = dayActivities.find(a => 
            a.habit_name.toLowerCase().trim() === habitName.toLowerCase().trim()
          );
          const habitRecord = habits?.find(h => 
            h.name.toLowerCase().trim() === habitName.toLowerCase().trim()
          );
          
          if (existingActivity) {
            return {
              id: existingActivity.id,
              habit_id: existingActivity.habit_id,
              habit_name: existingActivity.habit_name,
              activity_date: existingActivity.activity_date,
              status: existingActivity.status as 'completed' | 'failed' | 'empty'
            };
          }
          
          return {
            habit_id: habitRecord?.id,
            habit_name: habitName,
            activity_date: dateStr,
            status: 'empty' as const
          };
        });
        
        groupedActivities[dateStr] = completeActivities;
      });
      
      setActivities(groupedActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
      toast({
        title: "Error loading data",
        description: "Could not load your habit history. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleHabitStatus = async (dateStr: string, habitName: string) => {
    if (!user) return;

    const currentActivity = activities[dateStr]?.find(a => 
      a.habit_name.toLowerCase().trim() === habitName.toLowerCase().trim()
    );
    const newStatus = currentActivity?.status === 'completed' ? 'empty' : 'completed';
    const habitRecord = habits?.find(h => 
      h.name.toLowerCase().trim() === habitName.toLowerCase().trim()
    );

    if (!habitRecord) {
      toast({
        title: "Habit not found",
        description: "Could not find the habit record. Please try refreshing.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (currentActivity?.id) {
        // Update existing activity
        const { error } = await supabase
          .from('habit_activities')
          .update({ status: newStatus })
          .eq('id', currentActivity.id);
        
        if (error) throw error;
      } else if (newStatus === 'completed') {
        // Check if a record already exists before creating
        const { data: existingRecord } = await supabase
          .from('habit_activities')
          .select('id')
          .eq('user_id', user.id)
          .eq('habit_id', habitRecord.id)
          .eq('activity_date', dateStr)
          .maybeSingle();

        if (existingRecord) {
          // Update the existing record
          const { error } = await supabase
            .from('habit_activities')
            .update({ status: newStatus })
            .eq('id', existingRecord.id);
          
          if (error) throw error;
        } else {
          // Create new activity with habit_id
          const { error } = await supabase
            .from('habit_activities')
            .insert({
              user_id: user.id,
              habit_id: habitRecord.id,
              habit_name: habitName,
              activity_date: dateStr,
              status: newStatus
            });
          
          if (error) throw error;
        }
      }

      // Update local state
      setActivities(prev => ({
        ...prev,
        [dateStr]: prev[dateStr].map(activity =>
          activity.habit_name.toLowerCase() === habitName.toLowerCase()
            ? { ...activity, status: newStatus, habit_id: habitRecord.id }
            : activity
        )
      }));

      toast({
        title: newStatus === 'completed' ? "Habit marked complete!" : "Habit unmarked",
        description: `${habitName} for ${format(new Date(dateStr), 'MMM d')}`,
      });
    } catch (error) {
      console.error('Error updating activity:', error);
      toast({
        title: "Error updating habit",
        description: "Could not update your habit. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <Card className="w-full max-w-2xl max-h-[90vh] mx-4 mb-4 sm:mb-0 flex flex-col">
        <CardHeader className="flex-shrink-0 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl font-semibold">Catch Up</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Life gets busy. Let's catch up on the past week together! 
          </p>
        </CardHeader>
        
        <CardContent className="flex-grow overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {past7Days.map(date => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const dayActivities = activities[dateStr] || [];
                const isToday = isSameDay(date, new Date());
                
                return (
                  <div key={dateStr} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-base">
                          {format(date, 'EEEE, MMM d')}
                        </h3>
                        {isToday && (
                          <Badge variant="secondary" className="text-xs">Today</Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {dayActivities.filter(a => a.status === 'completed').length}/{dayActivities.length}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {dayActivities.map(activity => (
                        <Button
                          key={activity.habit_name}
                          variant={activity.status === 'completed' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleHabitStatus(dateStr, activity.habit_name)}
                          className="justify-start h-10"
                        >
                          <CheckCircle2 className={`mr-2 h-4 w-4 ${
                            activity.status === 'completed' ? 'text-white' : 'text-muted-foreground'
                          }`} />
                          {activity.habit_name}
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t">
            <Button 
              onClick={onClose} 
              className="w-full"
              size="lg"
            >
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CatchUpView;