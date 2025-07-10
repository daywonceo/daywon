
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Heart, Target, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { capitalizeHabitName } from "@/lib/utils";

interface StreakRecoveryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  habitName: string;
  streakCount: number;
  onRecoveryComplete: () => void;
}

type RecoveryOption = "reflection" | "double" | "goal";

const StreakRecoveryDialog: React.FC<StreakRecoveryDialogProps> = ({
  isOpen,
  onClose,
  habitName,
  streakCount,
  onRecoveryComplete,
}) => {
  const [selectedOption, setSelectedOption] = useState<RecoveryOption | null>(null);
  const [reflection, setReflection] = useState("");
  const [goalText, setGoalText] = useState("");
  const [doubleCompleted, setDoubleCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOptionSelect = (option: RecoveryOption) => {
    setSelectedOption(option);
    setReflection("");
    setGoalText("");
    setDoubleCompleted(false);
  };

  const handleSubmit = async () => {
    if (!selectedOption) return;

    setIsSubmitting(true);

    // Validate completion based on selected option
    let isValid = false;
    switch (selectedOption) {
      case "reflection":
        isValid = reflection.trim().length >= 10; // Minimum reflection length
        break;
      case "double":
        isValid = doubleCompleted;
        break;
      case "goal":
        isValid = goalText.trim().length >= 5; // Minimum goal length
        break;
    }

    if (!isValid) {
      toast({
        title: "Incomplete",
        description: "Please complete the selected recovery option.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Save recovery data to localStorage
    const recoveryData = {
      habitName,
      option: selectedOption,
      data: selectedOption === "reflection" ? reflection : selectedOption === "goal" ? goalText : "completed",
      date: new Date().toISOString(),
      streakRestored: streakCount
    };

    const existingRecoveries = JSON.parse(localStorage.getItem('streak_recoveries') || '[]');
    existingRecoveries.push(recoveryData);
    localStorage.setItem('streak_recoveries', JSON.stringify(existingRecoveries));

    // Show success message with animation
    toast({
      title: "🎉 Streak Recovered!",
      description: `Your ${streakCount}-day streak for ${capitalizeHabitName(habitName)} has been restored!`,
    });

    onRecoveryComplete();
    onClose();
    setIsSubmitting(false);
  };

  const resetDialog = () => {
    setSelectedOption(null);
    setReflection("");
    setGoalText("");
    setDoubleCompleted(false);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetDialog();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            <span className="text-2xl">😱</span>
            <br />
            Oops! Want to save your streak?
          </DialogTitle>
          <DialogDescription className="text-center">
            Your {streakCount}-day {capitalizeHabitName(habitName)} streak is about to break! Choose a redemption option to keep it alive.
          </DialogDescription>
        </DialogHeader>

        {!selectedOption ? (
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-auto p-4 flex flex-col items-center gap-2 hover:bg-blue-50"
              onClick={() => handleOptionSelect("reflection")}
            >
              <Heart className="w-6 h-6 text-blue-600" />
              <div className="text-center">
                <div className="font-semibold">Write a 30-sec reflection</div>
                <div className="text-sm text-muted-foreground">Reflect on why this habit matters</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full h-auto p-4 flex flex-col items-center gap-2 hover:bg-green-50"
              onClick={() => handleOptionSelect("double")}
            >
              <Zap className="w-6 h-6 text-green-600" />
              <div className="text-center">
                <div className="font-semibold">Complete the habit twice today</div>
                <div className="text-sm text-muted-foreground">Make up for the missed day</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full h-auto p-4 flex flex-col items-center gap-2 hover:bg-purple-50"
              onClick={() => handleOptionSelect("goal")}
            >
              <Target className="w-6 h-6 text-purple-600" />
              <div className="text-center">
                <div className="font-semibold">Set a goal for the next 3 days</div>
                <div className="text-sm text-muted-foreground">Commit to consistency</div>
              </div>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedOption === "reflection" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Why is your {capitalizeHabitName(habitName)} habit important to you?
                </label>
                <Textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Take 30 seconds to reflect on this habit's value in your life..."
                  className="min-h-[100px]"
                />
                <div className="text-sm text-muted-foreground mt-1">
                  {reflection.length}/50 characters minimum
                </div>
              </div>
            )}

            {selectedOption === "double" && (
              <div className="text-center space-y-4">
                <p className="text-sm">Complete your {capitalizeHabitName(habitName)} habit twice today to recover your streak.</p>
                <div className="flex items-center justify-center space-x-2">
                  <input
                    type="checkbox"
                    id="doubleComplete"
                    checked={doubleCompleted}
                    onChange={(e) => setDoubleCompleted(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="doubleComplete" className="text-sm">
                    I have completed {capitalizeHabitName(habitName)} twice today
                  </label>
                </div>
              </div>
            )}

            {selectedOption === "goal" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  What's your commitment for the next 3 days?
                </label>
                <Input
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  placeholder="I will..."
                />
                <div className="text-sm text-muted-foreground mt-1">
                  Be specific about your 3-day plan
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setSelectedOption(null)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Saving Streak..." : "Recover Streak 🔥"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StreakRecoveryDialog;
