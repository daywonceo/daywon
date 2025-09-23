import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface DailyJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  day: number;
}

const DailyJournalModal: React.FC<DailyJournalModalProps> = ({
  isOpen,
  onClose,
  date,
  day,
}) => {
  const [journalText, setJournalText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const dateStr = format(date, 'yyyy-MM-dd');
  const displayDate = format(date, 'EEEE, MMMM d, yyyy');

  // Load existing journal entry when modal opens
  useEffect(() => {
    if (isOpen) {
      loadJournalEntry();
    }
  }, [isOpen, dateStr]);

  const loadJournalEntry = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('daily_journals')
        .select('content')
        .eq('user_id', user.id)
        .eq('journal_date', dateStr)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading journal:', error);
        return;
      }

      setJournalText(data?.content || '');
    } catch (error) {
      console.error('Error loading journal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveJournalEntry = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save journal entries.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('daily_journals')
        .upsert({
          user_id: user.id,
          journal_date: dateStr,
          content: journalText.trim(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,journal_date'
        });

      if (error) {
        console.error('Error saving journal:', error);
        toast({
          title: "Error",
          description: "Failed to save journal entry. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Journal saved!",
        description: "Your daily reflection has been saved.",
      });

      onClose();
    } catch (error) {
      console.error('Error saving journal:', error);
      toast({
        title: "Error",
        description: "Failed to save journal entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setJournalText('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Daily Journal - Day {day}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{displayDate}</p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              How was your day? What are you grateful for?
            </label>
            {isLoading ? (
              <div className="h-32 bg-muted animate-pulse rounded-md" />
            ) : (
              <Textarea
                placeholder="Write about your day, thoughts, feelings, or gratitude..."
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                className="min-h-32 resize-none"
                maxLength={1000}
              />
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {journalText.length}/1000 characters
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose} disabled={isSaving}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={saveJournalEntry} 
              disabled={isSaving || isLoading || !journalText.trim()}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Journal'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DailyJournalModal;