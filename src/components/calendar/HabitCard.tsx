
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import HabitActivityGraph from './HabitActivityGraph';
import { Button } from '@/components/ui/button';
import { Plus, Check } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { Habit } from '@/hooks/useHabits';
import { recordHabitActivityV2 } from '@/utils/habitActivityV2';
import { hapticSuccess } from '@/utils/haptics';
import { capitalizeHabitName } from '@/lib/utils';

type Color = 'green' | 'purple' | 'red' | 'orange' | 'blue';

interface HabitCardProps {
    habit: Habit;
    activityData: boolean[];
    color: Color;
    icon: LucideIcon;
    isCompletedToday: boolean;
    onUpdate: () => void;
}

const HabitCard = ({ habit, activityData, color, icon: Icon, isCompletedToday, onUpdate }: HabitCardProps) => {
    
    const handleToggleComplete = () => {
        const newStatus = isCompletedToday ? 'empty' : 'completed';
        recordHabitActivityV2(habit.name, newStatus, new Date());
        hapticSuccess();
        
        // Dispatch event for RecentActivities to listen to
        window.dispatchEvent(new CustomEvent('habitStatusChanged', { 
            detail: { category: habit.name, status: newStatus, date: new Date().toISOString().split('T')[0] } 
        }));
        
        onUpdate();
    };

    return (
        <Card className="bg-white border-gray-200 text-gray-900 shadow-lg">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-3 p-4">
                <div className="bg-gray-100 p-3 rounded-lg">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex-1">
                    <CardTitle className="text-base sm:text-lg font-bold">{capitalizeHabitName(habit.name)}</CardTitle>
                    {habit.description && <CardDescription className="text-xs sm:text-sm text-gray-500 mt-1">{habit.description}</CardDescription>}
                </div>
                <Button size="icon" variant="ghost" className={`rounded-full w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 ${isCompletedToday ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`} onClick={handleToggleComplete}>
                    {isCompletedToday ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </Button>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <HabitActivityGraph activityData={activityData} color={color} />
            </CardContent>
        </Card>
    );
};

export default HabitCard;
