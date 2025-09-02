import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Habit } from '@/hooks/useHabits';

interface HabitRemovalModalProps {
  habit: Habit | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type RemovalType = 'end' | 'delete';

const HabitRemovalModal: React.FC<HabitRemovalModalProps> = ({
  habit,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [removalType, setRemovalType] = useState<RemovalType>('end');
  const [confirmationText, setConfirmationText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    setRemovalType('end');
    setConfirmationText('');
    onClose();
  };

  const handleUndo = async (habitId: string, action: 'resume' | 'restore', habitSnapshot?: Habit) => {
    try {
      if (action === 'resume') {
        await supabase.rpc('resume_habit', { p_habit: habitId });
        toast({
          title: "Habit resumed",
          description: "Your habit has been resumed successfully."
        });
      } else if (action === 'restore' && habitSnapshot) {
        // Restore the deleted habit
        const { error } = await supabase.from('habits').insert({
          id: habitSnapshot.id,
          user_id: habitSnapshot.user_id,
          name: habitSnapshot.name,
          description: habitSnapshot.description,
          category: habitSnapshot.category,
          status: habitSnapshot.status,
          default_tracking_type: habitSnapshot.default_tracking_type
        });
        
        if (error) throw error;
        
        toast({
          title: "Habit restored",
          description: "Your habit has been restored successfully."
        });
      }
      onSuccess();
    } catch (error) {
      console.error('Error during undo:', error);
      toast({
        title: "Error",
        description: "Failed to undo the action. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleContinue = async () => {
    if (!habit) return;

    if (removalType === 'delete' && confirmationText.toLowerCase() !== habit.name.toLowerCase()) {
      toast({
        title: "Confirmation failed",
        description: "Please type the exact habit name to confirm deletion.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      if (removalType === 'end') {
        const { error } = await supabase.rpc('end_habit_today', { p_habit: habit.id });
        if (error) throw error;

        toast({
          title: "Ended today",
          description: "Habit ended. Click Undo to resume.",
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUndo(habit.id, 'resume')}
            >
              Undo
            </Button>
          )
        });
      } else {
        // Keep snapshot for undo
        const habitSnapshot = { ...habit };
        
        const { error } = await supabase.rpc('delete_habit_forever', { p_habit: habit.id });
        if (error) throw error;

        toast({
          title: "Deleted",
          description: "Habit deleted permanently. Click Undo within 10 seconds.",
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUndo(habit.id, 'restore', habitSnapshot)}
            >
              Undo
            </Button>
          )
        });

        // Auto-remove undo option after 10 seconds
        setTimeout(() => {
          toast({
            title: "Undo expired",
            description: "The habit deletion is now permanent."
          });
        }, 10000);
      }

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error removing habit:', error);
      toast({
        title: "Error",
        description: "Failed to remove habit. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isDeleteConfirmed = removalType === 'delete' && 
    confirmationText.toLowerCase() === habit?.name.toLowerCase();

  const canContinue = removalType === 'end' || isDeleteConfirmed;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md h-[90vh] sm:h-auto flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Remove habit</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4 flex-grow overflow-y-auto">
          <RadioGroup value={removalType} onValueChange={(value) => setRemovalType(value as RemovalType)}>
            <div className="space-y-6 sm:space-y-4">
              <div className="flex items-start space-x-3 p-4 sm:p-3 rounded-lg border-2 border-transparent data-[state=checked]:border-primary cursor-pointer" onClick={() => setRemovalType('end')}>
                <RadioGroupItem value="end" id="end" className="mt-1" />
                <div className="space-y-1 flex-1">
                  <Label htmlFor="end" className="font-medium text-lg sm:text-base cursor-pointer">
                    End today (recommended)
                  </Label>
                  <p className="text-base sm:text-sm text-muted-foreground">
                    Stops future reminders. You can still Catch Up on missed days through today.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 sm:p-3 rounded-lg border-2 border-transparent data-[state=checked]:border-primary cursor-pointer" onClick={() => setRemovalType('delete')}>
                <RadioGroupItem value="delete" id="delete" className="mt-1" />
                <div className="space-y-1 flex-1">
                  <Label htmlFor="delete" className="font-medium text-lg sm:text-base cursor-pointer">
                    Delete forever
                  </Label>
                  <p className="text-base sm:text-sm text-muted-foreground">
                    Permanently removes this habit and all logs.
                  </p>
                </div>
              </div>
            </div>
          </RadioGroup>

          {removalType === 'delete' && (
            <div className="space-y-2 px-1">
              <Label htmlFor="confirmation" className="text-base sm:text-sm font-medium">
                Type the habit name to confirm
              </Label>
              <Input
                id="confirmation"
                type="text"
                placeholder={habit?.name || ''}
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                className="font-mono text-base sm:text-sm h-12 sm:h-10"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-2 flex-shrink-0 pt-4">
          <Button 
            variant="outline" 
            onClick={handleClose} 
            disabled={isLoading}
            className="h-12 sm:h-10 text-base sm:text-sm order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleContinue} 
            disabled={!canContinue || isLoading}
            variant={removalType === 'delete' ? 'destructive' : 'default'}
            className="h-12 sm:h-10 text-base sm:text-sm order-1 sm:order-2"
          >
            {isLoading ? 'Processing...' : 'Continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HabitRemovalModal;
