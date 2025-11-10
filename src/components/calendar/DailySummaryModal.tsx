import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useDailySummaryData } from "./summary/useDailySummaryData";
import { CompletedHabitsSection } from "./summary/CompletedHabitsSection";
import { FailedHabitsSection } from "./summary/FailedHabitsSection";
import { TimeSpentSection } from "./summary/TimeSpentSection";
import { GuidanceActivitiesSection } from "./summary/GuidanceActivitiesSection";

interface DailySummaryModalProps {
  date: Date | null;
  isOpen: boolean;
  onClose: () => void;
}

const DailySummaryModal = ({ date, isOpen, onClose }: DailySummaryModalProps) => {
  const {
    completedHabits,
    failedHabits,
    actualTimeSpent,
    sectionBreakdown,
    guidanceActivities,
    guidanceLoading,
    handleToggleHabit
  } = useDailySummaryData(date);

  if (!date) return null;

  const formatDate = (date: Date) => {
    return format(date, "EEEE, MMMM d, yyyy");
  };

  // Check if date is within last 30 days
  const daysAgo = differenceInDays(new Date(), date);
  const canEdit = daysAgo >= 0 && daysAgo <= 30;

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
          {canEdit && daysAgo > 0 && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
              <p className="text-xs text-muted-foreground text-center">
                💡 Click on any habit below to mark it as complete or incomplete
              </p>
            </div>
          )}
          
          <CompletedHabitsSection 
            habits={completedHabits} 
            canEdit={canEdit}
            onToggle={handleToggleHabit}
            date={date}
          />

          {failedHabits.length > 0 && (
            <>
              <Separator />
              <FailedHabitsSection 
                habits={failedHabits}
                canEdit={canEdit}
                onToggle={handleToggleHabit}
                date={date}
              />
            </>
          )}

          <Separator />
          <TimeSpentSection timeSpent={actualTimeSpent} sectionBreakdown={sectionBreakdown} />

          <Separator />
          <GuidanceActivitiesSection activities={guidanceActivities} loading={guidanceLoading} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DailySummaryModal;
