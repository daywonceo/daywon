import React, { useState, useMemo, useEffect } from "react";
import { ArrowLeft, Calendar, Plus, RefreshCw, History, Merge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHabits, Habit } from "@/hooks/useHabits";
// Removed deduplication functionality
import { useNavigate } from "react-router-dom";
import HabitManagementView from "@/components/habit/HabitManagementView";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import HabitFormDialog from "@/components/habit/HabitFormDialog";
import HabitAddSheet from "@/components/habit/HabitAddSheet";
import AllTimeHabitsModal from "@/components/habit/AllTimeHabitsModal";
import { capitalizeHabitName } from "@/lib/utils";
import { recordHabitActivity, loadHabitActivitiesFromDatabase } from "@/utils/habitActivity";
import { hapticSuccess } from "@/utils/haptics";
import { Check, Plus as PlusIcon, Flame, Target } from "lucide-react";
import { calculateStreakForDate } from "@/utils/habitTracking";

type FilterPeriod = "today" | "week" | "month";

const AllHabits = () => {
  const navigate = useNavigate();
  const { habits } = useHabits();
  
  // Get all active habit names (not ended or archived)
  const allActiveHabitNames = habits?.filter(h => h.status === 'active' && !h.ended_at && !h.archived_at).map(h => h.name) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-white to-blue-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-200">
      <HabitManagementView 
        open={true} 
        onClose={() => navigate("/")}
        userHabits={allActiveHabitNames}
      />
    </div>
  );
};

export default AllHabits;